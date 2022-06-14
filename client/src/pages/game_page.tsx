import React from "react";
import { RequiresSession } from "../hocs/requires_session";
import { connect, DispatchProp } from "react-redux";
import ConnBanner from "../ui/conn_banner";
import Connection from "../connection";
import {
  selectDoublesCount,
  selectIsReset,
  selectIsSpectator,
  selectSomebodyIsNice,
  selectTurnIndex,
  selectWinner,
} from "../selectors/game_selectors";
import { ReduxState } from "../store";
import GamePanel from "../ui/game_panel";
import Players from "../ui/players";
import { destroyScene } from "../3d/main";
import ChatBox from "../ui/chat";
import { Player } from "../types/store_types";
import {
  Location,
  NavigateFunction,
  useNavigate,
  useLocation,
  useParams,
} from "react-router-dom";

interface Props {
  doublesCount: number;
  winner?: Player;
  reset: boolean;
  isSpectator: boolean;
  turn: number;
  somebodyIsNice: boolean;
  authToken?: string | null;
  navigate: NavigateFunction;
  location: Location;
  mode?: string;
  room?: string;
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

  componentWillUnmount() {
    this.listeners.forEach((l) =>
      document.body.removeEventListener(l.type, l.fn, true)
    );
    destroyScene();
  }

  render() {
    const {
      mode,
      room,
      somebodyIsNice,
      authToken,
      doublesCount,
      winner,
      reset,
      turn,
    } = this.props;

    if (!mode || !room) {
      return <p>Error</p>;
    }

    return (
      <React.Fragment>
        {authToken === undefined ? null : (
          <Connection
            room={room}
            mode={mode}
            navigate={this.props.navigate}
            location={this.props.location}
          />
        )}

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

            <div id="PlayerChatWrapper">
              <Players />
              <div id="RuleBox" className={`TabContainer Rules`}>
                <h2 className="HideMobile">Rules</h2>
                <p>
                  Take turns rolling the dice, trying to reach a winning score.
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
                    <strong>Sevens:</strong> split.
                  </li>
                  <li>
                    <strong>Doubles:</strong> roll again.
                  </li>
                  <li>
                    If you match another player's score, they are{" "}
                    <strong>reset</strong> to 0.
                  </li>
                </ul>
              </div>
              <div className={`TabContainer Chat`}>
                <ChatBox />
              </div>
            </div>
            <GamePanel />
          </div>
        </React.Fragment>
      </React.Fragment>
    );
  }
}

const HookMeUp = (C: any) => {
  return function () {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const navigate = useNavigate();
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const location = useLocation();
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { mode, room } = useParams();
    return (
      <C navigate={navigate} location={location} mode={mode} room={room} />
    );
  };
};

const mapStateToProps = (state: ReduxState) => {
  return {
    doublesCount: selectDoublesCount(state),
    winner: selectWinner(state),
    turn: selectTurnIndex(state),
    reset: selectIsReset(state),
    isSpectator: selectIsSpectator(state),
    somebodyIsNice: selectSomebodyIsNice(state),
    authToken: state.auth.authToken,
  };
};

const ConnectedGamePage = connect(mapStateToProps)(GamePage);

export default HookMeUp(RequiresSession(ConnectedGamePage));
