import React from "react";
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
import ChatBox from "../ui/chat";

interface TParams {
  room: string;
  mode: string;
}

interface Props {
  route: RouteComponentProps<TParams>;
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
                  <ChatBox />
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

const mapStateToProps = (state: ReduxState) => {
  return {
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
