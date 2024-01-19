import React from 'react';
import { connect, useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import OnboardPage from './onboard_page';
import { css, styled } from 'stitches.config';
import Connection from '../connection';
import {
  selectHasD20Unlocked,
  selectHasGoldenUnlocked,
  selectIs3d,
  selectIsReset,
  selectIsSpectator,
  selectSelfUserId,
  selectSomebodyIsNice,
  selectTurnIndex,
  selectWinner,
} from '../selectors/game_selectors';
import { ReduxState } from '../store';
import { Player } from '../types/api';
import ChatBox from '../ui/chat';
import GamePanel from '../ui/game_panel';
import Players from '../ui/players';
import { useStore } from 'react-redux';
import { destroyScene, initScene } from '3d/main';
import { PopText } from '../ui/poptext';
import { Select, ToggleSwitch } from 'ui/buttons/toggle';
import { Slider } from 'ui/buttons/slider';
import { Button } from 'ui/buttons/button';
import {
  useDonateMutation,
  useGetUserByIdQuery,
  useSetDiceTypeMutation,
  useSetPubkeyTextMutation,
  useSetUserColorMutation,
} from 'api/auth';
import { TextArea } from 'ui/buttons/textarea';
import { ConnBanner } from 'ui/conn_banner';

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

const TwoColumns = styled('div', {
  '@bp1': {
    flex: 1,
    display: 'flex',
    gap: '3rem',
    flexDirection: 'row',
  },
  '@bp0': {
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem',
  },
});
const Column = styled('div', {
  gap: 8,
  display: 'flex',
  flexDirection: 'column',
});

const SettingsContainer = styled('div', {
  gap: 8,
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  flex: 1,
});

const SaveButtonWrapper = styled('div', {
  display: 'flex',
  alignItems: 'flex-end',
  justifyContent: 'center',
  '& button': {
    '@bp1': {
      maxWidth: '30%',
    },
  },
});
const PlsDonate = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  maxWidth: 400,
  marginLeft: 80,
  gap: 8,
  '@bp0': {
    display: 'none',
  },
});

const GamePage: React.FC<Props> = ({ is3DMode, authToken, mode }) => {
  const showLogin = useSelector(
    (state: ReduxState) => state.settings.showLogin
  );
  const navigate = useNavigate();
  const location = useLocation();
  const { room } = useParams();

  const store = useStore<ReduxState>();

  const needsToOnboard = authToken === null && showLogin;

  const showHelp = useSelector((state: ReduxState) => state.settings.showHelp);

  const dispatch = useDispatch();

  const setShowLogin = React.useCallback(
    (show: boolean) => {
      dispatch({ type: 'SET_SHOW_LOGIN', show });
    },
    [dispatch]
  );

  const spectators = useSelector((state: ReduxState) => state.game.spectators);
  const spectating = useSelector(
    (state: ReduxState) => state.game.self_index === undefined
  );
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
      {showHelp ? <Rules /> : <ChatBox />}
      <PopText />
    </React.Fragment>
  );
};

const RulesDiv = styled('div', {
  '& p,h1,li,strong': {
    color: '$primary',
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
});
const Rules = () => {
  return (
    <RulesDiv>
      <h1>Rules</h1>
      <div>
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
      </div>
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
