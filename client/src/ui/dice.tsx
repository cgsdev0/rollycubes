import React from 'react';
import { connect } from 'react-redux';
import {
  selectDiceRolls,
  selectIs3d,
  selectShouldShowDiceBoxes,
} from '../selectors/game_selectors';
import { ReduxState } from '../store';
import { DieRoll } from '../types/api';
import Die from './die';
import './dice.css';

interface Props {
  dice: ReduxState['game']['rolls'];
  rolling: 'rolled' | 'rolling';
  is3d: boolean;
  showDiceBoxes: boolean;
}

const Dice: React.FC<Props> = ({ dice, rolling, is3d, showDiceBoxes }) => {
  if (!showDiceBoxes) {
    return <div id="EmptyDiceBox" className="diceBox" />;
  }
  return (
    <div className="diceBox">
      {dice.map((die: DieRoll, i: number) => (
        <Die key={i} roll={die} n={i} rolling={rolling} is3d={is3d} />
      ))}
    </div>
  );
};

const mapStateToProps = (state: ReduxState) => {
  return {
    dice: selectDiceRolls(state),
    is3d: selectIs3d(state),
    showDiceBoxes: selectShouldShowDiceBoxes(state),
  };
};

export default connect(mapStateToProps)(Dice);
