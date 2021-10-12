import React from "react";
import { connect, DispatchProp } from "react-redux";
import "../App.css";
import { ReduxState } from "../store";
import "../ui/buttons/buttons.css";
import {
  selectAuthService,
  selectSelfFirstInitial,
  selectSelfImageUrl,
} from "../selectors/game_selectors";
import { Link } from "react-router-dom";

interface Props {
  authToken?: string | null;
  authService: string;
  imageUrl?: string | null;
  firstInitial: string;
}

const LoginPrompt: React.FC<Props & DispatchProp> = (props) => {
  const { authToken, dispatch, authService, imageUrl, firstInitial } = props;

  React.useEffect(() => {
    (async () => {
      if (!authToken) return;
      const response = await window.fetch(authService + "me", {
        mode: "cors",
        credentials: "include",
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
        imageUrl ? (
          <img alt="avatar" src={imageUrl} width={24} height={24} />
        ) : (
          <div className="avatar">{firstInitial}</div>
        )
      ) : null}
    </div>
  );
};

const mapStateToProps = (state: ReduxState) => {
  return {
    authToken: state.authToken,
    authService: selectAuthService(state),
    imageUrl: selectSelfImageUrl(state),
    firstInitial: selectSelfFirstInitial(state),
  };
};

export default connect(mapStateToProps)(LoginPrompt);
