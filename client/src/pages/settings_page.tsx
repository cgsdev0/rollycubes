import {
  useDonateMutation,
  useGetUserByIdQuery,
  useSetDiceTypeMutation,
  useSetPubkeyTextMutation,
  useSetUserColorMutation,
} from 'api/auth';
import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { css, styled } from 'stitches.config';
import { Button } from 'ui/buttons/button';
import { Slider } from 'ui/buttons/slider';
import { TextArea } from 'ui/buttons/textarea';
import { Select, ToggleSwitch } from 'ui/buttons/toggle';
import {
  selectCustomDiceOptions,
  selectHasD20Unlocked,
  selectHasGoldenUnlocked,
  selectSelfUserId,
} from '../selectors/game_selectors';
import { ReduxState } from '../store';
import { destroyPreview, initPreview } from '3d/main';
import { DiceType } from 'types/api';

const NextBtn = styled(Button, {
  position: 'absolute',
  top: '35%',
  minWidth: 70,
  minHeight: 50,
});
const Customizer = styled('div', {
  textAlign: 'center',
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  '& h2': {
    position: 'absolute',
    top: 10,
    width: '100%',
  },
});
const RenderCanvas = styled('canvas', {
  height: 280,
  width: '100%',
  boxSizing: 'border-box',
  pointerEvents: 'none',
  touchAction: 'none',
});
const SliderBox = styled('section', {
  display: 'flex',
  flexDirection: 'column',
  gap: 16,
});
const Gate = styled('section', {
  '@bp0': {
    top: -12,
    padding: '12px 0',
    left: 0,
  },
  '@bp1': {
    top: -12,
    left: -12,
    borderRadius: 12,
    padding: 12,
  },
  backdropFilter: 'blur(8px)',
  backgroundColor: 'rgba(255, 255, 255, 0.05)',
  width: '100%',
  height: '100%',
  position: 'absolute',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
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
  marginBottom: 8,
});

const Code = styled('span', {
  backgroundColor: '$gray900',
  fontFamily: 'monospace',
  padding: 4,
  borderRadius: 4,
  color: '$brand',
  userSelect: 'all',
});

const SettingsContainer = styled('div', {
  zIndex: 100,
  backgroundColor: '$gray800',
  // backgroundColor: 'red',
  position: 'absolute',
  '@bp0': {
    height: '100%',
    width: '100%',
    flexDirection: 'column',
  },
  '@bp1': {
    padding: 48,
    height: 'calc(100% - 96px - 48px)',
    width: 'calc(100% - 96px - 48px)',
    borderRadius: 16,
    left: 24,
    top: 24,
    flexDirection: 'row',
  },
  '& main': {
    height: '100%',
    '@bp0': {
      overflowY: 'auto',
    },
    '& hr': {
      border: 0,
      borderTop: '1px solid $gray700',
      margin: '12px 0',
    },
    '& h1': {
      margin: 0,
      marginBottom: 8,
    },
    '& p': {
      userSelect: 'text',
    },
    // backgroundColor: 'red',
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    width: '100%',
  },
  gap: 24,
  display: 'flex',
  flex: 1,
});

const SaveButtonWrapper = styled('div', {
  display: 'flex',
  width: '100%',
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

const Sidebar = styled('ul', {
  display: 'flex',
  flexDirection: 'column',
  listStyle: 'none',
  backgroundColor: '$gray900',
  '@bp0': {
    flexShrink: 0,
  },
  '@bp1': {
    height: '100%',
    borderRadius: 12,
    paddingTop: 20,
    '& li': {
      '&:first-child': {
        borderTop: '1px solid $gray700',
      },
    },
    '& .mobileOnly': {
      display: 'none',
    },
  },
  '& li': {
    width: '100%',
    padding: '8px 0',
    cursor: 'pointer',
    borderBottom: '1px solid $gray700',
  },
  '& .selected': {
    backgroundColor: '$brand',
  },
  minWidth: 200,
  overflow: 'hidden',
  textAlign: 'center',
  boxSizing: 'border-box',
});

const GateBoundary = styled('div', {
  height: '100%',
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
  width: '100%',
});

export const SettingsPage: React.FC<{}> = () => {
  let [searchParams, setSearchParams] = useSearchParams();

  const tabs = {
    main: { name: 'General', component: General },
    customize: { name: 'Customize', component: Customize },
    ssh: { name: 'SSH Keys', component: SshKeys },
    premium: { name: 'Premium', component: Premium },
  };

  const selected = searchParams.get('settings') as keyof typeof tabs;
  if (!selected || !tabs[selected]) {
    return null;
  }
  const Selected = tabs[selected].component;

  return (
    <SettingsContainer>
      <Sidebar>
        {Object.entries(tabs).map(([tab, info]) => {
          return (
            <li
              key={tab}
              className={selected === tab ? 'selected' : undefined}
              onClick={() => {
                searchParams.set('settings', tab);
                setSearchParams(searchParams, { replace: true });
              }}
            >
              {info.name}
            </li>
          );
        })}
        <li
          className="mobileOnly"
          onClick={() => {
            searchParams.delete('settings');
            setSearchParams(searchParams);
          }}
        >
          Exit
        </li>
      </Sidebar>
      <main>{<Selected />}</main>
    </SettingsContainer>
  );
};
const General = () => {
  const dice3d = useSelector((state: ReduxState) => state.settings.sick3dmode);
  const darkMode = useSelector((state: ReduxState) => state.settings.darkMode);
  const dispatch = useDispatch();
  return (
    <>
      <h1>General Settings</h1>

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
    </>
  );
};
const SshKeys = () => {
  const pubkey = useSelector((state: ReduxState) => state.settings.pubkey);
  const user_id = useSelector(selectSelfUserId);
  const [setPubkeyText] = useSetPubkeyTextMutation();
  const socket = useSelector((state: ReduxState) => state.connection.socket);
  const onSave = React.useCallback(async () => {
    await setPubkeyText(pubkey);
    socket?.send(JSON.stringify({ type: 'refetch_player', user_id }));
  }, [socket, user_id, pubkey]);
  const dispatch = useDispatch();
  const onPubkeyChange = React.useCallback(
    (e) =>
      dispatch({
        type: 'SET_PUBKEY_TEXT',
        pubkey_text: e.target.value,
      }),
    [dispatch]
  );
  const [searchParams, setSearchParams] = useSearchParams();
  return (
    <>
      <h1>SSH Keys</h1>
      <p>You can also play Rolly Cubes from your terminal!</p>
      <p>
        Register your SSH public key below, and then connect via the following
        command: <Code>ssh rollycubes.com</Code>
      </p>
      <hr />
      <Gated
        on={!user_id}
        cta="Sign In First"
        action={() => {
          searchParams.delete('settings');
          setSearchParams(searchParams);
          dispatch({ type: 'SET_SHOW_LOGIN', show: true });
        }}
      >
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
      </Gated>
    </>
  );
};
const GateContext = React.createContext(false);
const Gated = ({
  on,
  children,
  cta,
  action,
}: {
  on: boolean;
  children?: any;
  cta: string;
  action: () => void;
}) => {
  const gate = React.useContext(GateContext);
  if (on && !gate) {
    return (
      <GateBoundary>
        <GateContext.Provider value={true}>
          {children}
          <Gate>
            🔒
            <Button onClick={action}>{cta}</Button>
          </Gate>
        </GateContext.Provider>
      </GateBoundary>
    );
  }
  return <GateBoundary>{children}</GateBoundary>;
};

type SetDiceFn = Awaited<ReturnType<typeof initPreview>>;

const Customize = () => {
  const user_id = useSelector(selectSelfUserId);
  const { data } = useGetUserByIdQuery(user_id!, {
    skip: !Boolean(user_id),
  });
  const setDice = React.useRef<SetDiceFn>(undefined);
  const [idx, setIdx] = React.useState(0);
  const options = useSelector(selectCustomDiceOptions);
  React.useLayoutEffect(() => {
    (async () => {
      const setDiceFn = await initPreview('Default');
      setDice.current = setDiceFn;
    })();
    return () => {
      destroyPreview();
      setDice.current = undefined;
    };
  }, []);
  React.useEffect(() => {
    if (setDice.current) {
      setDice.current(options[idx].unlocks);
    }
  }, [setDice, idx, options]);
  const advance = (amt: number) => () => {
    let newidx = idx + amt;
    if (newidx < 0) {
      newidx = options.length - 1;
    }
    if (newidx >= options.length) {
      newidx = 0;
    }
    setIdx(newidx);
  };
  const option = options[idx];
  const locked = !Boolean(option.user?.unlocked);
  const [setDiceType] = useSetDiceTypeMutation();
  const onEquip = async () => {
    await setDiceType(option.unlocks);
  };
  const [searchParams, setSearchParams] = useSearchParams();
  const dispatch = useDispatch();
  return (
    <>
      <h1>Customize</h1>

      <Gated
        on={!user_id}
        cta="Sign In First"
        action={() => {
          searchParams.delete('settings');
          setSearchParams(searchParams);
          dispatch({ type: 'SET_SHOW_LOGIN', show: true });
        }}
      >
        <Customizer>
          <h2>{option.unlocks}</h2>
          <RenderCanvas id="previewCanvas" />
          <NextBtn style={{ left: 50 }} onClick={advance(-1)}>
            &larr;
          </NextBtn>
          <NextBtn style={{ right: 50 }} onClick={advance(1)}>
            &rarr;
          </NextBtn>
          <SaveButtonWrapper>
            <Column>
              <p>
                <strong>{option.name}</strong>
              </p>
              <p>{option.description}</p>
            </Column>
          </SaveButtonWrapper>
          <SaveButtonWrapper>
            <Button onClick={onEquip} disabled={locked}>
              {locked ? '🔒 Locked' : 'Equip'}
            </Button>
          </SaveButtonWrapper>
        </Customizer>
      </Gated>
    </>
  );
};
const Premium = () => {
  const [donate, { data: donateData }] = useDonateMutation();

  const user_id = useSelector(selectSelfUserId);
  const { data } = useGetUserByIdQuery(user_id || '');
  const color = useSelector((state: ReduxState) => state.settings.color);

  const [trigger] = useSetUserColorMutation();
  const socket = useSelector((state: ReduxState) => state.connection.socket);

  const onSave = React.useCallback(async () => {
    await trigger(color);
    socket?.send(JSON.stringify({ type: 'refetch_player', user_id }));
  }, [trigger, color, socket, user_id]);

  React.useEffect(() => {
    if (donateData) {
      window.open(donateData.link, '_blank', 'noreferrer');
    }
  }, [donateData]);

  const dispatch = useDispatch();
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
  const [searchParams, setSearchParams] = useSearchParams();
  return (
    <>
      <h1>Premium</h1>
      <div>
        <Gated
          on={!user_id}
          cta="Sign In First"
          action={() => {
            searchParams.delete('settings');
            setSearchParams(searchParams);
            dispatch({ type: 'SET_SHOW_LOGIN', show: true });
          }}
        >
          {data?.donor ? (
            <p>Thank you for supporting Rolly Cubes!</p>
          ) : (
            <>
              <p>
                <strong>Enjoying rolly cubes?</strong>
              </p>
              <p>
                Consider donating to unlock additional customization options.
              </p>
            </>
          )}
          <hr />
          <SliderBox>
            <Gated
              on={!data?.donor}
              cta="Donate To Unlock"
              action={() => donate()}
            >
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
              <Button onClick={onSave}>Save</Button>
            </Gated>
          </SliderBox>
        </Gated>
      </div>
    </>
  );
};
const SettingsPageOld: React.FC<{}> = () => {
  const [trigger] = useSetUserColorMutation();
  const [setDiceType] = useSetDiceTypeMutation();
  const [setPubkeyText] = useSetPubkeyTextMutation();
  const [donate, { data: donateData }] = useDonateMutation();

  const [searchParams, setSearchParams] = useSearchParams();
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
