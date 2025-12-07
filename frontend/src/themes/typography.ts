import type { TypographyVariantsOptions } from '@mui/material/styles';
import { FONT_ARCHIVO } from '../config';

const typography = (): TypographyVariantsOptions => ({
  fontFamily: FONT_ARCHIVO,

  h1: {
    fontWeight: 500,
    fontSize: '40px',
    lineHeight: '44px',
    letterSpacing: '0px'
  },
  h2: {
    fontWeight: 500,
    fontSize: '32px',
    lineHeight: '36px',
    letterSpacing: '0px'
  },
  h3: {
    fontWeight: 500,
    fontSize: '28px',
    lineHeight: '32px',
    letterSpacing: '0px'
  },
  h4: {
    fontWeight: 500,
    fontSize: '24px',
    lineHeight: '28px',
    letterSpacing: '0px'
  },
  h5: {
    fontWeight: 500,
    fontSize: '20px',
    lineHeight: '24px',
    letterSpacing: '0px'
  },
  h6: {
    fontWeight: 500,
    fontSize: '18px',
    lineHeight: '22px',
    letterSpacing: '0px'
  },
  subtitle1: {
    fontWeight: 500,
    fontSize: '16px',
    lineHeight: '20px',
    letterSpacing: '0px'
  },
  subtitle2: {
    fontWeight: 500,
    fontSize: '14px',
    lineHeight: '18px',
    letterSpacing: '0px'
  },
  body1: {
    fontWeight: 400,
    fontSize: '16px',
    lineHeight: '20px',
    letterSpacing: '0px'
  },
  body2: {
    fontWeight: 400,
    fontSize: '14px',
    lineHeight: '18px',
    letterSpacing: '0px'
  },
  caption: {
    fontWeight: 400,
    fontSize: '12px',
    lineHeight: '16px',
    letterSpacing: '0px'
  },
  button: {
    textTransform: 'capitalize',
    letterSpacing: '0px'
  }
});

declare module '@mui/material/styles' {
  interface TypographyVariants {
    caption1: React.CSSProperties;
  }

  interface TypographyVariantsOptions {
    caption1?: React.CSSProperties;
  }
}

export default typography;
