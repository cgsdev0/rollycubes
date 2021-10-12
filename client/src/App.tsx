import React from "react";
import { Provider, useDispatch, useSelector } from "react-redux";
import { BrowserRouter as Router, Route } from "react-router-dom";
import "./App.css";
import GamePage from "./pages/game_page";
import { store } from "./store";
import HomePage from "./pages/home_page";
import LoginPage from "./pages/login_page";
import CookiePage from "./pages/cookie_page";
import { connect } from "react-redux";
import { ReduxState } from "./store";
import { ThemeContext } from "./themes";
import SettingsMenu from "./ui/settings";
import LoginPrompt from "./ui/login_prompt";
import { selectAuthService } from "./selectors/game_selectors";

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
  const authService = useSelector(selectAuthService);
  const dispatch = useDispatch();
  React.useEffect(() => {
    // Attempt to get an access_token on boot
    (async () => {
      try {
        const response = await window.fetch(authService + "refresh_token", {
          mode: "cors",
          credentials: "include",
        });
        if (response.status === 200) {
          const { access_token } = await response.json();
          dispatch({ type: "AUTHENTICATE", access_token });
          console.log("Refreshed authentication");
        } else {
          throw new Error("unable to get token");
        }
      } catch (e) {
        dispatch({ type: "AUTHENTICATE", access_token: null });
      }
    })();
  }, [authService, dispatch]);
  return (
    <Router>
      <div className="App" style={theme.app}>
        <SettingsMenu />
        <LoginPrompt />
        <Route path="/" exact component={CookiePage} />
        <Route path="/home" component={HomePage} />
        <Route path="/login" component={LoginPage} />
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
