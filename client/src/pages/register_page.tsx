import React from "react";
import { connect, DispatchProp } from "react-redux";
import { RouteComponentProps } from "react-router-dom";
import { getCsrf } from "../auth";
import { selectAuthService } from "../selectors/game_selectors";
import { ReduxState } from "../store";
import { TwitchButton } from "../twitch";
import "./login.css";

interface Props {
  authService: string;
  authToken?: string | null;
}

const LoginPage: React.FC<DispatchProp &
  Props &
  RouteComponentProps> = props => {
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [password2, setPassword2] = React.useState("");
  const [isPressed, setIsPressed] = React.useState(false);
  const [errorText, setErrorText] = React.useState("");

  const { authToken, authService, history } = props;

  React.useEffect(() => {
    if (authToken) {
      history.replace("/home", {
        redirect: history.location.pathname
      });
    }
  }, [history, authToken]);
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
          "Content-Type": "application/json"
        }
      });
      if (response.status === 200) {
        history.replace("/login?registered=" + username, {
          redirect: history.location.pathname
        });
      } else {
        const error = await response.text();
        setErrorText(error);
      }
    } finally {
      setIsPressed(false);
    }
  };

  return (
    <div className="loginContainer">
      <h1>Rolly Cubes</h1>
      <p>the one where you roll some dice</p>
      <form onSubmit={register}>
        <div className="loginForm">
          <input
            onChange={e => setUsername(e.target.value)}
            placeholder="Username"
            value={username}
          />
          <input
            onChange={e => setPassword(e.target.value)}
            value={password}
            placeholder="Password"
            type="password"
          />
          <input
            onChange={e => setPassword2(e.target.value)}
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
      <TwitchButton />
    </div>
  );
};

const mapStateToProps = (state: ReduxState) => {
  return {
    authService: selectAuthService(state),
    authToken: state.authToken
  };
};

const ConnectedLoginPage = connect(mapStateToProps)(LoginPage);
export default ConnectedLoginPage;
