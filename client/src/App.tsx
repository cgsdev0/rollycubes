import React from "react";
import { connect, Provider } from "react-redux";
import { BrowserRouter as Router, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";
import { RequiresSession } from "./hocs/requires_session";
import CookiePage from "./pages/cookie_page";
import GamePage from "./pages/game_page";
import HomePage from "./pages/home_page";
import LoginPage from "./pages/login_page";
import RegisterPage from "./pages/register_page";
import { ReduxState, store } from "./store";
import { ThemeContext } from "./themes";
import LoginPrompt from "./ui/login_prompt";
import SettingsMenu from "./ui/settings";

const mapStateToProps = (state: ReduxState) => ({
  theme: state.settings.theme
});

const AppThemer = connect(mapStateToProps)(
  ({ theme }: { theme: ReduxState["settings"]["theme"] }) => {
    return (
      <ThemeContext.Provider value={theme}>
        <AppInner />
      </ThemeContext.Provider>
    );
  }
);

const App = () => {
  return (
    <>
      <ToastContainer
        theme={"dark"}
        closeButton={false}
        position={"bottom-center"}
      />
      <Provider store={store}>
        <AppThemer />
      </Provider>
    </>
  );
};

const AppInner = () => {
  const theme = React.useContext(ThemeContext);
  return (
    <Router>
      <div className="App" style={theme.app}>
        <SettingsMenu />
        <LoginPrompt />
        <Route path="/" exact component={CookiePage} />
        <Route path="/home" component={RequiresSession(HomePage)} />
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
      <a href="/home">Back to Home</a>
    </div>
  );
};

export default App;
