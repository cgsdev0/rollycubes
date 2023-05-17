import { createReducer } from '@reduxjs/toolkit';
import { CheatsAction } from 'actions/settings';
import { endpoints } from 'api/auth';

export interface SettingsState {
  cheats: boolean;
  sick3dmode: boolean;
  authServiceOrigin: string;
  showSettings: boolean;
  color: {
    hue: number;
    sat: number;
  };
}

const PROD_AUTH_SERVICE = 'https://auth.rollycubes.com/';
const LOCAL_AUTH_SERVICE = 'http://localhost:3031/';

export const settingsReducer = createReducer<SettingsState>(
  {
    cheats: true,
    sick3dmode: localStorage.getItem('3d_mode') !== 'false',
    authServiceOrigin: import.meta.env.VITE_LOCAL_AUTH
      ? LOCAL_AUTH_SERVICE
      : PROD_AUTH_SERVICE,
    showSettings: false,
    color: {
      hue: 0,
      sat: 80,
    },
  },
  (builder) => {
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
          console.log({ action });
          if (
            action.payload.id === (action as any).MIDDLEWARE_INJECTED_USER_ID
          ) {
            state.color = action.payload.color;
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
      .addCase('TOGGLE_SHOW_SETTINGS', (state, action) => {
        state.showSettings = !state.showSettings;
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
