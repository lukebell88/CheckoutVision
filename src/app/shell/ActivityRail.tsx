import type { ReactNode } from 'react';

import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import ButtonBase from '@mui/material/ButtonBase';
import Typography from '@mui/material/Typography';
import { varAlpha } from 'minimal-shared/utils';

import { useStore } from '../../studio/store';
import type { StudioView } from '../../studio/project';
import { IcGrid, IcSun, IcMoon, IcLayers, IcLayout, IcKeyboard, IcConfig } from './icons';

/**
 * Slim far-left rail: logo (→ the projects gallery) + view switch + theme.
 *
 * Built from MUI primitives under the Minimal theme rather than lifting
 * Minimal's own `nav-section` component — that one pulls in iconify, simplebar
 * and react-router, none of which the studio has or wants. The theme gives us
 * the look; the behaviour is ours.
 */

const VIEWS: { id: StudioView; label: string; title: string; icon: ReactNode }[] = [
  { id: 'flows', label: 'Proto', title: 'Prototype', icon: <IcLayout /> },
  { id: 'pages', label: 'Pages', title: 'Pages', icon: <IcLayers /> },
  { id: 'components', label: 'Parts', title: 'Components', icon: <IcGrid /> },
  { id: 'config', label: 'Config', title: 'Configurations', icon: <IcConfig /> },
];

export function ActivityRail() {
  const view = useStore((s) => s.view);
  const setView = useStore((s) => s.setView);
  const theme = useStore((s) => s.theme);
  const toggleTheme = useStore((s) => s.toggleTheme);
  const toggleShortcuts = useStore((s) => s.toggleShortcuts);

  return (
    <Stack
      component="nav"
      sx={{
        width: 62,
        flex: 'none',
        py: 1.25,
        alignItems: 'center',
        justifyContent: 'space-between',
        bgcolor: 'background.paper',
        borderRight: (t) => `1px solid ${t.vars.palette.divider}`,
      }}
    >
      <Stack sx={{ width: 1, alignItems: 'center', gap: 1.5 }}>
        <Tooltip title="All projects" placement="right">
          <ButtonBase
            onClick={() => setView('projects')}
            aria-label="All projects"
            sx={{
              width: 34,
              height: 34,
              borderRadius: 1,
              color: 'text.primary',
              opacity: view === 'projects' ? 1 : 0.55,
              transition: (t) => t.transitions.create(['opacity']),
              '&:hover': { opacity: view === 'projects' ? 1 : 0.8 },
              '& svg': { width: 1, height: 1, display: 'block' },
            }}
          >
            {/* Placeholder square mark — swap for a square brand SVG later. */}
            <LogoMark />
          </ButtonBase>
        </Tooltip>

        <Stack sx={{ width: 1, alignItems: 'center', gap: 0.5 }}>
          {VIEWS.map((v) => (
            <RailButton
              key={v.id}
              title={v.title}
              label={v.label}
              active={view === v.id}
              onClick={() => setView(v.id)}
            >
              {v.icon}
            </RailButton>
          ))}
        </Stack>
      </Stack>

      <Stack sx={{ alignItems: 'center', gap: 0.5 }}>
        <RailButton title="Keyboard shortcuts" onClick={toggleShortcuts}>
          <IcKeyboard />
        </RailButton>
        <RailButton
          title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
          onClick={toggleTheme}
        >
          {theme === 'dark' ? <IcSun /> : <IcMoon />}
        </RailButton>
      </Stack>
    </Stack>
  );
}

/** One rail entry. Active state carries a left-edge indicator flush to the rail. */
function RailButton({
  title,
  label,
  active = false,
  onClick,
  children,
}: {
  title: string;
  label?: string;
  active?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <Tooltip title={title} placement="right">
      <ButtonBase
        onClick={onClick}
        aria-label={title}
        sx={{
          position: 'relative',
          width: 48,
          height: 46,
          borderRadius: 1.25,
          flexDirection: 'column',
          gap: 0.4,
          color: active ? 'primary.main' : 'text.secondary',
          bgcolor: active
            ? (t) => varAlpha(t.vars.palette.primary.mainChannel, 0.08)
            : 'transparent',
          transition: (t) => t.transitions.create(['background-color', 'color']),
          '&:hover': {
            bgcolor: (t) =>
              active
                ? varAlpha(t.vars.palette.primary.mainChannel, 0.16)
                : t.vars.palette.action.hover,
            color: active ? 'primary.main' : 'text.primary',
          },
          ...(active && {
            '&::before': {
              content: '""',
              position: 'absolute',
              left: -7,
              top: '50%',
              transform: 'translateY(-50%)',
              width: 3,
              height: 20,
              borderRadius: '0 3px 3px 0',
              bgcolor: 'primary.main',
            },
          }),
        }}
      >
        {children}
        {label && (
          <Typography
            component="span"
            sx={{ fontSize: 9.5, fontWeight: 600, letterSpacing: '0.2px', lineHeight: 1 }}
          >
            {label}
          </Typography>
        )}
      </ButtonBase>
    </Tooltip>
  );
}

/** Brand logo (Total Platform). Uses currentColor so it adapts to light/dark. */
const LogoMark = () => (
  <svg width="100%" height="100%" viewBox="0 0 34 36" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
    <g clipPath="url(#tp-logo-clip)">
      <path d="M16.3018 0.258301C16.7273 0.012741 17.2522 0.0127415 17.6777 0.258301L32.8125 8.9917C33.2381 9.23747 33.5 9.6926 33.5 10.1841V25.7798C33.4999 26.2712 33.2381 26.7265 32.8125 26.9722L17.6777 35.7056C17.2523 35.951 16.7272 35.951 16.3018 35.7056L1.16797 26.9722C0.74227 26.7265 0.479635 26.2713 0.479492 25.7798V10.1841C0.479492 9.69252 0.742258 9.23744 1.16797 8.9917L16.3018 0.258301ZM17.1777 1.12451C17.0615 1.05744 16.918 1.05744 16.8018 1.12451L1.66699 9.85791C1.55092 9.92508 1.47949 10.05 1.47949 10.1841V25.7798C1.47963 25.9138 1.55094 26.0389 1.66699 26.106L16.8018 34.8394C16.9179 34.9063 17.0616 34.9063 17.1777 34.8394L32.3125 26.106C32.4286 26.0389 32.4999 25.9139 32.5 25.7798V10.1841C32.5 10.0499 32.4287 9.92506 32.3125 9.85791L17.1777 1.12451ZM25.1445 21.5161C25.384 21.3793 25.6899 21.4614 25.8271 21.7007C25.9644 21.94 25.8807 22.2458 25.6416 22.3833L17.2393 27.2007L16.9912 27.3433L16.7422 27.2007L8.33984 22.3833C8.10054 22.2459 8.018 21.9401 8.15527 21.7007C8.29284 21.4617 8.59859 21.3789 8.83789 21.5161L16.9902 26.1899L25.1445 21.5161ZM25.1992 18.9438C25.4386 18.8068 25.7445 18.8892 25.8818 19.1284C26.0191 19.3679 25.9357 19.6736 25.6963 19.811L17.2939 24.6284L17.0459 24.771L16.7969 24.6284L8.39453 19.811C8.15534 19.6736 8.07271 19.3678 8.20996 19.1284C8.34744 18.8894 8.65323 18.8067 8.89258 18.9438L17.0449 23.6177L25.1992 18.9438ZM25.1973 16.3179C25.4363 16.1801 25.7428 16.2616 25.8809 16.5005C26.0186 16.7392 25.9365 17.0447 25.6982 17.1831L17.2686 22.0552L17.0186 22.1997L16.7676 22.0552L8.33887 17.1831C8.09978 17.0449 8.01809 16.7396 8.15625 16.5005C8.29455 16.2618 8.59994 16.1798 8.83887 16.3179L17.0176 21.0435L25.1973 16.3179ZM17.2676 8.81787L25.4775 13.5396C25.8847 13.7739 25.8844 14.3616 25.4775 14.5962L23.2471 15.8784C23.1756 15.9586 23.0816 16.0097 22.9805 16.0317L20.1445 17.6626C20.0878 17.7149 20.0223 17.7534 19.9502 17.7749L17.2676 19.3188L17.0186 19.4614L16.7686 19.3188L14.0889 17.7769C14.0124 17.755 13.942 17.715 13.8828 17.6587L11.0566 16.0327C10.9539 16.0108 10.8583 15.9583 10.7861 15.8765L8.55957 14.5962C8.15224 14.3618 8.15215 13.7739 8.55957 13.5396L16.7686 8.81787L17.0186 8.67432L17.2676 8.81787ZM15.2354 17.2827L17.0176 18.3081L18.7979 17.2837L17.0166 16.2349L15.2354 17.2827ZM12.1855 15.5288L14.2383 16.7095L16.7637 15.2251L17.0176 15.0757L17.2705 15.2251L19.7959 16.7095L21.8486 15.5288L17.0176 12.729L12.1855 15.5288ZM9.64551 14.0679L11.1846 14.9526L16.7676 11.7192L17.0176 11.5737L17.2686 11.7192L22.8496 14.9526L24.3896 14.0679L17.0176 9.82764L9.64551 14.0679Z" fill="currentColor" />
    </g>
    <defs>
      <clipPath id="tp-logo-clip"><rect width="34" height="36" fill="white" /></clipPath>
    </defs>
  </svg>
);
