import { toast } from 'react-toastify';
import { Achievement } from '../ui/achievement';
import {
  BaseQueryFn,
  createApi,
  FetchArgs,
  fetchBaseQuery,
  FetchBaseQueryError,
} from '@reduxjs/toolkit/query/react';
import { ReduxState } from '../store';
import { TARGET_SCORES } from '../constants';
import {
  AchievementData,
  AchievementUnlock,
  DiceType,
  UserData,
  RollMsg,
  WinMsg,
} from 'types/api';
import { Store } from 'redux';

interface AuthAPIUser {
  id: string;
  username: string;
  image_url: string | null;
  createdDate: string;
  stats: {
    rolls: number;
    doubles: number;
    games: number;
    wins: number;
  } | null;
}

export type AchievementList = Record<string, AchievementData>;

interface RefreshTokenResponse {
  access_token: string;
}

const dynamicBaseQuery: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const baseUrl = (api.getState() as ReduxState).settings.authServiceOrigin;
  const rawBaseQuery = fetchBaseQuery({
    baseUrl,
    prepareHeaders: (headers, { getState }) => {
      // By default, if we have a token in the store, let's use that for authenticated requests
      const token = (getState() as ReduxState).auth.authToken;
      if (token) {
        headers.set('X-Access-Token', `${token}`);
      }
      return headers;
    },
  });
  return rawBaseQuery(args, api, extraOptions);
};

type ColorSettings = {
  hue: number;
  sat: number;
};

type DonateData = {
  link: string;
};

// Define a service using a base URL and expected endpoints
export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: dynamicBaseQuery,
  endpoints: (builder) => ({
    getRefreshToken: builder.query<RefreshTokenResponse, void>({
      query: () => ({
        url: 'refresh_token',
        mode: 'cors',
        credentials: 'include',
      }),
    }),
    getSelfUserData: builder.query<AuthAPIUser, void>({
      query: () => ({ url: 'me', mode: 'cors', credentials: 'include' }),
    }),
    getAchievementList: builder.query<AchievementList, void>({
      query: () => ({ url: 'server/achievements', mode: 'cors' }),
    }),
    getUserById: builder.query<UserData, string>({
      query: (id: string) => ({ url: `users/${id}`, mode: 'cors' }),
    }),
    donate: builder.mutation<DonateData, void>({
      query: () => ({
        url: `donate`,
        mode: 'cors',
        method: 'POST',
      }),
    }),
    setPubkeyText: builder.mutation<void, string>({
      query: (text) => ({
        url: `users/update_setting`,
        mode: 'cors',
        method: 'POST',
        body: { setting: 'Pubkey', text },
      }),
    }),
    setDiceType: builder.mutation<void, DiceType>({
      query: (type) => ({
        url: `users/update_setting`,
        mode: 'cors',
        method: 'POST',
        body: { setting: 'DiceType', dice_type: type },
      }),
    }),
    logout: builder.mutation<void, void>({
      query: () => ({
        url: `logout`,
        mode: 'cors',
        method: 'POST',
        credentials: 'include',
      }),
    }),
    setUserColor: builder.mutation<void, ColorSettings>({
      query: (settings) => ({
        url: `users/update_setting`,
        mode: 'cors',
        method: 'POST',
        body: { setting: 'Color', color: settings },
      }),
    }),
  }),
});

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const {
  util,
  endpoints,
  useGetRefreshTokenQuery,
  useGetSelfUserDataQuery,
  useGetAchievementListQuery,
  useGetUserByIdQuery,
  useSetUserColorMutation,
  useDonateMutation,
  useSetDiceTypeMutation,
  useLogoutMutation,
  useSetPubkeyTextMutation,
} = authApi;

type Action = { type: string } & object;
function isAction<T extends Action>(
  action: Action,
  guard: T['type']
): action is T {
  return action.type === guard;
}

export const optimisticUpdates = (
  data: Action,
  store: Store<ReduxState, any>
) => {
  const { dispatch, getState } = store;
  const state = getState();
  if (isAction<RollMsg>(data, 'roll')) {
    const user_id = state.game.players[state.game.turn_index].user_id;
    if (user_id) {
      dispatch(
        authApi.util.updateQueryData('getUserById', user_id, (u) => {
          if (!u.stats) {
            u.stats = {
              rolls: 0,
              doubles: 0,
              wins: 0,
              games: 0,
              dice_hist: [0, 0, 0, 0, 0, 0],
              sum_hist: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
              win_hist: [0, 0, 0, 0, 0, 0],
            };
          }
          u.stats!.rolls += 1;
          let sum = 0;
          for (let i = 0; i < data.rolls.length; ++i) {
            u.stats!.dice_hist[data.rolls[i] - 1] += 1;
            sum += data.rolls[i];
          }
          u.stats!.sum_hist[sum - 1] += 1;
          if (data.rolls.every((roll) => roll === data.rolls[0])) {
            u.stats!.doubles += 1;
          }
        })
      );
    }
  }

  if (isAction<WinMsg>(data, 'win')) {
    state.game.players.forEach((player, i) => {
      if (!player.user_id) return;
      dispatch(
        authApi.util.updateQueryData('getUserById', player.user_id, (u) => {
          if (!u.stats) {
            u.stats = {
              rolls: 0,
              doubles: 0,
              wins: 0,
              games: 0,
              dice_hist: [0, 0, 0, 0, 0, 0],
              sum_hist: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
              win_hist: [0, 0, 0, 0, 0, 0],
            };
          }
          u.stats!.games += 1;
          if (data.id == i) {
            u.stats!.wins += 1;
            u.stats.win_hist[
              TARGET_SCORES.findIndex(
                (score) =>
                  score === state.game.players[state.game.turn_index].score
              )
            ] += 1;
          }
        })
      );
    });
  }

  if (isAction<AchievementUnlock>(data, 'achievement_unlock')) {
    if (state.game.self_index !== undefined) {
      if (data.user_index === state.game.self_index) {
        toast(Achievement(data), { autoClose: 0 });
      }
    }
    const { user_id } = data;
    if (user_id) {
      dispatch(
        authApi.util.updateQueryData('getUserById', user_id, (u) => {
          if (!u.achievements) {
            u.achievements = [];
          }
          u.achievements?.push({
            id: data.id,
            rd: 0, // TODO
            rn: 0, // TODO
            progress: data.max_progress || 1,
            unlocked: new Date().toString(),
          });
        })
      );
    }
  }
};
