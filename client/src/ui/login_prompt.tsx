import React from "react";
import { connect, DispatchProp } from "react-redux";
import { Link } from "react-router-dom";
import "../App.css";
import {
  selectAuthService,
  selectSelfFirstInitial,
  selectSelfImageUrl,
} from "../selectors/game_selectors";
import { ReduxState } from "../store";
import AuthSettings from "../ui/auth_menu";
import "../ui/buttons/buttons.css";
import Avatar from "./avatar";

interface Props {
  authToken?: string | null;
  authService: string;
  imageUrl?: string | null;
  firstInitial: string;
}

const LoginPrompt: React.FC<Props & DispatchProp> = (props) => {
  const { authToken, dispatch, authService, imageUrl, firstInitial } = props;

  const [isOpen, setIsOpen] = React.useState(false);

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
        } else {
          throw new Error("unable to get token");
        }
      } catch (e) {
        dispatch({ type: "AUTHENTICATE", access_token: null });
      }
    })();
  }, [authService, dispatch]);

  // Attempt to populate userData store when we get an authToken
  React.useEffect(() => {
    (async () => {
      if (!authToken) {
        setIsOpen(false);
        return;
      }
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
        <>
          <div
            onClick={() => setIsOpen(true)}
            style={{ display: "flex", justifyContent: "flex-end" }}
          >
            <Avatar imageUrl={imageUrl} firstInitial={firstInitial} />
          </div>
          <AuthSettings isOpen={isOpen} setIsOpen={setIsOpen} />
        </>
      ) : null}
    </div>
  );
};

const mapStateToProps = (state: ReduxState) => {
  return {
    authToken: state.auth.authToken,
    authService: selectAuthService(state),
    imageUrl: selectSelfImageUrl(state),
    firstInitial: selectSelfFirstInitial(state),
  };
};

export default connect(mapStateToProps)(LoginPrompt);
