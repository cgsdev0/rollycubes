import { useLogoutMutation } from 'api/auth';
import { useSelector, useStore } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import { useNavigate } from 'react-router';
import { styled } from 'stitches.config';
import { ReduxState } from 'store';
import {
  CloseIcon,
  GearIcon,
  HelpIcon,
  HomeIcon,
  LoginIcon,
  LogoutIcon,
} from './icons/help';
import { twitchLogin } from 'twitch';

const FloatingBar = styled('div', {
  width: '100%',
  height: 36,

  '@bp1': {
    position: 'absolute',
    left: 0,
    top: -16,
  },
});
const RightAlign = styled('div', {
  height: '100%',
  display: 'flex',
  flex: 1,
  justifyContent: 'flex-end',
});
const InnerBar = styled('div', {
  '@bp1': {
    marginRight: 64,
    marginLeft: 64,
  },
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  height: '100%',
});

export const FloatingButtonBar = () => {
  const navigate = useNavigate();

  const [triggerLogout] = useLogoutMutation();
  const store = useStore<ReduxState>();

  const authToken = useSelector((state: ReduxState) => state.auth.authToken);

  const pathname = useSelector(
    (state: ReduxState) =>
      (state.router.location?.pathname || '/').split('#')[0].split('?')[0]
  );

  const isHome = pathname === '/' || pathname === '/home';

  const isError = pathname === '/multiple-tabs';

  const [searchParams, setSearchParams] = useSearchParams();
  const showSettings = searchParams.get('settings');

  return (
    <FloatingBar>
      <InnerBar>
        {isError ? (
          <HomeIcon onClick={() => navigate('/')} />
        ) : (
          <>
            {showSettings ? null : (
              <>
                <HomeIcon onClick={() => navigate('/')} />
                <GearIcon
                  onClick={() => {
                    searchParams.set('settings', 'main');
                    setSearchParams(searchParams);
                  }}
                />
                {isHome ? null : (
                  <HelpIcon
                    onClick={() => store.dispatch({ type: 'TOGGLE_SHOW_HELP' })}
                  />
                )}
              </>
            )}
            <RightAlign>
              {showSettings ? (
                <>
                  <CloseIcon
                    onClick={() => {
                      searchParams.delete('settings');
                      setSearchParams(searchParams);
                    }}
                  />
                </>
              ) : (
                <>
                  {authToken ? (
                    <LogoutIcon
                      onClick={async () => {
                        await triggerLogout();
                        window.location.reload();
                      }}
                    />
                  ) : null}
                  {authToken === null ? (
                    <LoginIcon onClick={twitchLogin()} />
                  ) : null}
                </>
              )}
            </RightAlign>
          </>
        )}
      </InnerBar>
    </FloatingBar>
  );
};
