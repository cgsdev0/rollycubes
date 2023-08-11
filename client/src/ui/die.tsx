import React from 'react';
import { DieRoll } from '../types/api';
import './dice.css';

interface Props {
  roll: DieRoll;
  rolling: 'rolling' | 'rolled';
  n: number;
  is3d: boolean;
}

const Die: React.FC<Props> = ({ roll, rolling, n, is3d }) => {
  if (is3d) {
    return <div className={`bigDiceText`}>{`${roll.value}`}</div>;
  }
  return (
    <div
      className={`dice ${rolling === 'rolling' ? 'LR'[n % 2] : ''}${rolling}${
        roll.value
      }`}
    />
  );
};

export default Die;
