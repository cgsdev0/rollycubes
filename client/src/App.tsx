import { useWindowSize } from 'hooks/window_size'
import { TabErrorPage } from 'pages/tab_error_page'
import { AchievementProvider } from 'providers/achievements'
import { AuthProvider } from 'providers/auth'
import { StrictMode } from 'react'
import { Provider } from 'react-redux'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { styled, css, globalStyles } from 'stitches.config'
import { Octocat } from 'ui/buttons/octocat'
import { v4 as uuidv4 } from 'uuid'
import GamePage from './pages/game_page'
import HomePage from './pages/home_page'
import OnboardPage from './pages/onboard_page'
import TwitchOAuthPage from './pages/twitch_oauth_page'
import { store } from './store'

const RenderCanvas = styled('canvas', {
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  zIndex: 500,
  pointerEvents: 'none',
  touchAction: 'none',
})

const App = () => {
  // make a cookie DONT FORGET TO SET THE PATH AHHHHHHHHHHHHHHHHHHHH
  if (!document.cookie.includes('_session')) {
    document.cookie = `_session=${uuidv4()}; Path=/; Secure`
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
  )
}

const app = css({
  backgroundColor: '#151515',
  marign: 0,
  minHeight: '100vh',
  '@bp0': {
    padding: 8,
    minHeight: 'initial',
    height: 'calc(100vh - 16px)',
  },
})

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
})

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
})

const AppInner = () => {
  globalStyles()
  const size = useWindowSize()
  const transformString =
    size!.width! >= 480
      ? `scale(${Math.min(
          1,
          Math.min(size!.width! / 1080, size.height! / 740)
        )})`
      : 'scale(1)'

  return (
    <AuthProvider>
      <AchievementProvider>
        <Router>
          <div className={app()}>
            <Octocat />
            <div className={container()} style={{ transform: transformString }}>
              <div className={innerContainer()}>
                <Routes>
                  <Route path="/">
                    <Route index element={<HomePage />} />
                    <Route path="home" element={<HomePage />} />
                    <Route path="twitch_oauth" element={<TwitchOAuthPage />} />
                    <Route path="onboard" element={<OnboardPage />} />
                    <Route path="multiple-tabs" element={<TabErrorPage />} />
                    <Route path=":mode/:room" element={<GamePage />} />
                  </Route>
                </Routes>
              </div>
            </div>
          </div>
          <RenderCanvas id="renderCanvas" />
        </Router>
      </AchievementProvider>
    </AuthProvider>
  )
}

export default App
