import { createReducer } from '@reduxjs/toolkit';
import { CheatsAction } from 'actions/settings';
import { endpoints } from 'api/auth';
import { DiceType } from 'types/api';

export interface SettingsState {
  cheats: boolean;
  sick3dmode: boolean;
  darkMode: boolean;
  authServiceOrigin: string;
  showSettings: boolean;
  showHelp: boolean;
  showLogin: boolean;
  color: {
    hue: number;
    sat: number;
  };
  pubkey: string;
  dice_type: DiceType;
}

const PROD_AUTH_SERVICE = 'https://auth.rollycubes.com/';
const LOCAL_AUTH_SERVICE = 'http://localhost:3031/';
const FANCY_LOCAL_AUTH_SERVICE = 'https://auth.rollycubes.live/';

export const settingsReducer = createReducer<SettingsState>(
  {
    cheats: true,
    sick3dmode: localStorage.getItem('3d_mode') !== 'false',
    darkMode: localStorage.getItem('dark_mode') !== 'false',
    authServiceOrigin: import.meta.env.VITE_FANCY_LOCAL_AUTH
      ? FANCY_LOCAL_AUTH_SERVICE
      : import.meta.env.VITE_LOCAL_AUTH
      ? LOCAL_AUTH_SERVICE
      : PROD_AUTH_SERVICE,
    showSettings: false,
    showLogin: true,
    showHelp: true,
    pubkey: '',
    color: {
      hue: 0,
      sat: 80,
    },
    dice_type: 'Default',
  },
  (builder) => {
    builder.addCase('TOGGLE_DARK', (state, action) => {
      state.darkMode = !state.darkMode;
      // TODO: remove these side effects
      if (!state.darkMode) {
        localStorage.setItem('dark_mode', 'false');
      } else {
        localStorage.removeItem('dark_mode');
      }
    });
    builder.addCase('TOGGLE_3D', (state, action) => {
      state.sick3dmode = !state.sick3dmode;
      // TODO: remove these side effects
      if (!state.sick3dmode) {
        localStorage.setItem('3d_mode', 'false');
      } else {
        localStorage.removeItem('3d_mode');
      }
    });
    builder
      .addCase('authApi/executeQuery/fulfilled', (state, action: any) => {
        if (endpoints.getUserById.matchFulfilled(action)) {
          if (
            action.payload.id === (action as any).MIDDLEWARE_INJECTED_USER_ID
          ) {
            state.color = action.payload.color;
            state.dice_type = action.payload.dice.type;
            state.pubkey = action.payload.pubkey_text || '';
          }
        }
      })
      .addCase('CHEATS', (state, action: CheatsAction) => {
        state.cheats = action.newState;
      })
      .addCase('SET_CUSTOM_HUE', (state, action: any) => {
        state.color.hue = action.hue;
      })
      .addCase('SET_CUSTOM_SAT', (state, action: any) => {
        state.color.sat = action.sat;
      })
      .addCase('SET_SHOW_LOGIN', (state, action: any) => {
        state.showLogin = action.show;
      })
      .addCase('SET_DICE_TYPE', (state, action: any) => {
        state.dice_type = action.dice_type;
      })
      .addCase('SET_PUBKEY_TEXT', (state, action: any) => {
        state.pubkey = action.pubkey_text;
        console.warn('hi');
      })
      .addCase('TOGGLE_SHOW_SETTINGS', (state, action) => {
        state.showSettings = !state.showSettings;
      })
      .addCase('TOGGLE_SHOW_HELP', (state, action) => {
        state.showHelp = !state.showHelp;
      })
      .addCase('DEV_AUTH_SERVICE_TOGGLE', (state, action) => {
        if (state.authServiceOrigin === PROD_AUTH_SERVICE) {
          state.authServiceOrigin = LOCAL_AUTH_SERVICE;
        } else {
          state.authServiceOrigin = PROD_AUTH_SERVICE;
        }
      });
  }
);
