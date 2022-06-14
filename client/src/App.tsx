import React, { StrictMode } from "react";
import { Provider } from "react-redux";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { v4 as uuidv4 } from "uuid";
import "./App.css";
import GamePage from "./pages/game_page";
import HomePage from "./pages/home_page";
import LoginPage from "./pages/login_page";
import RegisterPage from "./pages/register_page";
import TwitchOAuthPage from "./pages/twitch_oauth_page";
import { store } from "./store";
import LoginPrompt from "./ui/login_prompt";
import SettingsMenu from "./ui/settings";

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

const AppInner = () => {
  return (
    <Router>
      <div className="App">
        <SettingsMenu />
        <LoginPrompt />
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
    </Router>
  );
};

const TabErrorPage = () => {
  return (
    <div style={{ marginTop: "40vh", textAlign: "center" }}>
      <h1>Error</h1>
      <p>You already have a tab opened for that room.</p>
      <a href="/">Back to Home</a>
    </div>
  );
};

export default App;
