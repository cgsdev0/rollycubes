import React from "react";
import { connect } from "react-redux";
import { selectAuthService } from "./selectors/game_selectors";
import { ReduxState } from "./store";

const twitchLogin = (authService: string) => () => {
  document.location =
    `${authService}twitch` +
    `?redirect=${document.location.origin}/twitch_oauth`;
};

const UnconnectedTwitchButton: React.FC<{ authService: string }> = ({
  authService,
}) => {
  return (
    <button onClick={twitchLogin(authService)} className="twitchButton">
      Login With Twitch
    </button>
  );
};

const mapStateToProps = (state: ReduxState) => {
  return {
    authService: selectAuthService(state),
  };
};
export const TwitchButton = connect(mapStateToProps)(UnconnectedTwitchButton);
