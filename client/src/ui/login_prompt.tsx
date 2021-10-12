import React from "react";
import { connect, DispatchProp } from "react-redux";
import "../App.css";
import { ReduxState } from "../store";
import "../ui/buttons/buttons.css";
import {
  selectAuthService,
  selectSelfImageUrl,
} from "../selectors/game_selectors";
import { Link } from "react-router-dom";

interface Props {
  authToken?: string | null;
  authService: string;
  imageUrl?: string;
}

const LoginPrompt: React.FC<Props & DispatchProp> = (props) => {
  const { authToken, dispatch, authService, imageUrl } = props;

  React.useEffect(() => {
    (async () => {
      if (!authToken) return;
      const response = await window.fetch(authService + "me", {
        headers: {
          "x-access-token": authToken,
        },
      });
      const userData = await response.json();
      dispatch({ type: "GOT_SELF_USER_DATA", userData });
    })();
  }, [authToken, dispatch, authService]);
  return (
    <div id="loginPrompt">
      {authToken === null ? <Link to="/login">Login</Link> : null}
      {authToken ? (
        <img alt="avatar" src={imageUrl} width={24} height={24} />
      ) : null}
    </div>
  );
};

const mapStateToProps = (state: ReduxState) => {
  return {
    authToken: state.authToken,
    authService: selectAuthService(state),
    imageUrl: selectSelfImageUrl(state),
  };
};

export default connect(mapStateToProps)(LoginPrompt);
