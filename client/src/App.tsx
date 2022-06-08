import React from "react";
import { v4 as uuidv4 } from "uuid";
import { connect, Provider } from "react-redux";
import { BrowserRouter as Router, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";
import { RequiresSession } from "./hocs/requires_session";
import TwitchOAuthPage from "./pages/twitch_oauth_page";
import GamePage from "./pages/game_page";
import HomePage from "./pages/home_page";
import LoginPage from "./pages/login_page";
import RegisterPage from "./pages/register_page";
import { ReduxState, store } from "./store";
import LoginPrompt from "./ui/login_prompt";
import SettingsMenu from "./ui/settings";

const App = () => {
  // make a cookie DONT FORGET TO SET THE PATH AHHHHHHHHHHHHHHHHHHHH
  if (!document.cookie.includes("_session")) {
    document.cookie = `_session=${uuidv4()}; Path=/; Secure`;
  }

  return (
    <>
      <ToastContainer
        theme={"dark"}
        closeButton={false}
        position={"bottom-center"}
      />
      <Provider store={store}>
        <AppInner />
      </Provider>
    </>
  );
};

const AppInner = () => {
  return (
    <Router>
      <div className="App">
        <SettingsMenu />
        <LoginPrompt />
        <Route path="/" component={RequiresSession(HomePage)} exact />
        <Route path="/home" component={RequiresSession(HomePage)} exact />
        <Route path="/twitch_oauth" component={TwitchOAuthPage} />
        <Route path="/login" component={RequiresSession(LoginPage)} />
        <Route path="/register" component={RequiresSession(RegisterPage)} />
        <Route path="/multiple-tabs" component={TabErrorPage} />
        <Route path="/:mode/:room" component={RequiresSession(GamePage)} />
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
