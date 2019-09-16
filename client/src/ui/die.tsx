import React from 'react';
import { DieRoll, ReduxState } from '../store';
import { connect } from 'react-redux';
import { selectShouldShowSplitButtons, selectRollCount, selectHasRolled } from '../selectors/game_selectors';
import AddSubButton from './buttons/add_sub_button';
import './dice.css';

interface Props {
    roll: DieRoll;
    n: number;
    buttons: boolean;
    rollCount: number;
    rolled: boolean;
}

interface State {
    rolling: "rolled" | "rolling";
}

class Die extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { rolling: "rolled" };
    }

    stopRolling = () => {
        this.setState({rolling: "rolled"})
    }

    componentDidUpdate(prev: Props) {
        if(prev.rollCount < this.props.rollCount) {
            this.setState({rolling: "rolling"});
            setTimeout(this.stopRolling, 2500)
        }
    }
    render() {
        const { roll, buttons, n, rollCount } = this.props;
        const { rolling } = this.state;
        return (<div><div key={rollCount} className={`dice ${rolling}${roll.value}`} />{buttons && !roll.used ? <AddSubButton n={n} /> : null}</div>);
    }
}

const mapStateToProps = (state: ReduxState) => {
    return {
        buttons: selectShouldShowSplitButtons(state),
        rollCount: selectRollCount(state),
        rolled: selectHasRolled(state),
    }
}

export default connect(mapStateToProps)(Die);