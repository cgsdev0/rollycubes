import React from 'react';
import { connect } from 'react-redux';
import { selectIsSpectator } from 'selectors/game_selectors';
import { ReduxState } from '../../store';
import { Button } from './button';

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
  return isSpectator ? null : <Button onClick={onClick}>New Game</Button>;
};

const mapStateToProps = (state: ReduxState) => {
  return {
    socket: state.connection.socket,
    isSpectator: selectIsSpectator(state),
  };
};

export default connect(mapStateToProps)(RollButton);
