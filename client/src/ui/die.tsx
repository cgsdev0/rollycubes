import React from 'react';
import { DieRoll } from '../store';
import './dice.css';

interface Props {
    roll: DieRoll;
    rolling: "rolling" | "rolled";
}



class Die extends React.Component<Props> {

    render() {
        const { roll, rolling } = this.props;
        return (<div className={`dice ${rolling}${roll.value}`} />);
    }
}



export default Die;