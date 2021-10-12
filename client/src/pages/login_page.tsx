import React from "react";
import { connect, DispatchProp } from "react-redux";
import { Link, RouteComponentProps } from "react-router-dom";
import { selectAuthService } from "../selectors/game_selectors";
import { ReduxState } from "../store";
import "./login.css";

interface Props {
  route: RouteComponentProps;
  authService: string;
  authToken?: string | null;
}

const LoginPage: React.FC<DispatchProp & Props> = (props) => {
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");

  const { route, authToken, authService, dispatch } = props;

  React.useEffect(() => {
    if (authToken) {
      route.history.replace("/home", {
        redirect: route.history.location.pathname,
      });
    }
  }, [route, authToken]);
  const login = async () => {
    const csrf = await window.fetch(authService + "csrf");
    const { csrfToken } = await csrf.json();
    const response = await window.fetch(
      authService + "login?_csrf=" + csrfToken,
      {
        method: "post",
        body: JSON.stringify({ _csrf: csrfToken, username, password }),
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    const { access_token } = await response.json();
    if (access_token) {
      dispatch({ type: "AUTHENTICATE", access_token });
    }
  };

  React.useEffect(() => {
    if (!document.cookie.includes("_session")) {
      route.history.replace("/", {
        redirect: route.history.location.pathname,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!document.cookie.includes("_session")) {
    return null;
  }
  return (
    <div>
      <h1>Dice Game</h1>
      <p>the one where you roll some dice</p>
      <div className="loginForm">
        <input onChange={(e) => setUsername(e.target.value)} value={username} />
        <input
          onChange={(e) => setPassword(e.target.value)}
          value={password}
          type="password"
        />
        <button onClick={login}>Login</button>
      </div>
      <p>
        Need an account? <Link to="#">Register</Link>
      </p>
    </div>
  );
};

const mapStateToProps = (state: ReduxState) => {
  return {
    authService: selectAuthService(state),
    authToken: state.authToken,
  };
};

const ConnectedLoginPage = connect(mapStateToProps)(LoginPage);
export default (a: RouteComponentProps) => <ConnectedLoginPage route={a} />;
