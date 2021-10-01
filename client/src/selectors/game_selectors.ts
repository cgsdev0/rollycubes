import {
  createSelector,
  defaultMemoize,
  createSelectorCreator,
} from "reselect";
import { selectState, TARGET_SCORES } from "../store";
import { themes } from "../themes";

export const selectIs3d = createSelector(
  selectState,
  (state) => state.settings.sick3dmode
);

export const selectIsDarkTheme = createSelector(
  selectState,
  (state) => state.settings.theme === themes.dark
);

export const selectDiceRolls = createSelector(
  selectState,
  (state) => state.rolls
);

const DEBUG_PLAYERS = false;

export const selectPlayers = createSelector(selectState, (state) =>
  DEBUG_PLAYERS
    ? [
        ...state.players,
        { connected: true, name: "test", score: 10, win_count: 0 },
        { connected: false, name: "test2", score: 10, win_count: 0 },
        { connected: true, name: "test3", score: 10, win_count: 0 },
        { connected: false, name: "test4", score: 10, win_count: 0 },
        { connected: true, name: "test0", score: 10, win_count: 0 },
        { connected: true, name: "test6", score: 10, win_count: 5 },
      ]
    : state.players
);

export const selectMaxWincount = createSelector(selectPlayers, (players) =>
  Math.max(...players.map((p) => p.win_count))
);

export const selectWinnerCount = createSelector(
  selectPlayers,
  selectMaxWincount,
  (players, count) =>
    players
      .map((p) => p.win_count)
      .reduce((a, b) => a + (b === count ? 1 : 0), 0)
);

export const selectCrownedPlayers = createSelector(
  selectPlayers,
  selectMaxWincount,
  selectWinnerCount,
  (players, wins, winners) => {
    console.warn({ players, wins, winners });
    if (winners > 1) return players;
    return players.map((p) =>
      p.win_count === wins ? { ...p, crowned: true } : p
    );
  }
);

export const selectSelfIndex = createSelector(
  selectState,
  (state) => state.self_index
);
export const selectTurnIndex = createSelector(
  selectState,
  (state) => state.turn_index
);
export const selectRollCount = createSelector(
  selectState,
  (state) => state.rollCount
);
export const selectIsGameOver = createSelector(
  selectState,
  (state) => state.victory
);
export const selectDoublesCount = createSelector(
  selectState,
  (state) => state.doublesCount
);
export const selectIsReset = createSelector(
  selectState,
  (state) => state.reset
);
export const selectCheats = createSelector(
  selectState,
  (state) => state.settings.cheats
);

export const selectSelf = createSelector(
  selectPlayers,
  selectSelfIndex,
  (players, self) => (self === undefined ? undefined : players[self])
);

export const selectIsSpectator = createSelector(
  selectSelfIndex,
  (self) => self === undefined
);

export const selectSomebodyIsNice = createSelector(selectPlayers, (players) =>
  players.some((p) => p.score === 69)
);

export const selectSelfScore = createSelector(selectSelf, (self) =>
  self === undefined ? 0 : self.score
);

const createDeepArraySelector = createSelectorCreator(
  defaultMemoize,
  (current: any, prev: any) => {
    if (current === prev) {
      return true;
    }
    if (Array.isArray(current) && Array.isArray(prev)) {
      if (current.length !== prev.length) {
        return false;
      }
      for (let i = 0; i < current.length; ++i) {
        if (current[i] !== prev[i]) {
          return false;
        }
      }
      return true;
    }
    return false;
  }
);

export const selectOtherPlayerScores = createSelector(
  selectPlayers,
  (players) => players.map((p) => p.score)
);

export const selectHasMultiplePlayers = createSelector(
  selectPlayers,
  (players) => Boolean(players.length > 1)
);

export const selectWinner = createSelector(
  selectPlayers,
  selectIsGameOver,
  selectTurnIndex,
  (players, victory, turn) => {
    if (!victory) return undefined;
    if (turn > players.length) return undefined;
    return players[turn];
  }
);

export const selectIsDoubles = createSelector(selectDiceRolls, (dice) => {
  let val = 0;
  for (const die of dice) {
    if (!val) {
      val = die.value;
      continue;
    }
    if (die.value !== val) {
      return false;
    }
  }
  return true;
});

export const selectIsMyTurn = createSelector(
  selectSelfIndex,
  selectTurnIndex,
  (self, turn) => self === turn
);

export const selectHasRolled = createSelector(
  selectState,
  (state) => state.rolled
);

export const selectShouldShowRoll = createSelector(
  selectIsMyTurn,
  selectHasRolled,
  (myTurn, hasRolled) => myTurn && !hasRolled
);

export const selectTotalRoll = createSelector(selectDiceRolls, (rolls) =>
  rolls.map((roll) => roll.value).reduce((v: number, t: number) => v + t, 0)
);

export const selectIs3dRollHappening = createSelector(
  selectState,
  (state) => state.settings.sick3dmode && !state.rolled3d
);

export const selectShouldShowDiceBoxes = createSelector(
  selectIs3d,
  selectIsMyTurn,
  selectIs3dRollHappening,
  selectHasRolled,
  selectHasMultiplePlayers,
  selectTotalRoll,
  (is3d, myTurn, stillRolling, hasRolled, enoughPlayers, total) =>
    is3d
      ? myTurn && !stillRolling && hasRolled && enoughPlayers && total === 7
      : true
);
export const selectShouldShowAddSub = createSelector(
  selectIsMyTurn,
  selectHasRolled,
  selectTotalRoll,
  selectIs3dRollHappening,
  (myTurn, hasRolled, total, stillRolling) =>
    !stillRolling && myTurn && hasRolled && total !== 7
);

export const selectShouldShowSplitButtons = createSelector(
  selectIsMyTurn,
  selectHasRolled,
  selectTotalRoll,
  selectIs3dRollHappening,
  (myTurn, hasRolled, total, stillRolling) =>
    !stillRolling && myTurn && hasRolled && total === 7
);

const makeCreateAddSubClassSelector = (n: number | "add" | "sub") => {
  return createDeepArraySelector(
    selectOtherPlayerScores,
    selectDiceRolls,
    selectTotalRoll,
    selectSelfScore,
    selectIsDoubles,
    selectCheats,
    (reset_targets, dice, total, self, isDoubles, cheats) => {
      if (!cheats) {
        return "";
      }
      const dir = typeof n === "number" ? Math.sign(n) : n === "add" ? 1 : -1;
      const computedN = typeof n === "number" ? Math.abs(n) - 1 : 0;
      if (isDoubles) {
        return "";
      }
      if (typeof n !== "number") {
        if (TARGET_SCORES.find((t) => t === self + total * dir)) {
          return " Victory";
        }
        if (reset_targets.find((t) => t === self + total * dir)) {
          return " Reset";
        }
      } else {
        const thisRoll = dice[computedN].value;
        const others = dice
          .filter((v, i) => i !== computedN && !v.used)
          .map((v) => v.value);
        let solutions = [];
        const combinations = Math.pow(2, others.length);
        for (let i = 0; i < combinations; ++i) {
          let solution = self;
          for (let j = 0; j < others.length; ++j) {
            if (i & (1 << j)) {
              solution += others[j];
            } else {
              solution -= others[j];
            }
          }
          solutions.push(solution);
        }
        for (const solution of solutions) {
          if (TARGET_SCORES.find((t) => t === solution + thisRoll * dir)) {
            return " Victory";
          }
          if (reset_targets.find((t) => t === solution + thisRoll * dir)) {
            return " Reset";
          }
        }
      }
      return "";
    }
  );
};
let selectorMap: Record<
  number | "add" | "sub",
  ReturnType<typeof makeCreateAddSubClassSelector>
> = {
  add: makeCreateAddSubClassSelector("add"),
  sub: makeCreateAddSubClassSelector("sub"),
};

export const getAddSubButtonClassSelector = (n: number | "add" | "sub") => {
  if (!(n in selectorMap)) {
    selectorMap[n] = makeCreateAddSubClassSelector(n);
  }
  return selectorMap[n];
};
