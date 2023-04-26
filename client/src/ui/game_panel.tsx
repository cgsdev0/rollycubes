import React from 'react';
import { connect, DispatchProp } from 'react-redux';
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
} from '../selectors/game_selectors';
import { ReduxState } from '../store';
import RollButton from './buttons/roll_button';
import RestartButton from './buttons/restart_button';
import AddSubButton from './buttons/add_sub_button';
import Dice from './dice';
import { DieRoll } from '../types/store_types';
import { css, styled } from 'stitches.config';

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

type RollingState = 'rolled' | 'rolling';

const gamePanel = css({
  alignItems: 'center',
  display: 'flex',
  justifyContent: 'center',
  width: '100%',
  minHeight: 160,
  '@bp0': {
    gap: 16,
  },
});

const gamePanelInner = css({
  display: 'flex',
  flexDirection: 'column',
});

const buttonPanel = css({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'stretch',
  justifyContent: 'stretch',
  minHeight: '40px',
  maxHeight: '40px',
});
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
  const [rolling, setRolling] = React.useState<RollingState>('rolled');

  const prevRollCount = React.useRef(0);

  const stopRolling = React.useCallback(() => {
    setRolling('rolled');
    if (isDoubles && !is3d) {
      dispatch({ type: 'DOUBLES' });
    }
  }, [isDoubles, is3d, setRolling, dispatch]);

  React.useEffect(() => {
    if (prevRollCount.current < rollCount) {
      prevRollCount.current = rollCount;
      setRolling('rolling');
      setTimeout(stopRolling, 2500);
    }
  }, [rollCount, stopRolling]);

  const isRollComplete = () => {
    if (is3d) return !is3dRolling;
    return rolling === 'rolled';
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
    <div className={gamePanel()}>
      <ScoreTableComponent />
      <div className={gamePanelInner()}>
        {victory ? <RestartButton /> : null}
        <Dice rolling={rolling} />
        <div className={buttonPanel()}>
          {renderRoll()}
          {renderAddSub()}
          {renderSplit()}
        </div>
      </div>
    </div>
  );
};

const ScoreTableContainer = styled('div', {
  border: '1px dotted $gray600',
  borderRadius: 6,
  padding: 6,
  '@bp1': {
    transform: 'translateX(-50px)',
    marginRight: -36,
  },
});
const ScoreTable = styled('table', {
  tableLayout: 'fixed',
  borderCollapse: 'collapse',
  height: 90,
  '& tr td': {
    height: 26,
  },
  '& tr:last-child td': {
    borderBottom: 0,
    height: 19,
    verticalAlign: 'bottom',
    paddingBottom: 2,
  },
  '& tr td:last-child': {
    borderRight: 0,
  },
  '& tr:last-child': {},
  '& td': {
    textAlign: 'center',
    fontSize: 10,
    color: '$gray500',
    padding: 0,
    borderBottom: '1px dotted $gray600',
    borderRight: '1px dotted $gray600',
    '&.blank': {
      border: 0,
    },
  },
});
const scoreTableTitle = css({
  color: '$gray500',
  textAlign: 'center',
  fontSize: 12,
  marginTop: 19,
});
const ScoreTableComponent = () => {
  return (
    <ScoreTableContainer
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <ScoreTable style={{ width: 90 }}>
        <tbody>
          <tr>
            <td className="blank" colSpan={2}>
              &nbsp;
            </td>
            <td colSpan={2}>33</td>
          </tr>
          <tr>
            <td className="blank" colSpan={1}>
              &nbsp;
            </td>
            <td colSpan={2}>66</td>
            <td colSpan={2}>67</td>
          </tr>
          <tr>
            <td colSpan={2}>98</td>
            <td colSpan={2}>99</td>
            <td colSpan={2}>100</td>
          </tr>
        </tbody>
      </ScoreTable>
      <p className={scoreTableTitle()}>Winning Scores</p>
    </ScoreTableContainer>
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
