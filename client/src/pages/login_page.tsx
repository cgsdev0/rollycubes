import React from "react";
import { RequiresSession } from "../hocs/requires_session";
import { connect, DispatchProp } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";
import { Link } from "react-router-dom";
import { getCsrf } from "../auth";
import { selectAuthService } from "../selectors/game_selectors";
import { ReduxState } from "../store";
import { TwitchButton } from "../twitch";

interface Props {
  authService: string;
  authToken?: string | null;
}

function useQuery() {
  return new URLSearchParams(useLocation().search);
}
const LoginPage: React.FC<DispatchProp & Props> = (props) => {
  const query = useQuery();
  const [username, setUsername] = React.useState<string>(
    query.get("registered") || ""
  );
  const [password, setPassword] = React.useState("");

  const { authToken, authService, dispatch } = props;

  const login = async (e: any) => {
    e.preventDefault();
    const response = await window.fetch(authService + "login", {
      method: "post",
      mode: "cors",
      body: JSON.stringify({ username, password }),
      credentials: "include",
      headers: {
        "csrf-token": await getCsrf(authService),
        "Content-Type": "application/json",
      },
    });
    const { access_token } = await response.json();
    if (access_token) {
      dispatch({ type: "AUTHENTICATE", access_token });
    }
  };

  const location = useLocation();
  if (authToken)
    return (
      <Navigate to="/home" replace state={{ redirect: location.pathname }} />
    );

  return (
    <div className="loginContainer">
      <h1>Rolly Cubes</h1>
      <p>the one where you roll some dice</p>
      <form onSubmit={login}>
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
          <button type="submit" onClick={login}>
            Login
          </button>
        </div>
      </form>
      <TwitchButton />
      <p>
        Need an account? <Link to="/register">Register</Link>
      </p>
    </div>
  );
};

const mapStateToProps = (state: ReduxState) => {
  return {
    authService: selectAuthService(state),
    authToken: state.auth.authToken,
  };
};

const ConnectedLoginPage = connect(mapStateToProps)(LoginPage);
export default RequiresSession(ConnectedLoginPage);
