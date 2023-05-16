import React from 'react';
import { connect, useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import OnboardPage from './onboard_page';
import { css, styled } from 'stitches.config';
import Connection from '../connection';
import {
  selectIs3d,
  selectIsReset,
  selectIsSpectator,
  selectSelfUserId,
  selectSomebodyIsNice,
  selectTurnIndex,
  selectWinner,
} from '../selectors/game_selectors';
import { ReduxState } from '../store';
import { Player } from '../types/store_types';
import ChatBox from '../ui/chat';
import GamePanel from '../ui/game_panel';
import Players from '../ui/players';
import { HelpIcon, GearIcon, HomeIcon } from '../ui/icons/help';
import { useStore } from 'react-redux';
import { destroyScene, initScene } from '3d/main';
import { PopText } from '../ui/poptext';
import { ToggleSwitch } from 'ui/buttons/toggle';
import { Slider } from 'ui/buttons/slider';
import { Button } from 'ui/buttons/button';
import { useGetUserByIdQuery, useSetUserColorMutation } from 'api/auth';

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

const SettingsContainer = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
});

const SaveButtonWrapper = styled('div', {
  display: 'flex',
  height: '100%',
  alignItems: 'flex-end',
  justifyContent: 'center',
  '& button': {
    maxWidth: '30%',
  },
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
const PlsDonate = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  marginTop: 16,
  gap: 12,
});

const GamePage: React.FC<Props> = ({ is3DMode, authToken }) => {
  const [hasOnboarded, setHasOnboarded] = React.useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { mode, room } = useParams();

  const store = useStore<ReduxState>();

  const needsToOnboard = authToken === null && !hasOnboarded && mode === 'room';

  const [showHelp, setShowHelp] = React.useState(false);

  const showSettings = useSelector(
    (state: ReduxState) => state.settings.showSettings
  );

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
          store={store}
        />
      )}

      <FloatingButtonBar id="floating-button-bar">
        <HomeIcon onClick={() => navigate('/')} />
        <GearIcon
          onClick={() => store.dispatch({ type: 'TOGGLE_SHOW_SETTINGS' })}
        />
        <HelpIcon onClick={() => setShowHelp((help) => !help)} />
      </FloatingButtonBar>

      {showSettings ? (
        <Settings />
      ) : (
        <>
          {/* <ConnBanner /> */}

          <div className={flexColumn()}>
            <GamePanel />
            <Players />
          </div>
          {showHelp ? <Rules /> : <ChatBox />}
          <PopText />
        </>
      )}
    </React.Fragment>
  );
};

const Settings: React.FC<{}> = () => {
  const [trigger] = useSetUserColorMutation();
  const user_id = useSelector(selectSelfUserId);
  const { data } = useGetUserByIdQuery(user_id || '');
  const socket = useSelector((state: ReduxState) => state.connection.socket);
  const dispatch = useDispatch();
  const dice3d = useSelector((state: ReduxState) => state.settings.sick3dmode);
  const color = useSelector((state: ReduxState) => state.settings.color);
  const onSave = React.useCallback(() => {
    trigger(color).then(() =>
      socket?.send(JSON.stringify({ type: 'refetch_player', user_id }))
    );
  }, [trigger, color, socket, user_id]);
  const onHueChange = React.useCallback(
    (e) =>
      dispatch({
        type: 'SET_CUSTOM_HUE',
        hue: Number.parseInt(e.target.value),
      }),
    [dispatch]
  );
  const onSatChange = React.useCallback(
    (e) =>
      dispatch({
        type: 'SET_CUSTOM_SAT',
        sat: Number.parseInt(e.target.value),
      }),
    [dispatch]
  );

  return (
    <SettingsContainer>
      <h1>Settings</h1>
      <ToggleSwitch
        id="dice3d"
        desc="3D dice animation"
        checked={dice3d}
        onChange={() => {
          dispatch({ type: 'TOGGLE_3D' });
        }}
      />
      {data?.donor ? (
        <>
          <Slider
            desc="hue"
            min={0}
            max={360}
            value={color.hue}
            id="hue"
            onChange={onHueChange}
          />
          <Slider
            desc="saturation"
            min={0}
            max={80}
            value={color.sat}
            id="saturation"
            onChange={onSatChange}
          />
        </>
      ) : null}
      <SaveButtonWrapper>
        <Button onClick={onSave}>Save</Button>
      </SaveButtonWrapper>
      {data?.donor && user_id ? (
        <PlsDonate>
          <hr />
          <h2>Enjoying rolly cubes?</h2>
          <p>Consider donating to unlock additional customization options.</p>
          <Button>Donate</Button>
        </PlsDonate>
      ) : null}
    </SettingsContainer>
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
