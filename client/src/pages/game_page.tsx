import React from 'react';
import { connect, useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import OnboardPage from './onboard_page';
import { css, styled } from 'stitches.config';
import Connection from '../connection';
import {
  selectHasD20Unlocked,
  selectIs3d,
  selectIsReset,
  selectIsSpectator,
  selectSelfUserId,
  selectSomebodyIsNice,
  selectTurnIndex,
  selectWinner,
} from '../selectors/game_selectors';
import { ReduxState } from '../store';
import { DiceType, Player } from '../types/store_types';
import ChatBox from '../ui/chat';
import GamePanel from '../ui/game_panel';
import Players from '../ui/players';
import {
  HelpIcon,
  GearIcon,
  HomeIcon,
  LogoutIcon,
  LoginIcon,
} from '../ui/icons/help';
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

  const [localOnboarded, setLocalOnboarded] = React.useState(false);

  const needsToOnboard =
    authToken === null && (showLogin || !localOnboarded) && mode === 'room';

  const showHelp = useSelector((state: ReduxState) => state.settings.showHelp);

  const showSettings = useSelector(
    (state: ReduxState) => state.settings.showSettings
  );

  const dispatch = useDispatch();

  const setShowLogin = React.useCallback(
    (show: boolean) => {
      dispatch({ type: 'SET_SHOW_LOGIN', show });
      setLocalOnboarded(true);
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

      {showSettings ? (
        <Settings />
      ) : (
        <>
          {/* <ConnBanner /> */}

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
        </>
      )}
    </React.Fragment>
  );
};

const Settings: React.FC<{}> = () => {
  const [trigger] = useSetUserColorMutation();
  const [setDiceType] = useSetDiceTypeMutation();
  const [setPubkeyText] = useSetPubkeyTextMutation();
  const [donate, { data: donateData }] = useDonateMutation();

  React.useEffect(() => {
    if (donateData) {
      window.open(donateData.link, '_blank', 'noreferrer');
    }
  }, [donateData]);

  const user_id = useSelector(selectSelfUserId);
  const hasD20Unlocked = useSelector(selectHasD20Unlocked);
  const { data } = useGetUserByIdQuery(user_id || '');
  const socket = useSelector((state: ReduxState) => state.connection.socket);
  const dispatch = useDispatch();
  const dice3d = useSelector((state: ReduxState) => state.settings.sick3dmode);
  const color = useSelector((state: ReduxState) => state.settings.color);
  const pubkey = useSelector((state: ReduxState) => state.settings.pubkey);
  const dice_type = useSelector(
    (state: ReduxState) => state.settings.dice_type
  );
  const onSave = React.useCallback(async () => {
    await trigger(color);
    await setDiceType(dice_type);
    await setPubkeyText(pubkey);
    socket?.send(JSON.stringify({ type: 'refetch_player', user_id }));
  }, [trigger, color, socket, user_id, dice_type, setDiceType, pubkey]);

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
  const onDiceTypeChange = React.useCallback(
    (e) =>
      dispatch({
        type: 'SET_DICE_TYPE',
        dice_type: Number.parseInt(e.target.value),
      }),
    [dispatch]
  );
  const onPubkeyChange = React.useCallback(
    (e) =>
      dispatch({
        type: 'SET_PUBKEY_TEXT',
        pubkey_text: e.target.value,
      }),
    [dispatch]
  );

  return (
    <SettingsContainer>
      <h1>Settings</h1>
      <TwoColumns>
        <Column>
          <h2>Dice</h2>
          <ToggleSwitch
            id="dice3d"
            desc="3D dice animation"
            checked={dice3d}
            onChange={() => {
              dispatch({ type: 'TOGGLE_3D' });
            }}
          />
          <Select
            options={[
              { value: DiceType.D6, label: 'D6' },
              ...(hasD20Unlocked
                ? [{ value: DiceType.D20, label: 'D20' }]
                : []),
            ]}
            value={dice_type.toString()}
            id="dice_type"
            label="Dice shape"
            onChange={onDiceTypeChange}
          />
        </Column>
        {data?.donor ? (
          <Column>
            <h2>Color Scheme</h2>
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
          </Column>
        ) : user_id ? (
          <PlsDonate>
            <h2>Enjoying rolly cubes?</h2>
            <p>Consider donating to unlock additional customization options.</p>
            <Button onClick={() => donate()}>Donate</Button>
          </PlsDonate>
        ) : null}
      </TwoColumns>
      <TextArea
        id="pubkey"
        desc="SSH Public Keys"
        value={pubkey}
        placeholder={'ssh-rsa ...'}
        onChange={onPubkeyChange}
      />
      <SaveButtonWrapper>
        <Button onClick={onSave}>Save</Button>
      </SaveButtonWrapper>
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
