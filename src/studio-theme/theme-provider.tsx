import type { Theme, ThemeProviderProps as MuiThemeProviderProps } from '@mui/material/styles';
import type {} from './extend-theme-types';
import type { ThemeOptions } from './types';

import { useMemo } from 'react';
import { ThemeProvider as ThemeVarsProvider } from '@mui/material/styles';

import { createTheme } from './create-theme';

/**
 * Minimal's theme, scoped to the studio.
 *
 * Two deliberate departures from the stock Minimal provider:
 *
 * 1. **No `<CssBaseline />`.** CssBaseline writes to `body` — font, colour,
 *    background, margins — which would cascade into the checkout previews
 *    rendered inside the canvas. Those have to look exactly like the brand's own
 *    site, so nothing from the studio's design system may reach them. MUI's
 *    component styles are emotion class-scoped and cannot leak, so global CSS is
 *    the only vector and this is it. The base resets the studio genuinely needs
 *    live in `src/base.css`, shared with live mode.
 *
 * 2. **No settings context or RTL.** Those belong to Minimal's demo app and drag
 *    in its settings drawer.
 */
export type ThemeProviderProps = Partial<MuiThemeProviderProps<Theme>> & {
  themeOverrides?: ThemeOptions;
};

export function ThemeProvider({ themeOverrides, children, ...other }: ThemeProviderProps) {
  const theme = useMemo(() => createTheme({ themeOverrides }), [themeOverrides]);

  return (
    <ThemeVarsProvider disableTransitionOnChange theme={theme} {...other}>
      {children}
    </ThemeVarsProvider>
  );
}
