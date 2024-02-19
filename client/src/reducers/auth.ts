import { createReducer } from '@reduxjs/toolkit';
import { AchievementList } from 'api/auth';
import decode from 'jwt-decode';

interface TokenUserData {
  exp: number;
  user_id: string;
  display_name: string;
}

export interface AuthState {
  authToken?: string | null;
  userData?: TokenUserData;
  achievements?: AchievementList;
}

export interface AuthenticateAction {
  type: 'AUTHENTICATE';
  access_token: string;
}

export interface GotAchievementsAction {
  type: 'GOT_ACHIEVEMENTS';
  achievements: AchievementList;
}

export const authReducer = createReducer<AuthState>({}, (builder) => {
  builder
    .addCase('GOT_ACHIEVEMENTS', (state, action: GotAchievementsAction) => {
      state.achievements = action.achievements;
    })
    .addCase('AUTHENTICATE', (state, action: AuthenticateAction) => {
      try {
        const decoded = decode<TokenUserData>(action.access_token);
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
});
