import { AnyAction, createStore, Reducer } from "redux";
import { Theme, themes } from "./themes";

import { initScene, destroyScene } from "./3d/main";

export interface Player {
  connected: boolean;
  name: string;
  score: number;
  win_count: number;
  crowned?: boolean;
}

export interface DieRoll {
  used: boolean;
  value: number;
}
export interface ReduxState {
  players: Player[];
  rolls: DieRoll[];
  rolled: false;
  rolled3d: false;
  turn_index: number;
  self_index: number;
  victory: boolean;
  socket?: WebSocket;
  connected: boolean;
  rollCount: number;
  doublesCount: number;
  chat: string[];
  reset: boolean;
  settings: {
    cheats: boolean;
    sick3dmode: boolean;
    theme: Theme;
  };
}

const initialState: ReduxState = {
  players: [],
  rolls: [],
  rolled: false,
  rolled3d: false,
  turn_index: 0,
  self_index: 0,
  victory: false,
  rollCount: 0,
  doublesCount: 0,
  connected: false,
  chat: [],
  reset: false,
  settings: {
    cheats: (localStorage.getItem("cheats") || "false") === "true",
    sick3dmode: (localStorage.getItem("sick3dmode") || "false") === "true",
    theme:
      themes[
        (localStorage.getItem("theme") || "light") as keyof typeof themes
      ] || themes.light,
  },
};

export const TARGET_SCORES = [33, 66, 67, 98, 99, 100];

const CHAT_BUFFER_LENGTH = 200;

const rootReducer: Reducer<ReduxState> = (
  state: ReduxState = initialState,
  action: AnyAction
) => {
  switch (action.type) {
    case "WEBSOCKET":
      return {
        ...state,
        socket: action.socket,
      };
    case "FINISH_3D_ROLL":
      return {
        ...state,
        rolled3d: true,
      };
    case "THEME_DARK":
      localStorage.setItem("theme", "dark");
      return {
        ...state,
        settings: {
          ...state.settings,
          theme: themes.dark,
        },
      };
    case "TOGGLE_THEME":
      localStorage.setItem(
        "theme",
        state.settings.theme === themes.dark ? "light" : "dark"
      );
      return {
        ...state,
        settings: {
          ...state.settings,
          theme:
            state.settings.theme === themes.dark ? themes.light : themes.dark,
        },
      };
    case "THEME_LIGHT":
      localStorage.setItem("theme", "light");
      return {
        ...state,
        settings: {
          ...state.settings,
          theme: themes.light,
        },
      };
    case "TOGGLE_3D":
      const new3dmode = !state.settings.sick3dmode;
      if (new3dmode) {
        initScene(state);
      } else {
        destroyScene();
      }
      localStorage.setItem("sick3dmode", JSON.stringify(new3dmode));
      const new3dState = {
        ...state,
        chat: [
          `3D mode ${state.settings.sick3dmode ? "disabled" : "enabled"}.`,
          ...state.chat,
        ],
        settings: {
          ...state.settings,
          sick3dmode: new3dmode,
        },
      };
      new3dState.chat.length = Math.min(
        new3dState.chat.length,
        CHAT_BUFFER_LENGTH
      );
      return new3dState;
    case "CHEATS":
      localStorage.setItem("cheats", JSON.stringify(!state.settings.cheats));
      const newCheatState = {
        ...state,
        chat: [
          `Hints ${state.settings.cheats ? "disabled" : "enabled"}.`,
          ...state.chat,
        ],
        settings: {
          ...state.settings,
          cheats: !state.settings.cheats,
        },
      };
      newCheatState.chat.length = Math.min(
        newCheatState.chat.length,
        CHAT_BUFFER_LENGTH
      );
      return newCheatState;
    case "welcome":
      const { game } = action;
      const rolls = [];
      for (let i = 0; i < game.rolls.length; ++i) {
        rolls.push({ used: game.used[i], value: game.rolls[i] });
      }
      const welcomeState = Object.assign(
        {},
        state,
        initialState,
        game,
        { connected: state.connected },
        { players: game.players },
        { self_index: action.id },
        { rolls },
        { settings: state.settings },
        { rolled3d: state.rolled3d }
      );
      if (state.settings.sick3dmode) {
        initScene(welcomeState);
      }
      return welcomeState;
    case "join":
      if (!state.players.length) {
        return state;
      }
      if (action.id === state.self_index) {
        return state;
      }
      return {
        ...state,
        players: state.players.concat({
          connected: true,
          name: "",
          score: 0,
          win_count: 0,
        }),
      };

    case "socket_open":
      return {
        ...state,
        connected: true,
      };
    case "socket_close":
      return {
        ...state,
        connected: false,
      };
    case "disconnect":
    case "reconnect":
      return {
        ...state,
        players: state.players.map((p: Player, i: number) =>
          i !== action.id ? p : { ...p, connected: action.type === "reconnect" }
        ),
      };
    case "update":
      return {
        ...state,
        players: state.players.map((p: Player, i: number) =>
          i !== action.id ? p : { ...p, score: action.score }
        ),
        rolls:
          "used" in action
            ? action.used.map((used: boolean, i: number) => ({
                used,
                value: state.rolls[i].value,
              }))
            : state.rolls,
        reset: action.reset,
      };
    case "update_name":
      return {
        ...state,
        players: state.players.map((p: Player, i: number) =>
          i !== action.id ? p : { ...p, name: action.name }
        ),
      };
    case "update_turn":
      return {
        ...state,
        turn_index: action.id,
        rolled: false,
        rolled3d: false,
      };
    case "roll_again":
      return {
        ...state,
        rolled: false,
        rolled3d: false,
      };
    case "leave":
    case "kick":
      if (state.self_index === action.id) {
        // We've been kicked, uh oh
        window.history.replaceState({}, "", "/home");
        return {
          ...initialState,
        };
      }
      return {
        ...state,
        players: [
          ...state.players.slice(0, action.id),
          ...state.players.slice(action.id + 1),
        ],
        self_index:
          action.id < state.self_index
            ? state.self_index - 1
            : state.self_index,
      };
    case "roll":
      document.dispatchEvent(
        new CustomEvent<any>("roll", {
          detail: { rolls: action.rolls, turn_index: state.turn_index },
        })
      );
      return {
        ...state,
        rolls: action.rolls.map((roll: number) => ({
          value: roll,
          used: false,
        })),
        rolled: true,
        rolled3d: false,
        rollCount: state.rollCount + 1,
      };
    case "win":
      return {
        ...state,
        victory: true,
      };
    case "restart":
      return {
        ...initialState,
        connected: state.connected,
        rolls: state.rolls,
        players: state.players.map((p) => ({ ...p, score: 0 })),
        turn_index: action.id,
        self_index: state.self_index,
        chat: state.chat,
        settings: state.settings,
        socket: state.socket,
      };
    case "chat":
      const newState = {
        ...state,
        chat: [action.msg, ...state.chat],
      };
      newState.chat.length = Math.min(newState.chat.length, CHAT_BUFFER_LENGTH);
      return newState;
    case "DOUBLES":
      return {
        ...state,
        doublesCount: state.doublesCount + 1,
      };
    default:
      if (!action.type.includes("@@"))
        console.error("RECEIVED UNKNOWN ACTION", action);
  }
  return state;
};

export const selectState = (state: ReduxState) => state;

export const store = createStore(
  rootReducer,
  (window as any).__REDUX_DEVTOOLS_EXTENSION__ &&
    (window as any).__REDUX_DEVTOOLS_EXTENSION__()
);

(window as any).REDUX_STORE = store;
