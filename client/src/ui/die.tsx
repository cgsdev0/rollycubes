import React from 'react';
import { DieRoll } from '../store';
import './dice.css';

interface Props {
    roll: DieRoll;
    rolling: "rolling" | "rolled";
    n: number;
    is3d: boolean;
}



class Die extends React.Component<Props> {

    render() {
        const { roll, rolling, n, is3d } = this.props;
        if(is3d) {
            return (<div className={`bigDiceText`}>{`${roll.value}`}</div>);
        }
        return (<div className={`dice ${rolling === "rolling" ? ("LR"[n % 2]) : ""}${rolling}${roll.value}`} />);
    }
}



export default Die;
