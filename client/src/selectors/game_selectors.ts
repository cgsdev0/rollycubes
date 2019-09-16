import { createSelector } from "reselect";
import { selectState } from "../store";

export const selectDiceRolls = createSelector(selectState, state => state.rolls);
export const selectPlayers = createSelector(selectState, state => state.players);

export const selectIsMyTurn = createSelector(selectState, state => state.self_index === state.turn_index);

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