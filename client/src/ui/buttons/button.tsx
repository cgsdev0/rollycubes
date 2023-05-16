import { customTheme, styled } from 'stitches.config';

export const Button = styled('button', {
  maxHeight: 40,
  height: 40,
  minHeight: 40,
  padding: '0 16px',
  backgroundColor: '$gray400',
  color: '$gray900',
  borderRadius: 10,
  fontSize: '24px',
  fontFamily: 'Montserrat',
  border: '0',
  [`.${customTheme} &`]: {
    backgroundColor: '$brand',
    color: '$primary',
  },
});
