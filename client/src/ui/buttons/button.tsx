import { customTheme, styled } from 'stitches.config';

export const Button = styled('button', {
  maxHeight: 40,
  height: 40,
  minHeight: 40,
  backgroundColor: '$gray400',
  textShadow: 'rgba(0, 0, 0, 0.2) 2px 2px 0px',
  boxShadow:
    'rgba(255, 255, 255, 0.3) 3px 3px 0px 0px inset, rgba(0, 0, 0, 0.3) 2px 4px 0px 0px',
  '&:hover': {
    transition: 'unset',
    opacity: 0.9,
  },
  '&:active': {
    boxShadow:
      'rgba(255, 255, 255, 0.3) 4px 4px 0px 0px inset, rgba(0, 0, 0, 0.3) 2px 1px 0px 0px',
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
