import { useWindowSize } from 'hooks/window_size';
import { GenericErrorPage } from 'pages/tab_error_page';
import { AchievementProvider } from 'providers/achievements';
import { AuthProvider } from 'providers/auth';
import { StrictMode } from 'react';
import { Provider, useSelector } from 'react-redux';
import { Route, Routes } from 'react-router-dom';
import { HistoryRouter as Router } from 'redux-first-history/rr6';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  selectCurrentColors,
  selectCurrentTheme,
} from 'selectors/game_selectors';
import { styled, css, globalStyles } from 'stitches.config';
import { Octocat } from 'ui/buttons/octocat';
import { v4 as uuidv4 } from 'uuid';
import GamePage from './pages/game_page';
import HomePage from './pages/home_page';
import TwitchOAuthPage from './pages/twitch_oauth_page';
import { store, history } from './store';
import { FloatingButtonBar } from 'ui/floating_bar';

const RenderCanvas = styled('canvas', {
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100dvh',
  zIndex: 500,
  pointerEvents: 'none',
  touchAction: 'none',
});

const App = () => {
  // make a cookie DONT FORGET TO SET THE PATH AHHHHHHHHHHHHHHHHHHHH
  if (!document.cookie.includes('_session')) {
    document.cookie = `_session=${uuidv4()}; Path=/`;
  }

  return (
    <StrictMode>
      <ToastContainer
        theme={'dark'}
        closeButton={false}
        position={'bottom-center'}
      />
      <Provider store={store}>
        <AppInner />
      </Provider>
    </StrictMode>
  );
};

const app = css({
  backgroundColor: '$gray900',
  marign: 0,
  minHeight: '100vh',
  '@bp0': {
    padding: 8,
    minHeight: 'initial',
    height: 'calc(100dvh - 16px)',
  },
});

const container = css({
  '@bp1': {
    height: 700,
    width: 1080,
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -1080 / 2,
    marginTop: -700 / 2,
  },
  '@bp0': {
    height: '100%',
  },
  '& h1': {
    fontFamily: 'Caveat',
    marginBottom: 32,
    fontSize: 66,
  },
});

const innerContainer = css({
  '@bp1': {
    backgroundColor: '$gray800',
    display: 'flex',
    borderRadius: 16,
    margin: 24,
    padding: 48,
    height: 'calc(100% - 96px - 48px)',
    justifyContent: 'space-between',
    gap: 24,
  },
  '@bp0': {
    '& p,h1': {
      textAlign: 'center',
    },
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    justifyContent: 'space-between',
  },
  '& table': {
    width: '100%',
    textAlign: 'left',
  },
});

const AppInner = () => {
  globalStyles();
  const size = useWindowSize();
  const transformString =
    size!.width! >= 480
      ? `scale(${Math.min(
          1,
          Math.min(size!.width! / 1080, size.height! / 740)
        )})`
      : 'scale(1)';

  const theme = useSelector(selectCurrentTheme);
  const colors = useSelector(selectCurrentColors);

  return (
    <div
      style={
        {
          '--custom-hue': `${colors?.hue || 0}`,
          '--custom-sat': `${colors?.sat || 0}%`,
        } as any
      }
    >
      <div className={theme}>
        <AuthProvider>
          <AchievementProvider>
            <Router history={history}>
              <div className={app()}>
                <Octocat />
                <div
                  className={container()}
                  style={{ transform: transformString }}
                >
                  <div className={innerContainer()}>
                    <FloatingButtonBar />
                    <Routes>
                      <Route path="/">
                        <Route index element={<HomePage />} />
                        <Route path="home" element={<HomePage />} />
                        <Route
                          path="twitch_oauth"
                          element={<TwitchOAuthPage />}
                        />
                        <Route
                          path="multiple-tabs"
                          element={
                            <GenericErrorPage
                              error={
                                'You already have that room open in another tab.'
                              }
                            />
                          }
                        />
                        <Route
                          path="kicked"
                          element={
                            <GenericErrorPage
                              error={
                                'You have been kicked from the session for inactivity.'
                              }
                            />
                          }
                        />
                        <Route
                          path="room/:room"
                          element={<GamePage mode={'room'} />}
                        />
                        <Route
                          path="spectate/:room"
                          element={<GamePage mode={'spectate'} />}
                        />
                      </Route>
                    </Routes>
                  </div>
                </div>
              </div>
              <RenderCanvas id="renderCanvas" />
            </Router>
          </AchievementProvider>
        </AuthProvider>
      </div>
    </div>
  );
};

export default App;
