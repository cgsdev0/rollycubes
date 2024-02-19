import React from 'react';
import { connect, DispatchProp } from 'react-redux';
import {
  selectAuthService,
  selectCheats,
  selectIs3d,
  selectIsDev,
} from '../selectors/game_selectors';
import { ReduxState } from '../store';

interface Props {
  socket?: WebSocket;
  hints: boolean;
  is3d: boolean;
  isDev: boolean;
  authService: string;
}

const SettingsMenu: React.FC<Props & DispatchProp> = (props) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const changeName = () => {
    const e = window.prompt('Enter a name: ', '');
    if (e === null) return;
    if (props.socket) {
      props.socket.send(JSON.stringify({ type: 'update_name', name: e }));
      localStorage.setItem('name', e);
    }
  };

  // register a click handler to close settings
  React.useEffect(() => {
    const closeSettings = (e: any) => {
      if (!e.path.map((el: any) => el.id).includes('settingsBox')) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      setTimeout(() => {
        document.addEventListener('click', closeSettings);
      }, 0);
      return () => {
        document.removeEventListener('click', closeSettings);
      };
    }
  }, [isOpen]);

  return (
    <div id="settings">
      <img
        alt="settings"
        src="/gear.png"
        width={24}
        height={24}
        onClick={() => setIsOpen(!isOpen)}
      />
      {isOpen ? (
        <div id="settingsBox">
          <ul>
            <li
              onClick={() => {
                setIsOpen(false);
                changeName();
              }}
            >
              Change name
            </li>
            <li
              onClick={() => {
                props.dispatch({ type: 'CHEATS' });
              }}
            >
              [{props.hints ? 'x' : ' '}] Hints
            </li>
            <li
              onClick={() => {
                props.dispatch({ type: 'TOGGLE_3D' });
              }}
            >
              [{props.is3d ? 'x' : ' '}] 3D mode<sup>(beta)</sup>
            </li>
            {props.isDev ? (
              <li
                onClick={() => {
                  props.dispatch({ type: 'DEV_AUTH_SERVICE_TOGGLE' });
                }}
              >
                {props.authService}
              </li>
            ) : null}
          </ul>
        </div>
      ) : null}
    </div>
  );
};

const mapStateToProps = (state: ReduxState) => {
  return {
    socket: state.connection.socket,
    hints: selectCheats(state),
    is3d: selectIs3d(state),
    authService: selectAuthService(state),
    isDev: selectIsDev(state),
  };
};

export default connect(mapStateToProps)(SettingsMenu);
