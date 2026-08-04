import { useEffect, type ReactNode } from 'react';
import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';
import { useStore } from '../studio/store';
import { ProjectProvider } from '../studio/runtime';
import { useActiveProject } from '../studio/useActiveProject';
import { StudioNav } from './shell/StudioNav';
import { StudioHeader } from './shell/StudioHeader';
import { Canvas } from './shell/Canvas';
import { PagesCanvas } from './shell/PagesCanvas';
import { FocusView } from './shell/FocusView';
import { CommandPalette } from './shell/CommandPalette';
import { KeyboardLayer } from './shell/KeyboardLayer';
import { ShortcutsHelp } from './shell/ShortcutsHelp';
import { ComponentsBrowser } from './components-view/ComponentsBrowser';
import { ConfigView } from './config-view/ConfigView';
import { ProjectsGallery } from './projects-view/ProjectsGallery';
import { ThemeProvider } from '../studio-theme';
import { LayoutSection, MainSection, layoutClasses } from '../studio-layout/core';
import { dashboardLayoutVars, dashboardNavVars } from '../studio-layout/dashboard-vars';
// Studio chrome styles and type load with the studio chunk, never with a live
// link. Public Sans is Minimal's face; it is self-hosted via @fontsource.
import '@fontsource-variable/public-sans';
import './studio.css';

/**
 * The studio: an activity rail (Prototype / Pages / Components / Config) beside
 * the active view. ⌘K opens the command palette; present mode strips the chrome.
 *
 * Three scopes, outermost first:
 *   `Projects`               the gallery — renders above any project, from the
 *                            eager meta.ts files, loading no prototype code.
 *   `Components` / `Config`  platform views: the Fabric library and its
 *                            design-system configuration, shared by every project.
 *   `Prototype` / `Pages`    project views, rendered from the active ProjectDef.
 *
 * The Minimal theme is provided here, at the studio root and nowhere else. It
 * deliberately does not reach the checkout previews inside the canvas — see the
 * note in studio-theme/theme-provider.tsx.
 */
export function App() {
  return (
    <ThemeProvider>
      <StudioShell />
    </ThemeProvider>
  );
}

function StudioShell() {
  const focused = useStore((s) => s.focused);
  const theme = useStore((s) => s.theme);
  const view = useStore((s) => s.view);
  const presentMode = useStore((s) => s.presentMode);
  const setPresent = useStore((s) => s.setPresent);
  const projectId = useStore((s) => s.projectId);
  const { project, failed } = useActiveProject();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // The gallery sits above the load gate — it lists projects from their meta
  // alone and must render whether or not one is loaded. The active project still
  // loads in the background (above), so picking it up again is instant.
  if (view === 'projects') {
    return (
      <StudioFrame>
        <ProjectsGallery />
        <CommandPalette />
        <ShortcutsHelp />
        <KeyboardLayer />
      </StudioFrame>
    );
  }

  // Projects load lazily, so the shell waits for the active one. Everything
  // below this point can assume the project and its state exist.
  if (!project) {
    return (
      <StudioFrame>
        <Box
          sx={{
            flex: 1,
            display: 'grid',
            placeItems: 'center',
            color: 'text.secondary',
            fontSize: 13,
          }}
        >
          {failed ? `Couldn't load the "${projectId}" project.` : 'Loading…'}
        </Box>
      </StudioFrame>
    );
  }

  return (
    <ProjectProvider project={project}>
      <StudioFrame present={presentMode}>
        {view === 'components' ? (
          <ComponentsBrowser />
        ) : view === 'config' ? (
          <ConfigView />
        ) : view === 'pages' ? (
          <PagesCanvas />
        ) : (
          <Canvas />
        )}

        {presentMode && (
          <button className="present-exit" onClick={() => setPresent(false)} title="Exit present mode (Esc)">
            Exit present · Esc
          </button>
        )}

        {focused && view === 'flows' && <FocusView />}
        <CommandPalette />
        <ShortcutsHelp />
        <KeyboardLayer />
      </StudioFrame>
    </ProjectProvider>
  );
}

/**
 * The studio window — Minimal's `LayoutSection` with the nav as its sidebar.
 *
 * Structure and layout come from the starter: `LayoutSection` publishes the
 * layout CSS variables and renders sidebar + content, and the content container
 * is offset by whichever nav width is current, transitioning with it. The nav
 * itself is `position: fixed`, which is why that offset exists.
 *
 * `studio--present` stays as a class while some views still hide their own
 * chrome through CSS (canvas headers, the components nav).
 */
function StudioFrame({ present = false, children }: { present?: boolean; children: ReactNode }) {
  const theme = useTheme();
  const navMini = useStore((s) => s.navMini);

  return (
    <LayoutSection
      className={present ? 'studio studio--present' : 'studio'}
      cssVars={{ ...dashboardLayoutVars(theme), ...dashboardNavVars(theme) }}
      sidebarSection={present ? null : <StudioNav />}
      headerSection={present ? null : <StudioHeader />}
      sx={{
        minHeight: '100vh',
        [`& .${layoutClasses.sidebarContainer}`]: {
          minHeight: '100vh',
          // Gated on the same breakpoint as the nav's own visibility, so the
          // offset can never reserve space for a nav that isn't rendered.
          [theme.breakpoints.up('xs')]: {
            pl: navMini ? 'var(--layout-nav-mini-width)' : 'var(--layout-nav-vertical-width)',
          },
          transition: theme.transitions.create(['padding-left'], {
            easing: 'var(--layout-transition-easing)',
            duration: 'var(--layout-transition-duration)',
          }),
        },
      }}
    >
      <MainSection sx={{ height: '100vh', minHeight: 0, overflow: 'hidden' }}>
        {children}
      </MainSection>
    </LayoutSection>
  );
}
