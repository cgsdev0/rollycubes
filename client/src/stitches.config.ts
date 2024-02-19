// stitches.config.ts
import { createStitches } from '@stitches/react';

export const {
  styled,
  css,
  globalCss,
  keyframes,
  getCssText,
  theme,
  createTheme,
  config,
} = createStitches({
  theme: {
    colors: {
      good: '#16B808',
      bad: '#ff0000',
      primary: '#f3f3f6',
      primaryDimmed: '#959597',
      brand: '#3acecd',
      brandFaded: '#009999',
      gray400: 'gainsboro',
      gray500: '#888888',
      gray600: '#555555',
      gray700: '#3E3E3F',
      gray750: '#232323',
      gray800: '#2A2A2A',
      gray900: '#151515',
    },
    shadows: {
      poptext: '#040404',
      brand: '#3acecd',
      brandFaded: '#009999',
      cutoutBottom: 'rgba(255, 255, 255, 0.12) 0px 3px 3px 0px',
      cutoutTop: 'rgba(0, 0, 0, 0.2) 0px 8px 3px 0px inset',
      cutoutBorder: 'rgba(0,0,0,0.3) 0px 0px 0px 1px',
      indentBottom: 'rgba(255, 255, 255, 0.15) 0px 2px 3px 0px',
      indentTop: 'rgba(0, 0, 0, 0.2) 0px 3px 3px 0px inset',
      elevation: '0px 6px 10px rgba(0,0,0,0.2)',
    },
  },
  media: {
    hbp0: '(max-height: 770px)',
    bp0: '(max-width: 479px)',
    bp1: '(min-width: 480px)',
  },
  utils: {
    marginX: (value: number) => ({ marginLeft: value, marginRight: value }),
  },
});

const hue = 'var(--custom-hue)';
const sat = 'var(--custom-sat)';

export const lightTheme = createTheme({
  colors: {
    primary: '#040404',
    primaryDimmed: '#343434',
    brand: '#3acecd',
    brandFaded: '#009999',
    gray800: 'gainsboro',
    gray750: '#888888',
    gray700: '#bbbbbb',
    gray600: '#888888',
    gray500: '#555555',
    gray400: '#222222',
    gray900: '#FFFFFF',
  },
  shadows: {
    brand: '#3acecd',
    brandFaded: 'rgba(58, 256, 255, 0.4)',
  },
});

export const customTheme = createTheme({
  colors: {
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
  shadows: {
    brand: `hsl(${hue}, ${sat}, 50%)`,
    brandFaded: `hsl(${hue}, ${sat}, 40%)`,
  },
});

export const globalStyles = globalCss({
  '*': {
    margin: 0,
    padding: 0,
    color: '$primary',
    transition: 'background-color 0.4s 0s, color 0.4s 0s, border-color 0.4s 0s',
  },
  'h1,header,h2,h3,h4,h5,p,td,th,span': {
    color: '$primary',
  },
  body: {
    fontFamily: 'Amiko',
    fontSize: 20,
    overflow: 'hidden',
    userSelect: 'none',
  },
  a: {
    textDecoration: 'none',
    textTransform: 'uppercase',
    color: '$primary',
    fontSize: 14,
    letterSpacing: '0.16em',
  },
  'a:hover': {
    fontSize: 14,
    textDecoration: 'none',
    color: '$primaryDimmed',
  },
  th: {
    backgroundColor: '$gray800',
    padding: 4,
    position: 'sticky',
    top: -2,
  },
  td: {
    padding: 4,
    paddingLeft: 0,
    '@bp0': {
      padding: 8,
      fontSize: 24,
    },
  },
  '.flex': {
    display: 'flex',
    width: '100%',
    height: '100%',
  },
  '.flex-col': {
    flexDirection: 'column',
  },
});
