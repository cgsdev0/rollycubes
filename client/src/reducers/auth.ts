import { createReducer } from '@reduxjs/toolkit';
import { AchievementList } from 'api/auth';
import decode from 'jwt-decode';
import { UserData } from '../types/store_types';

export interface AuthState {
  authToken?: string | null;
  userData?: UserData;
  otherUsers: Record<string, UserData>;
  achievements?: AchievementList;
}
export interface GotSelfUserDataAction {
  type: 'GOT_SELF_USER_DATA';
  userData: UserData;
}
export interface GotUserDataAction {
  type: 'GOT_USER_DATA';
  data: UserData;
}

export interface AuthenticateAction {
  type: 'AUTHENTICATE';
  access_token: string;
}

export interface GotAchievementsAction {
  type: 'GOT_ACHIEVEMENTS';
  achievements: AchievementList;
}

export const authReducer = createReducer<AuthState>(
  {
    otherUsers: {},
  },
  (builder) => {
    builder
      .addCase('GOT_SELF_USER_DATA', (state, action: GotSelfUserDataAction) => {
        state.userData = action.userData;
      })
      .addCase('GOT_USER_DATA', (state, action: GotUserDataAction) => {
        state.otherUsers[action.data.id] = action.data;
      })
      .addCase('GOT_ACHIEVEMENTS', (state, action: GotAchievementsAction) => {
        state.achievements = action.achievements;
      })
      .addCase('AUTHENTICATE', (state, action: AuthenticateAction) => {
        try {
          const decoded = decode<UserData>(action.access_token);
          state.authToken = action.access_token;
          state.userData = decoded;
        } catch (e) {
          state.authToken = null;
          state.userData = undefined;
        }
      })
      .addCase('LOGOUT', (state, action) => {
        state.authToken = null;
        state.userData = undefined;
      });
  }
);
