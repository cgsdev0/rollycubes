import React from "react";
import { connect, DispatchProp } from "react-redux";
import {
  selectShouldShowRoll,
  selectShouldShowAddSub,
  selectRollCount,
  selectShouldShowSplitButtons,
  selectDiceRolls,
  selectIsGameOver,
  selectIsDoubles,
  selectIs3dRollHappening,
  selectIs3d,
} from "../selectors/game_selectors";
import { ReduxState } from "../store";
import RollButton from "./buttons/roll_button";
import RestartButton from "./buttons/restart_button";
import AddSubButton from "./buttons/add_sub_button";
import Dice from "./dice";
import { DieRoll } from "../types/store_types";

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

type RollingState = "rolled" | "rolling";

const GamePanel: React.FC<Props & DispatchProp> = ({
  isDoubles,
  is3d,
  is3dRolling,
  dispatch,
  addSub,
  rollCount,
  dice,
  victory,
  buttons,
  roll,
}) => {
  const [rolling, setRolling] = React.useState<RollingState>("rolled");

  const prevRollCount = React.useRef(0);

  const stopRolling = React.useCallback(() => {
    setRolling("rolled");
    if (isDoubles && !is3d) {
      dispatch({ type: "DOUBLES" });
    }
  }, [isDoubles, is3d, setRolling, dispatch]);

  React.useEffect(() => {
    if (prevRollCount.current < rollCount) {
      prevRollCount.current = rollCount;
      setRolling("rolling");
      setTimeout(stopRolling, 2500);
    }
  }, [rollCount, stopRolling]);

  const isRollComplete = () => {
    if (is3d) return !is3dRolling;
    return rolling === "rolled";
  };

  const renderRoll = () => {
    return roll ? <RollButton /> : null;
  };

  const renderAddSub = () => {
    if (victory) return null;
    return isRollComplete() && addSub ? <AddSubButton /> : null;
  };

  const renderSplit = () => {
    if (victory) return null;
    return buttons && isRollComplete()
      ? dice.map((die: DieRoll, n: number) => (
          <div key={`buttonColumn${n}`} className="buttonColumn">
            {!die.used ? <AddSubButton n={n} /> : null}
          </div>
        ))
      : null;
  };
  return (
    <div className="GamePanel">
      <div className="GamePanelInner">
        {victory ? <RestartButton /> : null}
        <Dice rolling={rolling} />
        <div className="ButtonPanel">
          {renderRoll()}
          {renderAddSub()}
          {renderSplit()}
        </div>
      </div>
    </div>
  );
};

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
  };
};

export default connect(mapStateToProps)(GamePanel);
