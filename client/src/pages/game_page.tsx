import React from 'react';
import { connect, DispatchProp } from 'react-redux';
import {
  Location,
  NavigateFunction,
  useLocation,
  useNavigate,
  useParams,
} from 'react-router-dom';
import OnboardPage from './onboard_page';
import { css, styled } from 'stitches.config';
import Connection from '../connection';
import {
  selectIs3d,
  selectIsReset,
  selectIsSpectator,
  selectSomebodyIsNice,
  selectTurnIndex,
  selectWinner,
} from '../selectors/game_selectors';
import { ReduxState } from '../store';
import { Player } from '../types/store_types';
import ChatBox from '../ui/chat';
import GamePanel from '../ui/game_panel';
import Players from '../ui/players';
import { HelpIcon, DiceIcon, HomeIcon } from '../ui/icons/help';
import { useDispatch } from 'react-redux';
import { destroyScene, initScene } from '3d/main';
import { PopText } from '../ui/poptext';
import { useGetUserByIdQuery } from 'api/auth';

interface Props {
  winner?: Player;
  reset: boolean;
  isSpectator: boolean;
  turn: number;
  is3DMode: boolean;
  somebodyIsNice: boolean;
  authToken?: string | null;
}

const flexColumn = css({
  display: 'flex',
  flexDirection: 'column',
});

const FloatingButtonBar = styled('div', {
  '@bp1': {
    position: 'absolute',
    top: -16,
    left: 36,
  },
  display: 'flex',
  alignItems: 'center',
  gap: 8,
});

const GamePage: React.FC<Props & DispatchProp> = ({
  is3DMode,
  somebodyIsNice,
  authToken,
  winner,
  reset,
  turn,
}) => {
  const [hasOnboarded, setHasOnboarded] = React.useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { mode, room } = useParams();

  const dispatch = useDispatch();

  const needsToOnboard = authToken === null && !hasOnboarded && mode === 'room';

  const [showHelp, setShowHelp] = React.useState(false);

  React.useEffect(() => {
    if (is3DMode && !needsToOnboard && authToken !== undefined) {
      initScene();
      return () => {
        destroyScene();
      };
    }
  }, [is3DMode, needsToOnboard, authToken]);

  if (!mode || !room) {
    return <p>Error</p>;
  }

  if (needsToOnboard) {
    return (
      <OnboardPage
        intent={`${mode}/${room}`}
        onBoard={() => setHasOnboarded(true)}
      />
    );
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

      <FloatingButtonBar id="floating-button-bar">
        <HelpIcon onClick={() => setShowHelp((help) => !help)} />
        <DiceIcon onClick={() => dispatch({ type: 'TOGGLE_3D' })} />
        <HomeIcon onClick={() => navigate('/')} />
      </FloatingButtonBar>
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
      {showHelp ? <Rules /> : <ChatBox />}
      <PopText />
    </React.Fragment>
  );
};

const RulesDiv = styled('div', {
  '@bp0': {
    position: 'absolute',
    height: 'calc(100vh - 40px)',
    width: '100vw',
    top: 40,
    backgroundColor: '#111111ea',
    padding: 8,
    left: -8,
    zIndex: 10,
  },
});
const Rules = () => {
  return (
    <RulesDiv>
      <h1>Rules</h1>
      <p>
        On your turn:
        <br />
        <br />
        <ol style={{ marginLeft: 40 }}>
          <li>Roll the dice</li>
          <li>Add the two dice together</li>
          <li>Add or subtract the sum from your score</li>
        </ol>
        <br />
        First player to reach a winning score wins!
      </p>
      <br />
      <p>Additionally...</p>
      <br />
      <ul style={{ marginLeft: 40 }}>
        <li>
          <strong>Doubles:</strong> roll again.
        </li>
        <li>
          <strong>Sevens:</strong> split; treat the dice as separate rolls.
        </li>
        <li>
          If you match another player's score, they are <strong>reset</strong>{' '}
          to 0.
        </li>
      </ul>
    </RulesDiv>
  );
};

const mapStateToProps = (state: ReduxState) => {
  return {
    is3DMode: selectIs3d(state),
    winner: selectWinner(state),
    turn: selectTurnIndex(state),
    reset: selectIsReset(state),
    isSpectator: selectIsSpectator(state),
    somebodyIsNice: selectSomebodyIsNice(state),
    authToken: state.auth.authToken,
  };
};

const ConnectedGamePage = connect(mapStateToProps)(GamePage);

export default ConnectedGamePage;
