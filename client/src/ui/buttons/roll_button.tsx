import React from 'react';
import { connect } from 'react-redux';
import { ReduxState } from '../../store';
import './buttons.css';
import { selectHasMultiplePlayers } from '../../selectors/game_selectors';

interface Props {
    socket?: WebSocket;
    hasEnoughPlayers: boolean;
}

class RollButton extends React.Component<Props> {

    onClick = () => {
        if(this.props.socket) {
            this.props.socket.send(JSON.stringify({type: "roll"}));
        }
    }
    render() {
        if(!this.props.hasEnoughPlayers) return (<p>Waiting for players...</p>);
        return (<button onClick={this.onClick}>Roll</button>);
    }
}


const mapStateToProps = (state: ReduxState) => {
    return {
        socket: state.socket,
        hasEnoughPlayers: selectHasMultiplePlayers(state),
    }
}

export default connect(mapStateToProps)(RollButton);
