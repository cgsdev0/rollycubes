import React from "react";
import { connect, DispatchProp } from "react-redux";
import { selectAuthService } from "../selectors/game_selectors";
import { getCsrf } from "../auth";
import { ReduxState } from "../store";
import { RouteComponentProps } from "react-router";

interface Props {
  authService: string;
  authToken?: string | null;
}

const TwitchOAuthPage: React.FC<DispatchProp & Props & RouteComponentProps> = ({
  authService,
  history,
  dispatch,
  authToken
}) => {
  React.useEffect(() => {
    if (authToken) {
      history.replace("/home", {
        redirect: history.location.pathname
      });
    }
  }, [history, authToken]);
  React.useEffect(() => {
    (async () => {
      const hash = window.location.hash.replace("#", "");
      const params = new URLSearchParams(hash);
      const twitch_access_token = params.get("access_token");
      const resp = await window.fetch(
        authService + "twitch_login_or_register",
        {
          mode: "cors",
          credentials: "include",
          body: JSON.stringify({ twitch_access_token }),
          headers: {
            "csrf-token": await getCsrf(authService),
            "Content-Type": "application/json"
          },
          method: "POST"
        }
      );
      const { access_token } = await resp.json();
      if (access_token) {
        dispatch({ type: "AUTHENTICATE", access_token });
      }
    })();
  }, []);

  return null;
};

const mapStateToProps = (state: ReduxState) => {
  return {
    authService: selectAuthService(state),
    authToken: state.authToken
  };
};

const ConnectedTwitchOAuthPage = connect(mapStateToProps)(TwitchOAuthPage);
export default ConnectedTwitchOAuthPage;
