import React from "react";
import { connect } from "react-redux";
import { ReduxState } from "../../store";
import { selectHasMultiplePlayers } from "../../selectors/game_selectors";
import { css } from "stitches.config";

interface Props {
  socket?: WebSocket;
  hasEnoughPlayers: boolean;
}

const subtitle = css({
  color: "$primaryDimmed",
  textAlign: "center",
  width: "100%",
  paddingTop: 12,
  fontSize: 16,
});

const RollButton: React.FC<Props> = ({ socket, hasEnoughPlayers }) => {
  const onClick = () => {
    if (socket) {
      socket.send(JSON.stringify({ type: "roll" }));
    }
  };
  if (!hasEnoughPlayers)
    return <p className={subtitle()}>Waiting for players...</p>;
  return <button onClick={onClick}>Roll</button>;
};

const mapStateToProps = (state: ReduxState) => {
  return {
    socket: state.connection.socket,
    hasEnoughPlayers: selectHasMultiplePlayers(state),
  };
};

export default connect(mapStateToProps)(RollButton);
