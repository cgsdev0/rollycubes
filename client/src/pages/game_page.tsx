import React from "react";
import { connect, DispatchProp } from "react-redux";
import {
  Location,
  NavigateFunction,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import OnboardPage from "./onboard_page";
import { css } from "stitches.config";
import Connection from "../connection";
import { RequiresSession } from "../hocs/requires_session";
import {
  selectDoublesCount,
  selectIsReset,
  selectIsSpectator,
  selectSomebodyIsNice,
  selectTurnIndex,
  selectWinner,
} from "../selectors/game_selectors";
import { ReduxState } from "../store";
import { Player } from "../types/store_types";
import ChatBox from "../ui/chat";
import GamePanel from "../ui/game_panel";
import Players from "../ui/players";

interface Props {
  doublesCount: number;
  winner?: Player;
  reset: boolean;
  isSpectator: boolean;
  turn: number;
  somebodyIsNice: boolean;
  authToken?: string | null;
}

const flexColumn = css({
  display: "flex",
  flexDirection: "column",
});

const GamePage: React.FC<Props & DispatchProp> = ({
  somebodyIsNice,
  authToken,
  doublesCount,
  winner,
  reset,
  turn,
}) => {

  const [hasOnboarded, setHasOnboarded] = React.useState(false);
  const navigate = useNavigate();
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const location = useLocation();
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { mode, room } = useParams();

  if (!mode || !room) {
    return <p>Error</p>;
  }

  if (authToken === null && !hasOnboarded && mode === "room") {
    return <OnboardPage intent={`${mode}/${room}`} onBoard={() => setHasOnboarded(true)}/>;
  }
  return (
    <React.Fragment>
      {authToken === undefined ? null : (
        <Connection
          room={room}
          mode={mode}
          navigate={navigate}
          location={location}
        />
      )}

      {/* TODO: Refactor all this garbage */}
      {/* {doublesCount ? ( */}
      {/*   <h6 key={doublesCount} id="Doubles"> */}
      {/*     Doubles! */}
      {/*   </h6> */}
      {/* ) : null} */}
      {/* {somebodyIsNice ? <h6 id="Nice">Nice (ꈍoꈍ)</h6> : null} */}
      {/* {reset ? <h6 id="Reset">Reset!</h6> : null} */}
      {/* {winner ? ( */}
      {/*   <h6 id="Victory">{winner.name || `User${turn + 1}`} Wins!</h6> */}
      {/* ) : null} */}

      {/* <ConnBanner /> */}

      <div className={flexColumn()}>
        <GamePanel />
        <Players />
      </div>
      <ChatBox />
    </React.Fragment>
  );
};

const Rules = () => {
  return (
    <div>
      <h2>Rules</h2>
      <p>Take turns rolling the dice, trying to reach a winning score.</p>
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
          If you match another player's score, they are <strong>reset</strong>{" "}
          to 0.
        </li>
      </ul>
    </div>
  );
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

export default RequiresSession(ConnectedGamePage);
