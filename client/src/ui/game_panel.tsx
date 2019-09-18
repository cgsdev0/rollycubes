import React from 'react';
import { connect } from 'react-redux';
import { selectShouldShowRoll, selectShouldShowAddSub, selectRollCount, selectShouldShowSplitButtons, selectDiceRolls } from '../selectors/game_selectors';
import { ReduxState, DieRoll } from '../store';
import RollButton from './buttons/roll_button';
import AddSubButton from './buttons/add_sub_button';
import Dice from './dice';
import '../App.css';
import '../ui/buttons/buttons.css';

interface Props {
    roll: boolean;
    addSub: boolean;
    rollCount: number;
    dice: DieRoll[];
    buttons: boolean;
}

interface State {
    rolling: "rolled" | "rolling";
}

class GamePanel extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { rolling: "rolled" }
    }

    stopRolling = () => {
        this.setState({ rolling: "rolled" })
    }

    componentDidUpdate(prev: Props) {
        if (prev.rollCount < this.props.rollCount) {
            this.setState({ rolling: "rolling" });
            setTimeout(this.stopRolling, 2500)
        }
    }

    renderRoll = () => {
        return (this.props.roll ? <RollButton /> : null);
    }
    renderAddSub = () => {
        return (this.state.rolling === "rolled" && this.props.addSub ? (<AddSubButton />) : null);
    }
    renderSplit = () => {
        const { dice, buttons } = this.props;
        const { rolling } = this.state;
        return buttons && rolling === "rolled" ?
            dice.map((die: DieRoll, n: number) =>
                (<div className="buttonColumn">
                    {!die.used ? <AddSubButton n={n} /> : null}
                </div>))
            : null;
    }
    render() {
        const { rolling } = this.state;
        return (
            <div className="GamePanel">
                <Dice rolling={rolling} />
                <div className="ButtonPanel">
                    {this.renderRoll()}
                    {this.renderAddSub()}
                    {this.renderSplit()}
                </div>
            </div>
        );
    }
}

const mapStateToProps = (state: ReduxState) => {
    return {
        roll: selectShouldShowRoll(state),
        addSub: selectShouldShowAddSub(state),
        rollCount: selectRollCount(state),
        dice: selectDiceRolls(state),
        buttons: selectShouldShowSplitButtons(state),
    }
}


export default connect(mapStateToProps)(GamePanel);