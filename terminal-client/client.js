const WebSocket = require("ws");
const blessed = require("blessed");
const args = require('yargs').argv;

const room = args.room || args.r || "wKvsbw";
const host = args.host || args.h || "rollycubes.com";
const port = args.port || args.p;
const insecure = args.insecure || args.i || false;
const protocol = insecure ? "ws" : "wss";

const state = {
  room,
  self_index: 0,
  game: {
    players: [],
    rolled: false,
    rolls: [],
    used: [],
    victory: false,
    turn_index: 0,
  },
};

var screen = blessed.screen({
  smartCSR: true,
});

var form = blessed.form({
  parent: screen,
  left: 0,
  bottom: 0,
  weight: "100%",
  height: 1,
  keys: true,
});

var column = blessed.box({
  width: "30%",
  parent: screen,
  right: 1,
  top: 2,
  height: screen.height - 3,
});

var chatbox = blessed.log({
  valign: "bottom",
  label: "Chat",
  parent: screen,
  left: 0,
  top: 2,
  height: screen.height - 3,
  width: "65%",
  border: "line",
  style: {
    border: {
      fg: "white",
    },
  },
});

var players = blessed.box({
  parent: column,
  width: "100%",
  height: column.height - 8,
  top: 0,
  label: "Players",
  border: "line",
  tags: true,
  style: {
    border: {
      fg: "white",
    },
  },
});

var dice = blessed.box({
  align: "center",
  parent: column,
  noCellBorders: true,
  width: "100%",
  height: 5,
  bottom: 2,
  tags: true,
});

var statusline = blessed.log({
  parent: screen,
  left: 0,
  top: 0,
  height: 1,
  width: "65%",
});

function printPlayers() {
  players.setContent(
    state.game.players.reduce(
      (acc, s, i) =>
        `${acc}\n${s.connected ? "" : "{red-fg}"}${
          i === state.game.turn_index
            ? state.game.victory
              ? "{green-fg}"
              : "> "
            : ""
        }${s.name || `User${i + 1}`}{|}${s.score}{/}`,
      ""
    )
  );
}

const rolls = [
  [
    "         ",
    " o       ",
    " o       ",
    " o     o ",
    " o     o ",
    " o     o ",
  ],
  [
    "         ",
    "         ",
    "         ",
    "         ",
    "         ",
    "         ",
  ],
  [
    "    o    ",
    "         ",
    "    o    ",
    "         ",
    "    o    ",
    " o     o ",
  ],
  [
    "         ",
    "         ",
    "         ",
    "         ",
    "         ",
    "         ",
  ],
  [
    "         ",
    "       o ",
    "       o ",
    " o     o ",
    " o     o ",
    " o     o ",
  ],
];
let pip = "•";
function printDice() {
  dice.setContent(
    rolls
      .map((row) =>
        state.game.rolls
          .map((a) => `{black-fg}{white-bg}${row[a - 1]}{/}`)
          .join("  ")
      )
      .join("\n")
      .replace(/o/g, pip)
  );
}

async function redirect(action) {
  state.room = action.room;
  await ws.close();
}

async function welcome(action) {
  state.game = action;
  chatbox.setContent("");
  if (action.chatLog) {
    action.chatLog.reverse().forEach((msg) => chatbox.log(msg));
  }
  statusline.log(`${insecure ? 'http' : 'https'}://${host}${port !== undefined ? `:${port}` : ''}/room/${state.room}`);
  printPlayers();
  printDice();
  state.self_index = action.id;
}

async function join(action) {
  if (action.id >= state.game.players.length) {
    state.game.players.push({
      name: "",
      score: 0,
      win_count: 0,
      connected: true,
    });
  }
}

async function disconnect(action) {
  state.game.players[action.id].connected = false;
  printPlayers();
}

async function reconnect(action) {
  state.game.players[action.id].connected = true;
  printPlayers();
}

async function roll(action) {
  state.game.rolls = action.rolls;
  state.game.rolled = true;
  printDice();
}

async function update(action) {
  state.game.players[action.id].score = action.score;
  printPlayers();
}

async function update_turn(action) {
  state.game.rolled = false;
  state.game.used = new Array(state.game.used.length);
  state.game.turn_index = action.id;
  printPlayers();
}

async function chat(action) {
  chatbox.log(action.msg);
}

async function kick(action) {
  await ws.close();
}

async function leave(action) {
  await ws.close();
}

async function roll_again(action) {
  state.game.rolled = false;
  state.game.used = new Array(state.game.used.length);
}

async function update_name(action) {
  state.game.players[action.id].name = action.name;
  printPlayers();
}

async function win(action) {
  state.game.players[action.id].win_count += 1;
  state.game.victory = true;
  printPlayers();
}

async function restart(action) {
  state.game.used = new Array(state.game.used.length);
  for (const player of state.game.players) {
    player.score = 0;
  }
  state.game.turn_index += 1;
  state.game.turn_index %= state.game.players.length;
  state.game.victory = false;
  printPlayers();
}

const ACTION_MAP = {
  redirect: redirect,
  welcome: welcome,
  join: join,
  reconnect: reconnect,
  disconnect: disconnect,
  roll: roll,
  update: update,
  update_turn: update_turn,
  chat: chat,
  kick: kick,
  leave: leave,
  roll_again: roll_again,
  update_name: update_name,
  win: win,
  restart: restart,
};

let ws = undefined;

function setupSocket() {
  const s = new WebSocket(`${protocol}://${host}${port !== undefined ? `:${port}` : ''}/ws/room/${state.room}`, {
    headers: {
      Cookie: "_session=nomnomjs",
    },
  });

  s.on("open", () => {
    // console.log("opened!")
  });

  s.on("close", () => {
    // console.log("reconnecting!");
    setupSocket();
  });

  s.on("message", async (data) => {
    const action = JSON.parse(data);
    if (action) {
      if (action.hasOwnProperty("error")) {
        chatbox.log(action);
      } else {
        await ACTION_MAP[action.type](action);
        screen.render();
      }
    }
  });
  ws = s;
}

setupSocket();

var inp = blessed.textbox({
  parent: form,
  left: 0,
  top: 0,
  inputOnFocus: true,
  width: "100%",
  height: 1,
});

inp.key(["escape", "C-c"], function() {
  screen.leave();
  process.exit(0);
});

inp.focus();

form.on("submit", function(data) {
  if (inp.value && inp.value.startsWith("/")) {
    if (inp.value.startsWith("/rules")) {
      chatbox.log("");
      chatbox.log("****** Game Overview ******");
      chatbox.log("Take turns rolling both dice. Each turn,");
      chatbox.log("choose to add or subtract the dice from your score.");
      chatbox.log("Your goal is to get a score of either:");
      chatbox.log("");
      chatbox.log("    33");
      chatbox.log("  66  67");
      chatbox.log(" 98 99 100");
      chatbox.log("");
      chatbox.log("Additional rules:");
      chatbox.log("Doubles - you MUST roll again.");
      chatbox.log("Sevens - SPLIT: add each die individually");
      chatbox.log("Reset - Match another player's score, and their");
      chatbox.log("score will be reset to zero.");
      chatbox.log("");
    } else if (inp.value.startsWith("/restart")) {
      ws.send(JSON.stringify({ type: "restart" }));
    } else if (inp.value.startsWith("/r")) {
      ws.send(JSON.stringify({ type: "roll" }));
    } else if (inp.value.startsWith("/sa")) {
      ws.send(JSON.stringify({ type: "sub_nth", n: 0 }));
      ws.send(JSON.stringify({ type: "add_nth", n: 1 }));
    } else if (inp.value.startsWith("/as")) {
      ws.send(JSON.stringify({ type: "add_nth", n: 0 }));
      ws.send(JSON.stringify({ type: "sub_nth", n: 1 }));
    } else if (inp.value.startsWith("/a")) {
      if (state.game.rolls.reduce((a, b) => a + b, 0) === 7) {
        ws.send(JSON.stringify({ type: "add_nth", n: 0 }));
        ws.send(JSON.stringify({ type: "add_nth", n: 1 }));
      } else {
        ws.send(JSON.stringify({ type: "add" }));
      }
    } else if (inp.value.startsWith("/s")) {
      if (state.game.rolls.reduce((a, b) => a + b, 0) === 7) {
        ws.send(JSON.stringify({ type: "sub_nth", n: 0 }));
        ws.send(JSON.stringify({ type: "sub_nth", n: 1 }));
      } else {
        ws.send(JSON.stringify({ type: "sub" }));
      }
    } else if (inp.value.startsWith("/pip")) {
      const splitten = inp.value.split(" ");
      if (splitten.length > 1) {
        splitten.shift();
        const name = splitten.join(" ");
        pip = name[0];
        printDice();
      }
    } else if (inp.value.startsWith("/n")) {
      const splitten = inp.value.split(" ");
      if (splitten.length > 1) {
        splitten.shift();
        const name = splitten.join(" ");
        ws.send(JSON.stringify({ type: "update_name", name }));
      } else {
        ws.send(JSON.stringify({ type: "update_name", name: "" }));
      }
    } else if (inp.value.startsWith("/q")) {
      screen.leave();
      process.exit(0);
    } else if (inp.value.startsWith("/h")) {
      chatbox.log("");
      chatbox.log("****** Possible commands ******");
      chatbox.log("/[r]oll - roll the dice");
      chatbox.log("/[a]dd - add both to your score");
      chatbox.log("/[s]ubtract - subtract both from your score");
      chatbox.log("/as - split: add first, subtract second");
      chatbox.log("/sa - split: subtract first, add second");
      chatbox.log("/[q]uit - quit the game :(");
      chatbox.log("/[n]ame - set or clear your name");
      chatbox.log("/[h]elp - show this page");
      chatbox.log("/restart - start a new game");
      chatbox.log("/rules - show an overview of the game");
      chatbox.log("/pip [c] - set the pip to character [c]");
      chatbox.log("");
    } else {
      chatbox.log("Unknown command. Try /help");
    }
  } else if (inp.value) {
    ws.send(JSON.stringify({ type: "chat", msg: inp.value }));
  }

  form.reset();
  screen.render();
  inp.focus();
});

inp.key(["enter"], function() {
  form.submit();
});

screen.on("resize", () => {
  chatbox.height = screen.height - 3;
  column.height = screen.height - 3;
  players.height = column.height - 8;
  chatbox.setScrollPerc(100);
  screen.render();
});

screen.render();
