import React from 'react';
import { DieRoll } from '../store';
import './dice.css';

interface Props {
    roll: DieRoll;
    rolling: "rolling" | "rolled";
    n: number;
}



class Die extends React.Component<Props> {

    render() {
        const { roll, rolling, n } = this.props;
        return (<div className={`dice ${rolling === "rolling" ? ("LR"[n % 2]) : ""}${rolling}${roll.value}`} />);
    }
}



export default Die;