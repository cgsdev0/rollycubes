import React from 'react';
import { connect, DispatchProp } from 'react-redux';
import { ReduxState } from '../store';
import {
  selectAuthService,
  selectIsDev,
  selectIsSignedIn,
} from '../selectors/game_selectors';

interface Props {
  authService: string;
  authToken?: string | null;
  isSignedIn: boolean;
  isOpen: boolean;
  setIsOpen: (a: boolean) => void;
}

const AuthMenu: React.FC<Props & DispatchProp> = (props) => {
  const { isOpen, setIsOpen } = props;
  // register a click handler to close settings
  React.useEffect(() => {
    const closeAuth = (e: any) => {
      if (!e.path.map((el: any) => el.id).includes('authSettingsBox')) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      setTimeout(() => {
        document.addEventListener('click', closeAuth);
      }, 0);
      return () => {
        document.removeEventListener('click', closeAuth);
      };
    }
  }, [isOpen, setIsOpen]);

  return (
    <div id="authSettingsBox">
      {isOpen ? (
        <div id="settingsBox">
          <ul>
            {props.isSignedIn ? (
              <li
                onClick={async () => {
                  if (props.authToken) {
                    const res = await window.fetch(
                      props.authService + 'logout',
                      {
                        method: 'post',
                        mode: 'cors',
                        credentials: 'include',
                        headers: {
                          'x-access-token': props.authToken,
                        },
                      }
                    );
                    await res.text();
                  }
                  props.dispatch({ type: 'LOGOUT' });
                }}
              >
                Logout
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
    authService: selectAuthService(state),
    authToken: state.auth.authToken,
    isDev: selectIsDev(state),
    isSignedIn: selectIsSignedIn(state),
  };
};

export default connect(mapStateToProps)(AuthMenu);
