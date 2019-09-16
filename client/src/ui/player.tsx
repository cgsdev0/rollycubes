import React from 'react';
import { connect } from 'react-redux';
import { Player, ReduxState } from '../store';
import { selectSelfIndex } from '../selectors/game_selectors';

interface Props {
    player: Player;
    n: number;
    self_index: number;
}
class PlayerComponent extends React.Component<Props> {
    render() {
        const { n, player, self_index } = this.props;
        return (<div>{player.name || `User${n + 1}`} {n === self_index ? "(you)" : ""} | {JSON.stringify(player.score)} {player.connected ? "" : "(x)"}</div>);
    }
}

const mapStateToProps = (state: ReduxState) => {
    return {
        self_index: selectSelfIndex(state),
    }
}

export default connect(mapStateToProps)(PlayerComponent);