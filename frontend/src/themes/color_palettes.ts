// src/themes/color_palettes.ts

import { alpha } from '@mui/material/styles';
import type { PaletteOptions } from '@mui/material/styles';
import './types';

const textPrimary = '#1B1B1F';
const textSecondary = '#46464F';

const secondaryMain = '#5A5C78';

const divider = '#EFEDF4';
const background = '#FFF';

const disabled = '#777680';
const disabledBackground = '#E4E1E6';

export default function colorPalettes(mode: 'light' | 'dark'): PaletteOptions {
  return {
    mode,
    primary: {
      lighter: '#E0E0FF',
      light: '#BDC2FF',
      main: '#606BDF',
      dark: '#3944B8',
      darker: '#000668'
    },
    secondary: {
      lighter: '#E0E0FF',
      light: '#C3C4E4',
      main: secondaryMain,
      dark: '#43455F',
      darker: '#171A31'
    },
    error: {
      lighter: '#FFEDEA',
      light: '#FFDAD6',
      main: '#DE3730',
      dark: '#BA1A1A',
      darker: '#690005'
    },
    warning: {
      lighter: '#FFEEE1',
      light: '#FFDCBE',
      main: '#AE6600',
      dark: '#8B5000',
      darker: '#4A2800'
    },
    success: {
      lighter: '#C8FFC0',
      light: '#B6F2AF',
      main: '#22892F',
      dark: '#006E1C',
      darker: '#00390A'
    },
    info: {
      lighter: '#D4F7FF',
      light: '#A1EFFF',
      main: '#008394',
      dark: '#006876',
      darker: '#00363E'
    },
    grey: {
      50: '#FBF8FF',
      100: '#F5F2FA',
      200: divider,
      300: '#EAE7EF',
      400: disabledBackground,
      500: '#DBD9E0',
      600: '#C7C5D0',
      700: disabled,
      800: textSecondary,
      900: textPrimary
    },
    text: {
      primary: textPrimary,
      secondary: textSecondary,
      disabled: disabled
    },
    divider,
    background: {
      default: background
    },
    action: {
      hover: alpha(secondaryMain, 0.05),
      disabled: alpha(disabled, 0.6),
      disabledBackground: alpha(disabledBackground, 0.9)
    }
  };
}
