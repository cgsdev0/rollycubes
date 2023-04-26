import React from 'react';
import { connect } from 'react-redux';
import { selectIsSpectator } from 'selectors/game_selectors';
import { ReduxState } from '../../store';
import './buttons.css';

interface Props {
  socket?: WebSocket;
  isSpectator: boolean;
}

const RollButton: React.FC<Props> = ({ socket, isSpectator }) => {
  const onClick = () => {
    if (socket) {
      socket.send(JSON.stringify({ type: 'restart' }));
    }
  };
  return isSpectator ? null : (
    <button className="topButton" onClick={onClick}>
      New Game
    </button>
  );
};

const mapStateToProps = (state: ReduxState) => {
  return {
    socket: state.connection.socket,
    isSpectator: selectIsSpectator(state),
  };
};

export default connect(mapStateToProps)(RollButton);
