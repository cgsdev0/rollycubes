import { createReducer, isAllOf, isFulfilled } from '@reduxjs/toolkit';
import { endpoints } from 'api/auth';
import { createTheme } from 'stitches.config';

export interface ThemeState {
  themes: Record<string, string>;
}

export const themesReducer = createReducer<ThemeState>(
  { themes: {} },
  (builder) => {
    builder.addCase('authApi/executeQuery/fulfilled', (state, action: any) => {
      if (endpoints.getUserById.matchFulfilled(action)) {
        if (action.payload.username !== 'badcop_') return;
        const { hue, sat } = action.payload.color;
        state.themes[action.payload.id] = createTheme({
          colors: {
            bad: '#ff0000',
            primary: `hsl(${hue}, ${sat}, 90%)`,
            primaryDimmed: `hsl(${hue}, ${sat}, 60%)`,
            brand: `hsl(${hue}, ${sat}, 50%)`,
            brandFaded: `hsl(${hue}, ${sat}, 40%)`,
            gray400: `hsl(${hue}, ${sat}, 40%)`,
            gray500: `hsl(${hue}, ${sat}, 35%)`,
            gray600: `hsl(${hue}, ${sat}, 30%)`,
            gray700: `hsl(${hue}, ${sat}, 25%)`,
            gray750: `hsl(${hue}, ${sat}, 15%)`,
            gray800: `hsl(${hue}, ${sat}, 20%)`,
            gray900: `hsl(${hue}, ${sat}, 12%)`,
          },
        });
      }
    });
  }
);
