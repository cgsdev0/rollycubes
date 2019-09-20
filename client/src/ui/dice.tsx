import React from 'react';
import { connect } from 'react-redux';
import { selectDiceRolls } from '../selectors/game_selectors';
import { DieRoll, ReduxState } from '../store';
import './buttons/buttons.css';
import './dice.css';
import Die from './die';

interface Props {
    dice: ReduxState["rolls"];
    rolling: "rolled" | "rolling";
}



class Dice extends React.Component<Props> {


    render() {
        const { dice, rolling } = this.props;
        return (
                <div className="diceBox">
                    {dice.map((die: DieRoll, i: number) => (<Die key={i} roll={die} n={i} rolling={rolling} />))}
                </div>
        );
    }
}

const mapStateToProps = (state: ReduxState) => {
    return {
        dice: selectDiceRolls(state),
    }
}

export default connect(mapStateToProps)(Dice);