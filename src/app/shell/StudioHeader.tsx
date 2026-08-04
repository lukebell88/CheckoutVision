import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';

import { useStore } from '../../studio/store';
import { flowScreens } from '../../studio/project';
import { useProjectOptional } from '../../studio/runtime';
import { HeaderSection } from '../../studio-layout/core';
import { BrandSwitcher } from './BrandSwitcher';
import { ShareButton } from './ShareButton';
import { DeviceToggle, ColumnsToggle, ToolButton, ToolSep } from './CanvasChrome';
import { IcExpand, IcPresent, IcSearch, IcSun, IcMoon, IcKeyboard, IcSidebar } from './icons';

/**
 * The studio header — Minimal's `HeaderSection`, at the layout level.
 *
 * Follows the starter's split: the header carries *global* chrome only, and the
 * view's title lives in its content (see `ViewHeading`). Minimal uses `topArea`
 * for a banner and `bottomArea` for a second row; here that second row is the
 * canvas toolbar, which keeps view-specific controls out of the global row.
 */
export function StudioHeader() {
  const view = useStore((s) => s.view);
  const projectId = useStore((s) => s.projectId);
  const project = useProjectOptional();

  const isCanvas = view === 'flows' || view === 'pages';
  // Config and Components have their own sub-nav; it needs a visible toggle,
  // not just ⌘\\ and the palette.
  const hasSubNav = view === 'config' || view === 'components';

  return (
    <HeaderSection
      layoutQuery="xs"
      // Minimal disables the scroll shadow when the nav is vertical, which ours is.
      disableElevation
      slotProps={{
        container: { maxWidth: false, sx: { px: 5 } },
        centerArea: { sx: { display: 'none' } },
      }}
      slots={{
        topArea: !project && view !== 'projects' ? (
          <Alert severity="warning" sx={{ borderRadius: 0 }}>
            Couldn&apos;t load the “{projectId}” project.
          </Alert>
        ) : null,
        leftArea: (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mr: 'auto' }}>
            {hasSubNav && <SubNavToggle />}
            <BrandSwitcher />
          </Box>
        ),
        rightArea: <GlobalActions />,
        bottomArea: isCanvas ? <CanvasToolbar view={view} /> : null,
      }}
      sx={{ borderBottom: (t) => `1px solid ${t.vars.palette.divider}` }}
    />
  );
}

/** Show/hide the current view's sub-nav panel. */
function SubNavToggle() {
  const sidebarOpen = useStore((s) => s.sidebarOpen);
  const toggleSidebar = useStore((s) => s.toggleSidebar);

  return (
    <Tooltip title={sidebarOpen ? 'Hide panel (⌘\\)' : 'Show panel (⌘\\)'}>
      <IconButton
        size="small"
        onClick={toggleSidebar}
        aria-label={sidebarOpen ? 'Hide panel' : 'Show panel'}
        sx={{ color: sidebarOpen ? 'text.primary' : 'text.disabled' }}
      >
        <IcSidebar />
      </IconButton>
    </Tooltip>
  );
}

/** Studio-wide actions. Minimal's equivalent slot holds search + settings. */
function GlobalActions() {
  const theme = useStore((s) => s.theme);
  const toggleTheme = useStore((s) => s.toggleTheme);
  const toggleShortcuts = useStore((s) => s.toggleShortcuts);
  const togglePalette = useStore((s) => s.togglePalette);

  return (
    <Stack direction="row" sx={{ alignItems: 'center', gap: 0.75 }}>
      {/* The palette was keyboard-only; Minimal puts a searchbar here, which is
          also the only affordance telling anyone the palette exists. */}
      <Button
        size="small"
        color="inherit"
        onClick={togglePalette}
        startIcon={<IcSearch size={16} />}
        sx={{
          px: 1.25,
          fontWeight: 400,
          color: 'text.secondary',
          bgcolor: 'action.hover',
          '&:hover': { bgcolor: 'action.selected' },
        }}
      >
        Search
        <Box
          component="span"
          sx={{
            ml: 1.5,
            px: 0.75,
            py: 0.125,
            fontSize: 11,
            borderRadius: 0.75,
            color: 'text.disabled',
            border: (t) => `1px solid ${t.vars.palette.divider}`,
          }}
        >
          ⌘K
        </Box>
      </Button>

      <Tooltip title="Keyboard shortcuts">
        <IconButton size="small" onClick={toggleShortcuts} aria-label="Keyboard shortcuts">
          <IcKeyboard />
        </IconButton>
      </Tooltip>
      <Tooltip title={theme === 'dark' ? 'Light mode' : 'Dark mode'}>
        <IconButton
          size="small"
          onClick={toggleTheme}
          aria-label={theme === 'dark' ? 'Light mode' : 'Dark mode'}
        >
          {theme === 'dark' ? <IcSun /> : <IcMoon />}
        </IconButton>
      </Tooltip>
    </Stack>
  );
}

/** Second row — the canvas's own controls, in Minimal's `bottomArea` slot. */
function CanvasToolbar({ view }: { view: string }) {
  const project = useProjectOptional();
  const openFocus = useStore((s) => s.openFocus);
  const setPresent = useStore((s) => s.setPresent);
  const flowId = useStore((s) => s.byProject[s.projectId]?.flowId ?? '');
  const flags = useStore((s) => s.byProject[s.projectId]?.flags ?? {});

  const flow = project?.flows.find((f) => f.id === flowId);
  // Respect flag-gated screens so focus opens on the journey's real first screen
  // (email-first, say, drops the sign-in page).
  const firstScreen = flow ? flowScreens(flow, flags)[0]?.id : undefined;

  return (
    <Stack
      direction="row"
      sx={{
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 1,
        px: 5,
        py: 1.25,
        borderTop: (t) => `1px solid ${t.vars.palette.divider}`,
      }}
    >
      <DeviceToggle />
      <ToolSep />
      <ColumnsToggle />
      <Box sx={{ ml: 'auto' }} />
      {view === 'flows' && (
        <>
          <ToolButton
            title="Focus first screen"
            onClick={() => firstScreen && openFocus(firstScreen)}
          >
            <IcExpand />
          </ToolButton>
        </>
      )}
      <ToolButton title="Present mode" onClick={() => setPresent(true)}>
        <IcPresent />
      </ToolButton>
      {view === 'flows' && <ShareButton />}
    </Stack>
  );
}

