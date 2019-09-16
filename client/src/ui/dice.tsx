import React from 'react';
import { connect } from 'react-redux';
import { DieRoll, ReduxState } from '../store';
import Die from './die';
import { selectDiceRolls } from '../selectors/game_selectors';

interface Props {
    dice: ReduxState["rolls"];
}

class Dice extends React.Component<Props> {
    render() {
        return (<div>{this.props.dice.map((die: DieRoll, i: number) => (<Die key={i} n={i} roll={die} />))}</div>);
    }
}

const mapStateToProps = (state: ReduxState) => {
    return {
        dice: selectDiceRolls(state),
    }
}


export default connect(mapStateToProps)(Dice);