import { customTheme, styled } from 'stitches.config';

export const Button = styled('button', {
  maxHeight: 48,
  height: 48,
  minHeight: 48,
  backgroundColor: '$gray400',
  textShadow: 'rgba(0, 0, 0, 0.1) 0px 1px 2px',
  boxShadow:
    'rgba(255, 255, 255, 0.2) 0px 2px 1px 0px inset, rgba(0,0,0,0.3) 0px -5px 1px 0px inset, rgba(0, 0, 0, 0.15) 0px 6px 10px -3px',
  paddingBottom: 4,
  paddingLeft: 8,
  paddingRight: 8,
  '&:hover': {
    transition: 'unset',
    opacity: 0.8,
  },
  '&:active': {
    marginTop: 3,
    maxHeight: 45,
    height: 45,
    minHeight: 45,
    boxShadow:
      'rgba(255, 255, 255, 0.2) 0px 2px 1px 0px inset, rgba(0,0,0,0.3) 0px -1px 1px 0px inset, rgba(0, 0, 0, 0.15) 0px 6px 10px -3px',
    paddingBottom: 1,
    transition: 'unset',
  },
  color: '$gray900',
  border: '1px solid rgba(0,0,0,0.3)',
  borderRadius: 8,
  fontSize: '24px',
  fontFamily: 'Montserrat',
  [`.${customTheme} &`]: {
    backgroundColor: '$brand',
    color: '$primary',
  },
});
