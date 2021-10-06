import React from "react";
import { Provider } from "react-redux";
import { BrowserRouter as Router, Route } from "react-router-dom";
import "./App.css";
import GamePage from "./pages/game_page";
import { store } from "./store";
import HomePage from "./pages/home_page";
import CookiePage from "./pages/cookie_page";
import { connect } from "react-redux";
import { ReduxState } from "./store";
import { ThemeContext } from "./themes";
import SettingsMenu from "./ui/settings";

const mapStateToProps = (state: ReduxState) => ({
  theme: state.settings.theme,
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
    <Provider store={store}>
      <AppThemer />
    </Provider>
  );
};

const AppInner = () => {
  const theme = React.useContext(ThemeContext);
  return (
    <Router>
      <div className="App" style={theme.app}>
        <SettingsMenu />
        <Route path="/" exact component={CookiePage} />
        <Route path="/home" component={HomePage} />
        <Route path="/multiple-tabs" component={TabErrorPage} />
        <Route path="/:mode/:room" component={GamePage} />
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
