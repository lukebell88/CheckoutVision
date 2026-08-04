import { useMemo } from 'react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
import ButtonBase from '@mui/material/ButtonBase';
import Typography from '@mui/material/Typography';
import { varAlpha } from 'minimal-shared/utils';

import { useStore } from '../../studio/store';
import { useProjectOptional } from '../../studio/runtime';
import type { NavSectionProps } from '../../studio-nav/nav-section';
import { NavVertical } from '../../studio-layout/nav-vertical';
import { IcGrid, IcLayers, IcLayout, IcConfig } from './icons';

/**
 * The studio nav.
 *
 * Structure and layout are Minimal's: `NavVertical` from the starter provides the
 * expanding/collapsing root (widths come from `--layout-nav-vertical-width` /
 * `--layout-nav-mini-width`) and its `NavToggleButton` riding the right border.
 * We supply the data and the top/bottom slots.
 *
 * Flows and variant groups are *children* of their nav items rather than a second
 * panel, and navigation is store state — `studio-nav/router.tsx` bridges that to
 * the synthetic paths nav-section matches on.
 */
export function StudioNav() {
  const project = useProjectOptional();
  const navMini = useStore((s) => s.navMini);
  const toggleNavMini = useStore((s) => s.toggleNavMini);

  const data: NavSectionProps['data'] = useMemo(
    () => [
      {
        subheader: 'Project',
        items: [
          {
            title: 'Prototype',
            path: '/flows',
            icon: <IcLayout />,
            children: (project?.flows ?? []).map((f) => ({
              title: f.name,
              path: `/flows/${f.id}`,
            })),
          },
          {
            title: 'Pages',
            path: '/pages',
            icon: <IcLayers />,
            children: (project?.variants ?? []).map((g) => ({
              title: g.name,
              path: `/pages/${g.id}`,
            })),
          },
        ],
      },
      {
        subheader: 'Platform',
        items: [
          { title: 'Components', path: '/components', icon: <IcGrid /> },
          { title: 'Configurations', path: '/config', icon: <IcConfig /> },
        ],
      },
    ],
    [project],
  );

  return (
    <NavVertical
      data={data}
      // Minimal hides the nav below `md` and swaps in a NavMobile drawer. We
      // didn't lift that drawer, so the nav must never hide — otherwise it just
      // disappears on a narrow window.
      layoutQuery="xs"
      isNavMini={navMini}
      onToggleNav={toggleNavMini}
      enabledRootRedirect
      slots={{ topArea: <ProjectSwitcher mini={navMini} /> }}
    />
  );
}

/** Top slot — where Minimal's dashboard puts its workspace switcher. */
function ProjectSwitcher({ mini }: { mini: boolean }) {
  const project = useProjectOptional();
  const view = useStore((s) => s.view);
  const setView = useStore((s) => s.setView);
  const name = project?.name ?? 'Projects';
  const active = view === 'projects';

  return (
    <Box sx={{ p: mini ? 1 : 2, pt: 2.5 }}>
      <Tooltip title={mini ? name : ''} placement="right">
        <ButtonBase
          onClick={() => setView('projects')}
          aria-label="All projects"
          sx={{
            width: 1,
            gap: 1.25,
            p: mini ? 0.75 : 1.25,
            borderRadius: 1.5,
            justifyContent: mini ? 'center' : 'flex-start',
            bgcolor: (t) =>
              active
                ? varAlpha(t.vars.palette.primary.mainChannel, 0.12)
                : varAlpha(t.vars.palette.grey['500Channel'], 0.08),
            transition: (t) => t.transitions.create(['background-color']),
            '&:hover': { bgcolor: (t) => varAlpha(t.vars.palette.primary.mainChannel, 0.16) },
          }}
        >
          <Box
            aria-hidden
            sx={{
              width: 28,
              height: 28,
              flex: 'none',
              borderRadius: 1,
              display: 'grid',
              placeItems: 'center',
              color: 'primary.contrastText',
              bgcolor: 'primary.main',
              fontSize: 13,
              fontWeight: 700,
            }}
          >
            {name.charAt(0)}
          </Box>
          {!mini && (
            <>
              <Typography variant="subtitle2" noWrap sx={{ minWidth: 0 }}>
                {name}
              </Typography>
              <Chip label="Studio" size="small" variant="soft" sx={{ ml: 'auto' }} />
            </>
          )}
        </ButtonBase>
      </Tooltip>
    </Box>
  );
}

