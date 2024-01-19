import {
  useDonateMutation,
  useGetUserByIdQuery,
  useSetDiceTypeMutation,
  useSetPubkeyTextMutation,
  useSetUserColorMutation,
} from 'api/auth';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { css, styled } from 'stitches.config';
import { Button } from 'ui/buttons/button';
import { Slider } from 'ui/buttons/slider';
import { TextArea } from 'ui/buttons/textarea';
import { Select, ToggleSwitch } from 'ui/buttons/toggle';
import {
  selectHasD20Unlocked,
  selectHasGoldenUnlocked,
  selectSelfUserId,
} from '../selectors/game_selectors';
import { ReduxState } from '../store';

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
  zIndex: 100,
  backgroundColor: '$gray800',
  // backgroundColor: 'red',
  position: 'absolute',
  '@bp0': {
    height: '100%',
    width: '100%',
  },
  '@bp1': {
    padding: 48,
    height: 'calc(100% - 96px - 48px)',
    width: 'calc(100% - 96px - 48px)',
    borderRadius: 16,
    left: 24,
    top: 24,
  },
  gap: 8,
  display: 'flex',
  flexDirection: 'column',
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

export const SettingsPage: React.FC<{}> = () => {
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
  const hasGoldenUnlocked = useSelector(selectHasGoldenUnlocked);
  const { data } = useGetUserByIdQuery(user_id || '');
  const socket = useSelector((state: ReduxState) => state.connection.socket);
  const dispatch = useDispatch();
  const dice3d = useSelector((state: ReduxState) => state.settings.sick3dmode);
  const darkMode = useSelector((state: ReduxState) => state.settings.darkMode);
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
        dice_type: e.target.value,
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
          <ToggleSwitch
            id="dark"
            desc="Dark mode"
            checked={darkMode}
            onChange={() => {
              dispatch({ type: 'TOGGLE_DARK' });
            }}
          />
          <Select
            options={[
              { value: 'Default', label: 'Default' },
              ...(hasD20Unlocked ? [{ value: 'D20', label: 'D20' }] : []),
              ...(hasGoldenUnlocked
                ? [{ value: 'Golden', label: 'Golden' }]
                : []),
            ]}
            value={dice_type.toString()}
            id="dice_type"
            label="Dice type"
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
