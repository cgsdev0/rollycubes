import React from "react";
import { connect, DispatchProp } from "react-redux";
import { RouteComponentProps } from "react-router-dom";
import { getCsrf } from "../auth";
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
  const [password2, setPassword2] = React.useState("");
  const [isPressed, setIsPressed] = React.useState(false);
  const [errorText, setErrorText] = React.useState("");

  const { route, authToken, authService } = props;

  React.useEffect(() => {
    if (authToken) {
      route.history.replace("/home", {
        redirect: route.history.location.pathname,
      });
    }
  }, [route, authToken]);
  const register = async (e: any) => {
    setIsPressed(true);
    try {
      e.preventDefault();
      const response = await window.fetch(authService + "register", {
        method: "post",
        mode: "cors",
        body: JSON.stringify({ username, password }),
        credentials: "include",
        headers: {
          "csrf-token": await getCsrf(authService),
          "Content-Type": "application/json",
        },
      });
      if (response.status === 200) {
        route.history.replace("/login?registered=" + username, {
          redirect: route.history.location.pathname,
        });
      } else {
        const error = await response.text();
        setErrorText(error);
      }
    } finally {
      setIsPressed(false);
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
      <form onSubmit={register}>
        <div className="loginForm">
          <input
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            value={username}
          />
          <input
            onChange={(e) => setPassword(e.target.value)}
            value={password}
            placeholder="Password"
            type="password"
          />
          <input
            onChange={(e) => setPassword2(e.target.value)}
            value={password2}
            placeholder="Confirm Password"
            type="password"
          />
          {errorText ? <p style={{ color: "red" }}>{errorText}</p> : null}
          <button
            type="submit"
            disabled={
              isPressed || !username || !password || password !== password2
            }
            onClick={register}
          >
            Create Account
          </button>
        </div>
      </form>
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
