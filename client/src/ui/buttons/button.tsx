import { customTheme, styled } from 'stitches.config';

export const Button = styled('button', {
  maxHeight: 43,
  height: 43,
  minHeight: 43,
  backgroundColor: '$gray400',
  textShadow: 'rgba(0, 0, 0, 0.1) 0px 1px 2px',
  boxShadow:
    'rgba(255, 255, 255, 0.2) 0px 4px 2px 0px inset, rgba(0,0,0,0.3) 0px -4px 1px 0px inset, rgba(0, 0, 0, 0.2) 0px 6px 5px 0px',
  paddingBottom: 4,
  paddingLeft: 8,
  paddingRight: 8,
  '&:hover': {
    transition: 'unset',
    opacity: 0.8,
  },
  '&:active': {
    maxHeight: 40,
    height: 40,
    minHeight: 40,
    boxShadow:
      'rgba(255, 255, 255, 0.2) 0px 4px 2px 0px inset, rgba(0,0,0,0.3) 0px -1px 1px 0px inset, rgba(0, 0, 0, 0.2) 0px 6px 5px 0px',
    paddingBottom: 1,
    transition: 'unset',
    transform: 'translateY(3px)',
  },
  color: '$gray900',
  border: '2px solid rgba(0,0,0,0.3)',
  borderRadius: 8,
  fontSize: '24px',
  fontFamily: 'Montserrat',
  [`.${customTheme} &`]: {
    backgroundColor: '$brand',
    color: '$primary',
  },
});
