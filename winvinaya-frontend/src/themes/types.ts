// src/themes/types.ts
import type { CustomShadows } from './shadow';

export interface PaletteCustomShades {
  lighter?: string;
  darker?: string;
}

declare module '@mui/material/styles' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface PaletteColor extends PaletteCustomShades {}
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface SimplePaletteColorOptions extends PaletteCustomShades {}

  interface Theme {
    customShadows: CustomShadows;
  }
  interface ThemeOptions {
    customShadows?: CustomShadows;
  }

}