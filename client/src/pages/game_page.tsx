import React, { FormEvent } from "react";
import Linkify from "react-linkify";
import { connect, DispatchProp } from "react-redux";
import { RouteComponentProps } from "react-router-dom";
import ConnBanner from "../ui/conn_banner";
import "../App.css";
import Connection from "../connection";
import {
  selectDoublesCount,
  selectIsReset,
  selectIsSpectator,
  selectSomebodyIsNice,
  selectTurnIndex,
  selectWinner,
} from "../selectors/game_selectors";
import { Player, ReduxState } from "../store";
import GamePanel from "../ui/game_panel";
import Players from "../ui/players";
import { ThemeContext } from "../themes";
import { destroyScene } from "../3d/main";

interface TParams {
  room: string;
  mode: string;
}

interface Props {
  route: RouteComponentProps<TParams>;
  socket?: WebSocket;
  chat: string[];
  doublesCount: number;
  winner?: Player;
  reset: boolean;
  isSpectator: boolean;
  turn: number;
  somebodyIsNice: boolean;
}

const clearSelection = () => {
  if (window.getSelection) {
    if (window.getSelection()!.hasOwnProperty("empty")) {
      // Chrome
      window.getSelection()!.empty();
    } else if (window.getSelection()!.hasOwnProperty("removeAllRanges")) {
      // Firefox
      window.getSelection()!.removeAllRanges();
    }
  }
};

const zones = [
  "App",
  "GamePanel",
  "GamePage",
  "EmptyDiceBox",
  "PlayerChatWrapper",
];
class GamePage extends React.Component<Props & DispatchProp> {
  inputRef: React.RefObject<HTMLInputElement>;
  listeners: any[] = [];
  doubleTap: boolean = false;
  doubleTapTimer: number | undefined;
  constructor(props: Props & DispatchProp) {
    super(props);
    this.inputRef = React.createRef();
  }
  componentDidMount() {
    if (!document.cookie.includes("_session")) {
      this.props.route.history.replace("/", {
        redirect: this.props.route.history.location.pathname,
      });
    } else {
      // setup click handlers
      const mouseClick = (e: any) => {
        if (zones.includes(e.target.id || e.target.className.split(" ")[0])) {
          if (this.doubleTap) {
            document.dispatchEvent(
              new CustomEvent("snapDice", {
                detail: {
                  x: e.x / window.innerWidth,
                  y: e.y / window.innerHeight,
                },
              })
            );
            this.doubleTap = false;
            if (this.doubleTapTimer) {
              clearTimeout(this.doubleTapTimer);
              this.doubleTapTimer = undefined;
            }
            clearSelection();
            e.preventDefault();
          } else {
            this.doubleTap = true;
            this.doubleTapTimer = setTimeout(() => {
              this.doubleTap = false;
              this.doubleTapTimer = undefined;
            }, 300) as any;
          }
        }
      };
      document.body.addEventListener("click", mouseClick, true);
      this.listeners.push("click", mouseClick);
    }
  }

  componentWillUnmount() {
    this.listeners.forEach((l) =>
      document.body.removeEventListener(l.type, l.fn, true)
    );
    destroyScene();
  }

  sendChat = (e: FormEvent) => {
    if (this.props.socket) {
      if (this.inputRef.current && this.inputRef.current.value) {
        switch (this.inputRef.current.value.toLowerCase().split(" ")[0]) {
          case "/help":
            const helpString = `--------------------HELP--------------------
/name [string] - change your username
/hints - toggle gameplay hints
/dark - night mode
/light - day mode
/3d - 3D dice! [EXPERIMENTAL]
----------------------------------------------
`;
            helpString
              .split("\n")
              .forEach((msg) => this.props.dispatch({ type: "chat", msg }));
            break;
          case "/name":
          case "/username":
          case "/n":
          case "/u":
            const name = this.inputRef.current.value
              .split(" ")
              .slice(1)
              .join(" ");
            this.props.socket.send(
              JSON.stringify({ type: "update_name", name })
            );
            localStorage.setItem("name", name);
            break;
          case "/night":
          case "/dark":
            this.props.dispatch({ type: "THEME_DARK" });
            break;
          case "/day":
          case "/light":
            this.props.dispatch({ type: "THEME_LIGHT" });
            break;
          case "/hints":
          case "/hint":
          case "/cheat":
          case "/cheats":
          case "/guide":
            this.props.dispatch({ type: "CHEATS" });
            break;
          case "/3d":
            this.props.dispatch({ type: "TOGGLE_3D" });
            break;
          default:
            this.props.socket.send(
              JSON.stringify({ type: "chat", msg: this.inputRef.current.value })
            );
        }
        this.inputRef.current.value = "";
      }
    }
    e.preventDefault();
  };

  render() {
    const {
      route,
      somebodyIsNice,
      doublesCount,
      winner,
      reset,
      turn,
    } = this.props;
    const { location } = route;
    const { hash } = location;

    const rulesSel = !hash || hash === "#rules";
    const chatSel = hash === "#chat";
    const minimized = !rulesSel && !chatSel;

    if (!document.cookie.includes("_session")) {
      return null;
    }
    return (
      <ThemeContext.Consumer>
        {(theme) => (
          <React.Fragment>
            {doublesCount ? (
              <h6 key={doublesCount} id="Doubles">
                Doubles!
              </h6>
            ) : null}
            {somebodyIsNice ? <h6 id="Nice">Nice (ꈍoꈍ)</h6> : null}
            {reset ? <h6 id="Reset">Reset!</h6> : null}
            {winner ? (
              <h6 id="Victory">{winner.name || `User${turn + 1}`} Wins!</h6>
            ) : null}
            <div className="GamePage">
              <ConnBanner />
              <Connection
                room={this.props.route.match.params.room}
                mode={this.props.route.match.params.mode}
                history={this.props.route.history}
              />
              <div id="PlayerChatWrapper">
                <Players />
                <ul className="TabHeader">
                  <a
                    style={{
                      ...theme.tab,
                      ...(rulesSel ? theme.tabHighlight : {}),
                    }}
                    href="#rules"
                  >
                    <li>Rules</li>
                  </a>
                  <a
                    style={{
                      ...theme.tab,
                      ...(chatSel ? theme.tabHighlight : {}),
                    }}
                    href="#chat"
                  >
                    <li>Chat</li>
                  </a>
                  <a
                    style={{
                      ...theme.tab,
                      ...(minimized ? theme.tabHighlight : {}),
                    }}
                    href="#minimized"
                  >
                    <li>Minimize</li>
                  </a>
                </ul>
                <div
                  id="RuleBox"
                  className={`TabContainer Rules ${
                    hash && hash !== "#rules" ? " HideMobile" : ""
                  }`}
                >
                  <h2 className="HideMobile">Rules</h2>
                  <p>
                    Each roll, you may add or subtract the total value shown on
                    the dice from your score.
                  </p>
                  <p>Winning Scores:</p>
                  <ul>
                    <li>33</li>
                    <li>66, 67</li>
                    <li>98, 99, 100</li>
                  </ul>
                  <p>Additional Rules:</p>
                  <ul>
                    <li>
                      If you roll doubles, you <strong>must</strong> roll again.
                    </li>
                    <li>
                      If you match a player's score, they are{" "}
                      <strong>reset</strong> to 0.
                    </li>
                    <li>
                      If you roll a seven, you may <strong>split</strong> the
                      dice into 2 rolls.
                    </li>
                  </ul>
                </div>
                <div
                  className={`TabContainer Chat ${
                    hash !== "#chat" ? " HideMobile" : ""
                  }`}
                >
                  <form onSubmit={this.sendChat}>
                    <input
                      ref={this.inputRef}
                      maxLength={400}
                      placeholder="Type a message..."
                      disabled={this.props.isSpectator}
                    ></input>
                    <button type="submit" disabled={this.props.isSpectator}>
                      Send
                    </button>
                  </form>
                  <div className="Messages">
                    {this.props.chat.map((msg, i) => (
                      <React.Fragment key={i}>
                        <ChatMsg msg={msg} />
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              </div>
              <GamePanel />
            </div>
          </React.Fragment>
        )}
      </ThemeContext.Consumer>
    );
  }
}

const LinkDecorator = (
  decoratedHref: string,
  decoratedText: string,
  key: number
) => {
  return (
    <a href={decoratedHref} target="_blank" key={key} rel="noreferrer">
      {decoratedText}
    </a>
  );
};

const ChatMsg = (props: { msg: string }) => {
  return (
    <Linkify componentDecorator={LinkDecorator}>
      <p>{props.msg}</p>
    </Linkify>
  );
};

const mapStateToProps = (state: ReduxState) => {
  return {
    socket: state.socket,
    chat: state.chat,
    doublesCount: selectDoublesCount(state),
    winner: selectWinner(state),
    turn: selectTurnIndex(state),
    reset: selectIsReset(state),
    isSpectator: selectIsSpectator(state),
    somebodyIsNice: selectSomebodyIsNice(state),
  };
};

const ConnectedGamePage = connect(mapStateToProps)(GamePage);

export default (a: RouteComponentProps<TParams>) => (
  <ConnectedGamePage route={a} />
);
