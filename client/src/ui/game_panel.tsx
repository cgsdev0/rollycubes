import React from 'react';
import { connect } from 'react-redux';
import { selectShouldShowRoll, selectShouldShowAddSub } from '../selectors/game_selectors';
import { ReduxState } from '../store';
import RollButton from './buttons/roll_button';
import AddSubButton from './buttons/add_sub_button';

interface Props {
    roll: boolean;
    addSub: boolean;
}

class GamePanel extends React.Component<Props> {
    renderRoll = () => {
        return (this.props.roll ? <RollButton /> : null);
    }
    renderAddSub = () => {
        return (this.props.addSub ? (<AddSubButton />) : null);
    }
    render() {
        return (<div>{this.renderRoll()}{this.renderAddSub()}</div>);
    }
}

const mapStateToProps = (state: ReduxState) => {
    return {
        roll: selectShouldShowRoll(state),
        addSub: selectShouldShowAddSub(state),
    }
}


export default connect(mapStateToProps)(GamePanel);