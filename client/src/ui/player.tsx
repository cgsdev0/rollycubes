import React from 'react';
import { connect } from 'react-redux';
import '../App.css';
import { selectSelfIndex, selectTurnIndex } from '../selectors/game_selectors';
import { Player, ReduxState } from '../store';

interface Props {
    player: Player;
    n: number;
    self_index: number;
    turn_index: number;
    socket?: WebSocket;
}

class PlayerComponent extends React.Component<Props> {

    changeName = () => {
        const e = window.prompt("Enter a name: ", this.props.player.name);
        if (e === null) return;
        if (this.props.socket) {
            this.props.socket.send(JSON.stringify({ type: "update_name", name: e }))
        }
    }

    onKick = () => {
        const { player, n } = this.props;
        const e = window.confirm(`Are you sure you want to kick ${player.name}?`)
        if (e && this.props.socket) {
            this.props.socket.send(JSON.stringify({ type: "kick", id: n }))
        }
    }

    render() {
        const { n, player, self_index, turn_index } = this.props;
        return (
            <div
                className={`Player${turn_index === n ? " Turn" : ""}${!player.connected ? " Disconnected" : ""}`}
                onClick={self_index === n ? this.changeName : player.connected ? undefined : this.onKick}
            >
                <div className="Name">
                    {player.name || `User${n + 1}`}
                    <div className="You">
                        {self_index === n ? " (You)" : null}
                    </div>
                </div>
                <div className="Score">
                    {JSON.stringify(player.score)}
                </div>
            </div>
        );
    }
}

const mapStateToProps = (state: ReduxState) => {
    return {
        self_index: selectSelfIndex(state),
        turn_index: selectTurnIndex(state),
        socket: state.socket,
    }
}

export default connect(mapStateToProps)(PlayerComponent);