import React from "react";
import { connect } from "react-redux";
import { ReduxState } from "../../store";
import "./buttons.css";

interface Props {
  socket?: WebSocket;
}

const RollButton: React.FC<Props> = ({ socket }) => {
  const onClick = () => {
    if (socket) {
      socket.send(JSON.stringify({ type: "restart" }));
    }
  };
  return (
    <button className="topButton" onClick={onClick}>
      New Game
    </button>
  );
};

const mapStateToProps = (state: ReduxState) => {
  return {
    socket: state.socket,
  };
};

export default connect(mapStateToProps)(RollButton);

