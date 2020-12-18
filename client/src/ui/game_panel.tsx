import React from 'react';
import { connect, DispatchProp } from 'react-redux';
import { selectShouldShowRoll, selectShouldShowAddSub, selectRollCount, selectShouldShowSplitButtons, selectDiceRolls, selectIsGameOver, selectIsDoubles, selectIs3dRollHappening, selectIs3d } from '../selectors/game_selectors';
import { ReduxState, DieRoll } from '../store';
import RollButton from './buttons/roll_button';
import RestartButton from './buttons/restart_button';
import AddSubButton from './buttons/add_sub_button';
import Dice from './dice';
import '../App.css';
import '../ui/buttons/buttons.css';

interface Props {
    roll: boolean;
    addSub: boolean;
    rollCount: number;
    dice: DieRoll[];
    victory: boolean;
    isDoubles: boolean;
    buttons: boolean;
    is3d: boolean;
    is3dRolling: boolean;
}

interface State {
    rolling: "rolled" | "rolling";
}

class GamePanel extends React.Component<Props & DispatchProp, State> {
    constructor(props: Props & DispatchProp) {
        super(props);
        this.state = { rolling: "rolled" }
    }

    stopRolling = () => {
        this.setState({ rolling: "rolled" })
        if(this.props.isDoubles && !this.props.is3d) {
            this.props.dispatch({type: "DOUBLES"})
        }
    }

    componentDidUpdate(prev: Props) {
        if (prev.rollCount < this.props.rollCount) {
            this.setState({ rolling: "rolling" });
            setTimeout(this.stopRolling, 2500)
        }
    }

    isRollComplete = () => {
        if (this.props.is3d) return !this.props.is3dRolling;
        return this.state.rolling === "rolled";
    }
    renderRoll = () => {
        return (this.props.roll ? <RollButton /> : null);
    }
    renderAddSub = () => {
        if(this.props.victory) return null;
        return (this.isRollComplete() && this.props.addSub ? (<AddSubButton />) : null);
    }
    renderSplit = () => {
        const { dice, buttons, victory } = this.props;
        if(victory) return null;
        return buttons && this.isRollComplete() ?
            dice.map((die: DieRoll, n: number) =>
                (<div key={`buttonColumn${n}`} className="buttonColumn">
                    {!die.used ? <AddSubButton n={n} /> : null}
                </div>))
            : null;
    }
    render() {
        const { victory } = this.props;
        const { rolling } = this.state;
        return (
            <div className="GamePanel">
            <div className="GamePanelInner">
            {victory ? <RestartButton /> : null}
                <Dice rolling={rolling} />
                <div className="ButtonPanel">
                    {this.renderRoll()}
                    {this.renderAddSub()}
                    {this.renderSplit()}
                </div>
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
        isDoubles: selectIsDoubles(state),
        dice: selectDiceRolls(state),
        buttons: selectShouldShowSplitButtons(state),
        victory: selectIsGameOver(state),
        is3d: selectIs3d(state),
        is3dRolling: selectIs3dRollHappening(state),
    }
}


export default connect(mapStateToProps)(GamePanel);
