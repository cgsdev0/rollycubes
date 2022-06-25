import { useWindowSize } from "hooks/window_size";
import { TabErrorPage } from "pages/tab_error_page";
import { AuthProvider } from "providers/auth";
import React, { StrictMode } from "react";
import { Provider } from "react-redux";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { css, globalCss, globalStyles } from "stitches.config";
import { Octocat } from "ui/buttons/octocat";
import { v4 as uuidv4 } from "uuid";
import GamePage from "./pages/game_page";
import HomePage from "./pages/home_page";
import LoginPage from "./pages/login_page";
import RegisterPage from "./pages/register_page";
import TwitchOAuthPage from "./pages/twitch_oauth_page";
import { store } from "./store";

const App = () => {
  // make a cookie DONT FORGET TO SET THE PATH AHHHHHHHHHHHHHHHHHHHH
  if (!document.cookie.includes("_session")) {
    document.cookie = `_session=${uuidv4()}; Path=/; Secure`;
  }

  return (
    <StrictMode>
      <ToastContainer
        theme={"dark"}
        closeButton={false}
        position={"bottom-center"}
      />
      <Provider store={store}>
        <AppInner />
      </Provider>
    </StrictMode>
  );
};

const app = css({
  backgroundColor: "#151515",
  marign: 0,
  minHeight: "100vh",
});

const container = css({
  height: 700,
  width: 1080,
  position: "absolute",
  top: "50%",
  left: "50%",
  marginLeft: -1080 / 2,
  marginTop: -700 / 2,
  "& h1": {
    fontFamily: "Caveat",
    marginBottom: 32,
    fontSize: 66,
  },
});

const innerContainer = css({
  backgroundColor: "#2A2A2A",
  display: "flex",
  borderRadius: 16,
  margin: 24,
  padding: 48,
  height: "calc(100% - 96px - 48px)",
  justifyContent: "space-between",
  gap: 24,
  "& table": {
    width: "100%",
    textAlign: "left",
  },
});

const AppInner = () => {
  globalStyles();
  const size = useWindowSize();
  const transformString = `scale(${Math.min(
    1,
    Math.min(size!.width! / 1080, size.height! / 700)
  )})`;
  return (
    <AuthProvider>
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
                  <Route path="login" element={<LoginPage />} />
                  <Route path="register" element={<RegisterPage />} />
                  <Route path="multiple-tabs" element={<TabErrorPage />} />

                  <Route path=":mode/:room" element={<GamePage />} />
                </Route>
              </Routes>
            </div>
          </div>
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;
