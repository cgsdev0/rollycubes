import React from 'react';
import { connect } from 'react-redux';
import { Player, ReduxState } from '../store';

interface Props {
    player: Player;
    n: number;
}
class PlayerComponent extends React.Component<Props> {
    render() {
        const { n, player } = this.props;
        return (<div>{player.name || `User${n+1}`} | {JSON.stringify(player.score)}</div>);
    }
}

const mapStateToProps = (state: ReduxState) => {
    return {
    }
}

export default connect(mapStateToProps)(PlayerComponent);