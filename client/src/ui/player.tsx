import React from 'react';
import {connect} from 'react-redux';
import '../App.css';
import {selectSelfIndex, selectTurnIndex} from '../selectors/game_selectors';
import {Player, ReduxState} from '../store';
import {ThemeContext} from '../themes';

import {initScene} from "../3d/main";

interface Props {
  player: Player;
  n: number;
  self_index: number;
  turn_index: number;
  socket?: WebSocket;
}

const PlayerComponent = (props: Props) => {
  const changeName = () => {
    const e = window.prompt('Enter a name: ', props.player.name);
    if (e === null) return;
    if (props.socket) {
      props.socket.send(JSON.stringify({type: 'update_name', name: e}));
      localStorage.setItem('name', e);
    }
  };

  const doSome3Dstuff = () => initScene();

  const onKick = () => {
    const {player, n} = props;
    const e = window.confirm(`Are you sure you want to kick ${player.name}?`);
    if (e && props.socket) {
      props.socket.send(JSON.stringify({type: 'kick', id: n}));
    }
  };

  React.useEffect(() => doSome3Dstuff(), []);
  const {n, player, self_index, turn_index} = props;
  const theme = React.useContext(ThemeContext);
  return (
    <div
      className={`Player${!player.connected ? ' Disconnected' : ''}`}
      style={turn_index === n ? theme.turnHighlight : undefined}
      onClick={
        self_index === n ? changeName : player.connected ? undefined : onKick
      }>
      <div className="Name">
        {player.name || `User${n + 1}`}
        <div className="You">{self_index === n ? ' (You)' : null}</div>
      </div>
      <div className="Score">{JSON.stringify(player.score)}</div>
    </div>
  );
};

const mapStateToProps = (state: ReduxState) => {
  return {
    self_index: selectSelfIndex(state),
    turn_index: selectTurnIndex(state),
    socket: state.socket,
  };
};

export default connect(mapStateToProps)(PlayerComponent);
