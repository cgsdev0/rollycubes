import { createReducer, isAllOf, isFulfilled } from '@reduxjs/toolkit';
import { endpoints } from 'api/auth';
import { createTheme } from 'stitches.config';

export interface ThemeState {
  themes: Record<string, string>;
}

const hue = 220;
const saturation = 80;

export const themesReducer = createReducer<ThemeState>(
  { themes: {} },
  (builder) => {
    builder.addCase('authApi/executeQuery/fulfilled', (state, action: any) => {
      if (endpoints.getUserById.matchFulfilled(action)) {
        if (action.payload.username !== 'badcop_') return;
        state.themes[action.payload.id] = createTheme({
          colors: {
            bad: '#ff0000',
            primary: `hsl(${hue}, ${saturation}%, 90%)`,
            primaryDimmed: `hsl(${hue}, ${saturation}%, 60%)`,
            brand: `hsl(${hue}, ${saturation}%, 50%)`,
            brandFaded: `hsl(${hue}, ${saturation}%, 40%)`,
            gray400: `hsl(${hue}, ${saturation}%, 40%)`,
            gray500: `hsl(${hue}, ${saturation}%, 35%)`,
            gray600: `hsl(${hue}, ${saturation}%, 30%)`,
            gray700: `hsl(${hue}, ${saturation}%, 25%)`,
            gray750: `hsl(${hue}, ${saturation}%, 15%)`,
            gray800: `hsl(${hue}, ${saturation}%, 20%)`,
            gray900: `hsl(${hue}, ${saturation}%, 12%)`,
          },
        });
      }
    });
  }
);
