import { createSelector } from "reselect";
import { selectState } from "../store";

export const selectDiceRolls = createSelector(selectState, state => state.rolls);
export const selectPlayers = createSelector(selectState, state => state.players);
export const selectSelfIndex = createSelector(selectState, state=> state.self_index);
export const selectTurnIndex = createSelector(selectState, state=> state.turn_index);
export const selectRollCount = createSelector(selectState, state => state.rollCount);

export const selectIsMyTurn = createSelector(selectSelfIndex, selectTurnIndex, (self, turn) => self === turn);

export const selectHasRolled = createSelector(selectState, state => state.rolled);

export const selectShouldShowRoll = createSelector(selectIsMyTurn, selectHasRolled, 
    (myTurn, hasRolled) => myTurn && !hasRolled);

export const selectTotalRoll = createSelector(selectDiceRolls, 
    rolls => rolls.map(roll => roll.value).reduce((v: number, t: number) => v + t, 0));

export const selectShouldShowAddSub = createSelector(selectIsMyTurn,
    selectHasRolled,
    selectTotalRoll,
    (myTurn, hasRolled, total) => myTurn && hasRolled && total !== 7);

    export const selectShouldShowSplitButtons = createSelector(selectIsMyTurn,
        selectHasRolled,
        selectTotalRoll,
        (myTurn, hasRolled, total) => myTurn && hasRolled && total === 7);