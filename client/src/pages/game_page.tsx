import { destroyScene, initScene } from '3d/main';
import React from 'react';
import { connect, useDispatch, useSelector, useStore } from 'react-redux';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { css, styled } from 'stitches.config';
import { CheatSheet } from 'ui/cheat_sheet';
import { ConnBanner } from 'ui/conn_banner';
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
import { Player } from '../types/api';
import ChatBox from '../ui/chat';
import GamePanel from '../ui/game_panel';
import Players from '../ui/players';
import { PopText } from '../ui/poptext';
import OnboardPage from './onboard_page';

interface Props {
  winner?: Player;
  reset: boolean;
  isSpectator: boolean;
  turn: number;
  is3DMode: boolean;
  somebodyIsNice: boolean;
  authToken?: string | null;
  mode: 'room' | 'spectate';
}

const MainBody = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  height: '100%',
  gap: 24,
});
const SpectatorTitle = styled('p', {
  position: 'absolute',
  width: '100%',
  textAlign: 'center',
  left: 0,
  top: -8,
  color: '$gray500',
  pointerEvents: 'none',
});
const flexColumn = css({
  display: 'flex',
  flexDirection: 'column',
});

const GamePage: React.FC<Props> = ({ is3DMode, authToken, mode }) => {
  const showLogin = useSelector(
    (state: ReduxState) => state.settings.showLogin
  );
  const navigate = useNavigate();
  const location = useLocation();
  const { room } = useParams();

  const store = useStore<ReduxState>();

  const showHelp = useSelector((state: ReduxState) => state.settings.showHelp);

  const dispatch = useDispatch();

  const setShowLogin = React.useCallback(
    (show: boolean) => {
      dispatch({ type: 'SET_SHOW_LOGIN', show });
    },
    [dispatch]
  );

  const spectators = useSelector((state: ReduxState) => state.game.spectators);
  const spectating = mode === 'spectate';
  const needsToOnboard = authToken === null && showLogin && !spectating;
  // Change to spectator view if lobby is full
  // React.useEffect(() => {
  //   if (mode !== 'spectate' && spectating && !needsToOnboard) {
  //     navigate(`/spectate/${room}`, { replace: true });
  //   }
  // }, [mode, spectating, needsToOnboard]);
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
        onBoard={() => setShowLogin(false)}
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
          store={store}
        />
      )}

      <ConnBanner />

      {spectating ? (
        <SpectatorTitle>You are spectating</SpectatorTitle>
      ) : spectators ? (
        <SpectatorTitle>{spectators} spectating</SpectatorTitle>
      ) : null}
      <div className={flexColumn()}>
        <GamePanel />
        <Players />
      </div>
      <MainBody>
        {showHelp ? <Rules /> : <Rules mobile />}
        <ChatBox />
      </MainBody>
      <PopText />
    </React.Fragment>
  );
};

const RulesDiv = styled('div', {
  '& p,h1,li,strong': {
    color: '$primary',
  },
});
const RulesRow = styled('div', {
  position: 'relative',
  boxSizing: 'border-box',
  display: 'flex',
  gap: 24,
  width: '100%',
  '& li': {
    listStyle: 'none',
    marginLeft: 30,
  },
  '& p': {
    fontStyle: 'italic',
  },
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
  '@bp1': {
    boxShadow: '$indentTop, $indentBottom',
    borderRadius: 16,
    padding: 12,
  },
});

const rulesRowDesktop = css({
  '@bp0': { display: 'none !important' },
  '& strong': {
    color: '$brand',
  },
});

const Rules = ({ mobile }: { mobile?: boolean }) => {
  return (
    <RulesRow className={mobile ? undefined : rulesRowDesktop()}>
      <CheatSheet />
      <RulesDiv>
        <p>If you...</p>
        <ul>
          <li>
            roll <strong>doubles</strong>, roll again.
          </li>
          <li>
            roll a <strong>seven</strong>, split!
          </li>
          <li>
            match someone's score, <strong>reset</strong> them.
          </li>
        </ul>
        <p>First to a winning score wins!</p>
      </RulesDiv>
    </RulesRow>
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
