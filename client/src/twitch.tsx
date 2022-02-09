import React from "react";
import "./pages/login.css";

const twitchLogin = () => {
  document.location =
    "http://localhost:3031/twitch" +
    `?redirect=${document.location.origin}/twitch_oauth`;
};

export const TwitchButton: React.FC<{}> = () => {
  return (
    <button onClick={twitchLogin} className="twitchButton">
      Login With Twitch
    </button>
  );
};
