import React from 'react';

export type Theme = typeof lightTheme;

const lightTheme = {
  app: {},
  turnHighlight: {
    backgroundColor: '#aaeeaa',
  },
  tabHighlight: {
    backgroundColor: 'skyblue',
  },
  tab: {
    backgroundColor: 'lightgray',
    color: 'black',
  },
};
const darkTheme: Theme = {
  ...lightTheme,
  app: {
    backgroundColor: '#222',
    color: '#eee',
  },
  turnHighlight: {
    backgroundColor: '#228822',
  },
  tabHighlight: {
    backgroundColor: '#222288',
  },
  tab: {
    backgroundColor: '#333',
    color: '#eee',
  },
};
export const themes: {light: Theme; dark: Theme} = {
  light: lightTheme,
  dark: darkTheme,
};

export const ThemeContext = React.createContext(themes.dark);
