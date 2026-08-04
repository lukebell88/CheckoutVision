import type { SxProps, Theme } from '@mui/material/styles';

import Box from '@mui/material/Box';

import { IcChevronRight, IcChevronLeft, IcChevronDown, IcInfo } from '../app/shell/icons';

/**
 * Iconify shim.
 *
 * Minimal's nav-section and layout render a handful of icons through
 * `@iconify/react`. The studio uses Phosphor behind the `Ic*` wrappers, so rather
 * than adding iconify (and its icon-set fetching) for a few glyphs, this maps
 * those names onto ours.
 *
 * It has to survive `styled(Iconify)` and accept `width` / `sx` / `className`,
 * which is why it renders a Box rather than the icon directly.
 *
 * Every name a lifted component asks for must be here — an unmapped name renders
 * an empty box, which reads as a blank or filled button rather than an error.
 * Hence the dev warning below.
 */
const ICONS: Record<string, (p: { size: number }) => React.ReactNode> = {
  'eva:arrow-ios-forward-fill': ({ size }) => <IcChevronRight size={size} />,
  'eva:arrow-ios-back-fill': ({ size }) => <IcChevronLeft size={size} />,
  'eva:arrow-ios-downward-fill': ({ size }) => <IcChevronDown size={size} />,
  'eva:info-outline': ({ size }) => <IcInfo size={size} />,
};

const warned = new Set<string>();

export const iconifyClasses = { root: 'studio__iconify' };

export type IconifyProps = {
  icon: string;
  width?: number | string;
  className?: string;
  sx?: SxProps<Theme>;
};

export function Iconify({ icon, width = 20, className, sx, ...other }: IconifyProps) {
  const render = ICONS[icon];
  const size = typeof width === 'number' ? width : 20;

  if (import.meta.env.DEV && !render && !warned.has(icon)) {
    warned.add(icon);
    console.warn(`[iconify shim] no mapping for "${icon}" — add one in studio-nav/iconify.tsx`);
  }

  return (
    <Box
      component="span"
      className={[iconifyClasses.root, className].filter(Boolean).join(' ')}
      sx={[
        {
          width,
          height: width,
          flexShrink: 0,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          '& svg': { width: 1, height: 1 },
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      {render ? render({ size }) : null}
    </Box>
  );
}
