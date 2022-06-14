import React from "react";
import { connect } from "react-redux";
import { ReduxState } from "../../store";
import { selectHasMultiplePlayers } from "../../selectors/game_selectors";

interface Props {
  socket?: WebSocket;
  hasEnoughPlayers: boolean;
}

const RollButton: React.FC<Props> = ({ socket, hasEnoughPlayers }) => {
  const onClick = () => {
    if (socket) {
      socket.send(JSON.stringify({ type: "roll" }));
    }
  };
  if (!hasEnoughPlayers) return <p>Waiting for players...</p>;
  return <button onClick={onClick}>Roll</button>;
};

const mapStateToProps = (state: ReduxState) => {
  return {
    socket: state.connection.socket,
    hasEnoughPlayers: selectHasMultiplePlayers(state),
  };
};

export default connect(mapStateToProps)(RollButton);
