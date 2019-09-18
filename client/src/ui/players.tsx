import React from 'react';
import { connect } from 'react-redux';
import { selectPlayers } from '../selectors/game_selectors';
import { Player, ReduxState } from '../store';
import PlayerComponent from './player';
import '../App.css';

interface Props {
    players: ReduxState["players"];
}

class Players extends React.Component<Props> {
    render() {
        return (<div className="PlayerPanel">{this.props.players.map((player: Player, i: number) => (<PlayerComponent key={`${i}${player.name}`} n={i} player={player} />))}</div>);
    }
}

const mapStateToProps = (state: ReduxState) => {
    return {
        players: selectPlayers(state),
    }
}


export default connect(mapStateToProps)(Players);