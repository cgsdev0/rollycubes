import React from 'react';
import {connect} from 'react-redux';
import {selectDiceRolls, selectIs3d, selectShouldShowDiceBoxes} from '../selectors/game_selectors';
import {DieRoll, ReduxState} from '../store';
import './buttons/buttons.css';
import './dice.css';
import Die from './die';

interface Props {
    dice: ReduxState["rolls"];
    rolling: "rolled" | "rolling";
    is3d: boolean;
    showDiceBoxes: boolean;
}



class Dice extends React.Component<Props> {


    render() {
        const { dice, rolling, is3d, showDiceBoxes } = this.props;
        if(!showDiceBoxes) {
            return <div id="EmptyDiceBox" className="diceBox" />;
        }
        return (
                <div className="diceBox">
                    {dice.map((die: DieRoll, i: number) => (<Die key={i} roll={die} n={i} rolling={rolling} is3d={is3d} />))}
                </div>
        );
    }
}

const mapStateToProps = (state: ReduxState) => {
    return {
        dice: selectDiceRolls(state),
        is3d: selectIs3d(state),
        showDiceBoxes: selectShouldShowDiceBoxes(state),
    }
}

export default connect(mapStateToProps)(Dice);
