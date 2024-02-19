import {
  createSelector,
  defaultMemoize,
  createSelectorCreator,
} from 'reselect';
import { customTheme, lightTheme } from 'stitches.config';
import { ReduxState, selectState } from '../store';
import { TARGET_SCORES } from '../constants';
import { QuerySubState } from '@reduxjs/toolkit/dist/query/core/apiState';
import { authApi, endpoints } from 'api/auth';
import { ApiEndpointQuery } from '@reduxjs/toolkit/dist/query/core/module';
import { Achievement, AchievementData, DiceType } from 'types/api';

export const selectIs3d = createSelector(
  selectState,
  (state) => state.settings.sick3dmode
);

export const selectAuthService = createSelector(
  selectState,
  (state) => state.settings.authServiceOrigin
);

export const selectSelfUserData = createSelector(
  selectState,
  (state) => state.auth.userData
);

export const selectAuthApiQueries = createSelector(
  selectState,
  (state) => state.authApi.queries
);

type UnwrapApiEndpoint<C> = C extends ApiEndpointQuery<infer T, any>
  ? T
  : unknown;
type UserQueryData = UnwrapApiEndpoint<typeof endpoints.getUserById>;

export const selectUserData = createSelector(
  selectAuthApiQueries,
  (queries) => {
    const result: any = {};
    Object.entries(queries)
      .map(([key, value]) => {
        const match = key.match(/getUserById\("(.*)"\)/);
        if (match) {
          return [match[1], value];
        }
      })
      .filter(Boolean)
      .forEach(([key, value]: any) => {
        result[key] = value;
      });
    return result as Record<string, QuerySubState<UserQueryData>>;
  }
);

export const selectSelfUserId = createSelector(
  selectSelfUserData,
  (userdata) => userdata?.user_id
);

export const selectIsSignedIn = createSelector(selectSelfUserData, (userdata) =>
  Boolean(userdata?.user_id)
);

export const selectSelfFirstInitial = createSelector(
  selectSelfUserData,
  (userdata) => (userdata?.display_name?.charAt(0) || '').toUpperCase()
);

export const selectIsDev = createSelector(
  (state: ReduxState) => {},
  (_) =>
    !import.meta.env.NODE_ENV ||
    (import.meta.env.NODE_ENV === 'development' &&
      (window.location.port === '3005' || window.location.port === '3000'))
);

export const selectDiceRolls = createSelector(
  selectState,
  (state) => state.game.rolls
);

const DEBUG_PLAYERS = false;

export const selectPlayers = createSelector(selectState, (state) =>
  DEBUG_PLAYERS
    ? [
        ...state.game.players,
        {
          skip_count: 0,
          connected: true,
          name: 'test',
          score: 10,
          win_count: 0,
        },
        {
          skip_count: 0,
          connected: false,
          name: 'test2',
          score: 10,
          win_count: 0,
        },
        {
          skip_count: 2,
          connected: true,
          name: 'test3',
          score: 10,
          win_count: 0,
        },
        {
          skip_count: 2,
          connected: false,
          name: 'test4',
          score: 10,
          win_count: 0,
        },
        {
          skip_count: 0,
          connected: true,
          name: 'test0',
          score: 10,
          win_count: 0,
        },
        {
          skip_count: 0,
          connected: true,
          name: 'test6',
          score: 10,
          win_count: 5,
        },
      ]
    : state.game.players
);

export const selectCrownedPlayer = createSelector(
  selectPlayers,
  (players) => players.filter((p) => p.crowned)[0]
);
// export const selectMaxWincount = createSelector(selectPlayers, (players) =>
//   Math.max(...players.map((p) => p.win_count))
// );

// export const selectWinnerCount = createSelector(
//   selectPlayers,
//   selectMaxWincount,
//   (players, count) =>
//     players
//       .map((p) => p.win_count)
//       .reduce((a, b) => a + (b === count ? 1 : 0), 0)
// );

// export const selectCrownedPlayers = createSelector(
//   selectPlayersAndUserData,
//   selectMaxWincount,
//   selectWinnerCount,
//   (players, wins, winners) => {
//     if (winners > 1) return players;
//     if (players.length <= 1) return players;
//     return players.map((p) =>
//       p.win_count === wins ? { ...p, crowned: true } : p
//     );
//   }
// );

export const selectSelfIndex = createSelector(
  selectState,
  (state) => state.game.self_index
);
export const selectTurnIndex = createSelector(
  selectState,
  (state) => state.game.turn_index
);
export const selectRollCount = createSelector(
  selectState,
  (state) => state.popText.rollCount
);
export const selectIsGameOver = createSelector(
  selectState,
  (state) => state.game.victory
);
export const selectIsReset = createSelector(
  selectState,
  (state) => state.popText.reset
);
export const selectCheats = createSelector(
  selectState,
  (state) => state.settings.cheats
);
export const selectThemes = createSelector(
  selectState,
  (state) => state.themes.themes
);

export const selectLocation = createSelector(
  selectState,
  (state) => state.router.location
);

export const selectLatestPopText = createSelector(
  selectState,
  (state) => state.popText.popText[0]
);

export const selectCurrentSkipCount = createSelector(
  selectTurnIndex,
  selectPlayers,
  (turn, players) => players[turn]?.skip_count || 0
);

export const selectTurnName = createSelector(
  selectTurnIndex,
  selectPlayers,
  (turn, players) => players[turn]?.name || `User${turn + 1}`
);

export const selectSettingsShowing = createSelector(
  selectState,
  (state) => state.settings.showSettings
);

export const selectSettingsColor = createSelector(
  selectState,
  (state) => state.settings.color
);

export const selectSelfUserDataFromApi = createSelector(
  selectUserData,
  selectSelfUserId,
  (userData, self_id) => userData[self_id || '']?.data
);

export const selectAuthSlice = createSelector(
  selectState,
  (state) => state.auth
);
const defaultOptions: Array<
  AchievementData & {
    key?: string;
    unlocks: DiceType;
    user?: Achievement;
  }
> = [
  {
    unlocks: 'Default',
    description: 'Standard issue cubes.',
    id: 'howdy',
    name: 'Starter Dice',
    max_progress: 0,
    image_url: '',
    user: {
      id: 'hello',
      progress: 0,
      rn: 0,
      rd: 0,
      unlocked: 'true',
    },
  },
];
export const selectCustomDiceOptions = createSelector(
  selectAuthSlice,
  selectSelfUserDataFromApi,
  (auth, self) => {
    if (!auth.achievements) {
      return defaultOptions;
    }
    return defaultOptions.concat(
      Object.entries(auth.achievements)
        .filter(([_, a]) => a.unlocks)
        .map(([key, a]) => ({
          key,
          ...a,
          unlocks: a.unlocks!,
          user: self?.achievements?.find(
            (achievement) => achievement.id === key
          ),
        }))
    );
  }
);

export const selectHasGoldenUnlocked = createSelector(
  selectSelfUserDataFromApi,
  (data) =>
    Boolean(
      data?.achievements?.some((achievement) => achievement.id === 'perfect')
    )
);
export const selectHasD20Unlocked = createSelector(
  selectSelfUserDataFromApi,
  (data) =>
    Boolean(
      data?.achievements?.some(
        (achievement) => achievement.id === 'astronaut:1'
      )
    )
);

export const selectIsDarkMode = createSelector(
  selectState,
  (state) => state.settings.darkMode
);
export const selectDefaultTheme = createSelector(selectIsDarkMode, (dark) =>
  dark ? undefined : lightTheme
);
export const selectCurrentTheme = createSelector(
  selectLocation,
  selectTurnIndex,
  selectPlayers,
  selectUserData,
  selectSelfUserId,
  selectDefaultTheme,
  (location, turn, players, userData, self_id, defaultTheme) => {
    const showing =
      new URLSearchParams(location?.search).get('settings') === 'premium';
    if (showing && userData[self_id || '']?.data?.donor) {
      return customTheme;
    }
    if (
      userData[players[turn]?.user_id || '']?.data?.donor &&
      (location?.pathname.startsWith('/room/') ||
        location?.pathname.startsWith('/spectate/'))
    ) {
      return customTheme;
    }
    return defaultTheme;
  }
);

export const selectCurrentDiceType = createSelector(
  selectTurnIndex,
  selectPlayers,
  selectUserData,
  (turn, players, userData) =>
    userData[players[turn]?.user_id || '']?.data?.dice.type || 'Default'
);

export const selectCurrentColors = createSelector(
  selectLocation,
  selectTurnIndex,
  selectPlayers,
  selectSettingsColor,
  selectUserData,
  selectSelfUserId,
  (location, turn, players, color, userData, self_id) => {
    const showing =
      new URLSearchParams(location?.search).get('settings') === 'premium';
    const donor = userData[self_id || '']?.data?.donor;
    return showing && donor
      ? color
      : location?.pathname.startsWith('/room/') ||
        location?.pathname.startsWith('/spectate/')
      ? userData[players[turn]?.user_id || '']?.data?.color
      : undefined;
  }
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
  (state) => state.game.rolled
);

export const selectShouldShowRoll = createSelector(
  selectIsMyTurn,
  selectHasRolled,
  (myTurn, hasRolled) => (myTurn && !hasRolled) || !myTurn
);

export const selectTotalRoll = createSelector(selectDiceRolls, (rolls) =>
  rolls.map((roll) => roll.value).reduce((v: number, t: number) => v + t, 0)
);

export const selectIs3dRollHappening = createSelector(
  selectState,
  (state) => state.settings.sick3dmode && !state.game.rolled3d
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

const makeCreateAddSubClassSelector = (n: number | 'add' | 'sub') => {
  return createDeepArraySelector(
    selectOtherPlayerScores,
    selectDiceRolls,
    selectTotalRoll,
    selectSelfScore,
    selectIsDoubles,
    selectCheats,
    (reset_targets, dice, total, self, isDoubles, cheats) => {
      if (!cheats) {
        return '';
      }
      const dir = typeof n === 'number' ? Math.sign(n) : n === 'add' ? 1 : -1;
      const computedN = typeof n === 'number' ? Math.abs(n) - 1 : 0;
      if (typeof n !== 'number') {
        if (TARGET_SCORES.find((t) => t === self + total * dir) && !isDoubles) {
          return ' Victory';
        }
        if (reset_targets.find((t) => t === self + total * dir)) {
          return ' Reset';
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
          if (
            TARGET_SCORES.find((t) => t === solution + thisRoll * dir) &&
            !isDoubles
          ) {
            return ' Victory';
          }
          if (reset_targets.find((t) => t === solution + thisRoll * dir)) {
            return ' Reset';
          }
        }
      }
      return '';
    }
  );
};
let selectorMap: Record<
  number | 'add' | 'sub',
  ReturnType<typeof makeCreateAddSubClassSelector>
> = {
  add: makeCreateAddSubClassSelector('add'),
  sub: makeCreateAddSubClassSelector('sub'),
};

export const getAddSubButtonClassSelector = (n: number | 'add' | 'sub') => {
  if (!(n in selectorMap)) {
    selectorMap[n] = makeCreateAddSubClassSelector(n);
  }
  return selectorMap[n];
};
