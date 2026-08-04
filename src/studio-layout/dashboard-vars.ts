import type { Theme } from '@mui/material/styles';

/**
 * Minimal's dashboard layout variables. `dashboardNavColorVars` is dropped —
 * it switches on the demo app's settings state (nav colour presets, RTL); the
 * studio has one fixed theme, and the 'integrate' defaults are what we want.
 */


export function dashboardLayoutVars(theme: Theme) {
  return {
    '--layout-transition-easing': 'linear',
    '--layout-transition-duration': '120ms',
    '--layout-nav-mini-width': '88px',
    '--layout-nav-vertical-width': '300px',
    '--layout-nav-horizontal-height': '64px',
    '--layout-dashboard-content-pt': theme.spacing(1),
    '--layout-dashboard-content-pb': theme.spacing(8),
    '--layout-dashboard-content-px': theme.spacing(5),
  };
}

/**
 * Nav colour variables — Minimal's `integrate` preset, which is its default.
 * Upstream this is a switch over the demo app's `navColor` setting; the studio
 * has one look, so the branch is inlined. `NavRoot` reads `--layout-nav-bg` and
 * `--layout-nav-border-color` directly, so these are required, not decorative.
 */
export function dashboardNavVars(theme: Theme) {
  const {
    vars: { palette },
  } = theme;

  return {
    '--layout-nav-bg': palette.background.default,
    '--layout-nav-border-color': `rgba(${palette.grey['500Channel']} / 0.12)`,
    '--layout-nav-text-primary-color': palette.text.primary,
    '--layout-nav-text-secondary-color': palette.text.secondary,
    '--layout-nav-text-disabled-color': palette.text.disabled,
  };
}
