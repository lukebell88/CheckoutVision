import type { ReactNode } from 'react';

import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

import { useStore } from '../../studio/store';
import { DEVICES, COLUMN_CHOICES, type DeviceId } from '../../config/devices';
import { IcDesktop, IcTablet, IcMobile } from './icons';

/**
 * Shared canvas chrome — the toolbar controls and the scrolling grid, used by
 * both canvases and by the layout header's second row.
 *
 * The title moved out: the starter keeps headings in the content, not the
 * header, so each view renders a `ViewHeading` above its grid.
 */

const DEVICE_ICON = { desktop: IcDesktop, tablet: IcTablet, mobile: IcMobile };

/** Canvas root: a full-height column with its own scroll region. */
export function CanvasRoot({ children }: { children: ReactNode }) {
  return (
    <Box
      component="main"
      sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}
    >
      {children}
    </Box>
  );
}

/** The scrolling frame grid. */
export function CanvasGrid({
  gap,
  gridRef,
  heading,
  children,
}: {
  gap: number;
  gridRef: React.Ref<HTMLDivElement>;
  heading?: ReactNode;
  children: ReactNode;
}) {
  return (
    <Box
      className="canvas__scroll"
      sx={{
        flex: 1,
        overflow: 'auto',
        pt: 'var(--layout-dashboard-content-pt)',
        px: 'var(--layout-dashboard-content-px)',
        pb: 'var(--layout-dashboard-content-pb)',
      }}
    >
      {heading}
      <Box
        ref={gridRef}
        sx={{ display: 'flex', flexWrap: 'wrap', alignContent: 'flex-start', gap: `${gap}px` }}
      >
        {children}
      </Box>
    </Box>
  );
}

export function ToolSep() {
  return <Divider orientation="vertical" flexItem sx={{ my: 0.5 }} />;
}

export function ToolButton({
  title,
  onClick,
  children,
}: {
  title: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <Tooltip title={title}>
      <IconButton size="small" onClick={onClick} aria-label={title}>
        {children}
      </IconButton>
    </Tooltip>
  );
}

/** Device preset switch. */
export function DeviceToggle() {
  const device = useStore((s) => s.device);
  const setDevice = useStore((s) => s.setDevice);

  return (
    <ToggleButtonGroup
      exclusive
      size="small"
      value={device}
      onChange={(_, v) => v && setDevice(v as DeviceId)}
      aria-label="Device"
    >
      {DEVICES.map((d) => {
        const Icon = DEVICE_ICON[d.id];
        return (
          <ToggleButton key={d.id} value={d.id} title={`${d.name} · ${d.width}×${d.height}`}>
            <Icon />
          </ToggleButton>
        );
      })}
    </ToggleButtonGroup>
  );
}

/** Frames-per-row switch. */
export function ColumnsToggle() {
  const columns = useStore((s) => s.columns);
  const setColumns = useStore((s) => s.setColumns);

  return (
    <ToggleButtonGroup
      exclusive
      size="small"
      value={columns}
      onChange={(_, v) => v && setColumns(v as number)}
      aria-label="Columns"
    >
      {COLUMN_CHOICES.map((n) => (
        <ToggleButton key={n} value={n} title={`${n} column${n > 1 ? 's' : ''}`} sx={{ minWidth: 34 }}>
          {n}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
}
