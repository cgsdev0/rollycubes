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
import { styled } from 'stitches.config';
import { Button } from 'ui/buttons/button';
import { Slider } from 'ui/buttons/slider';
import { TextArea } from 'ui/buttons/textarea';
import { ToggleSwitch } from 'ui/buttons/toggle';
import {
  selectCustomDiceOptions,
  selectIsMyTurn,
  selectSelfUserId,
} from '../selectors/game_selectors';
import { ReduxState } from '../store';
import { destroyPreview, initPreview } from '3d/main';
import { toast } from 'react-toastify';
import { DiceType } from 'types/api';
import { SettingsContainer } from 'App';

const display_names: Partial<Record<DiceType, string>> = {
  D20: 'Suspicious D20',
  Golden: 'Golden Dice',
  Jumbo: 'Jumbo Dice',
  Hands: 'Handy Dice',
};

const NextBtn = styled(Button, {
  position: 'absolute',
  top: '35%',
  '&:active': {
    top: 'calc(35% + 2px)',
  },
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
    borderRadius: 16,
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

const Sidebar = styled('ul', {
  display: 'flex',
  flexDirection: 'column',
  listStyle: 'none',
  backgroundColor: '$gray900',
  '@bp0': {
    flexShrink: 0,
  },
  '@bp1': {
    boxShadow: '$cutoutTop, $cutoutBottom, $cutoutBorder',
    width: 336,
    overflow: 'hidden',
    height: '100%',
    borderRadius: 16,
    paddingTop: 20,
    '& .mobileOnly': {
      display: 'none',
    },
  },
  '& li': {
    width: '100%',
    padding: '8px 0',
    cursor: 'pointer',
  },
  '& .selected': {
    backgroundColor: '$brandFaded',
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
  const is_my_turn = useSelector(selectIsMyTurn);
  const was_my_turn = React.useRef(is_my_turn);
  React.useEffect(() => {
    if (is_my_turn && !was_my_turn.current) {
      was_my_turn.current = true;
      toast.warning("It's your turn!", { position: 'top-right' });
    }
  }, [is_my_turn, was_my_turn]);
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
              role="button"
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
    try {
      await setPubkeyText(pubkey).unwrap();
      toast.success('Updated!', {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        theme: 'colored',
      });
    } catch (e) {
      toast.error('Failed to save.', {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        theme: 'colored',
      });
    }
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
        command: <Code>ssh ssh.rollycubes.com</Code>
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
  const socket = useSelector((state: ReduxState) => state.connection.socket);
  const onEquip = async () => {
    try {
      await setDiceType(option.unlocks).unwrap();
      socket?.send(JSON.stringify({ type: 'refetch_player', user_id }));
      toast.success('Equipped!', {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        theme: 'colored',
      });
    } catch (e) {
      toast.error('Failed to equip.', {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        theme: 'colored',
      });
    }
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
          <h2>{display_names[option.unlocks] || option.unlocks}</h2>
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
    try {
      await trigger(color).unwrap();
      socket?.send(JSON.stringify({ type: 'refetch_player', user_id }));
      toast.success('Updated!', {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        theme: 'colored',
      });
    } catch (e) {
      toast.error('Failed to save.', {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        theme: 'colored',
      });
    }
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
