import { useMemo, useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';

import { useStore, selectProjectState } from '../../studio/store';
import { useProject } from '../../studio/runtime';
import { ViewNav } from '../shell/ViewNav';
import { ViewHeading } from '../shell/ViewHeading';

/**
 * Configurations view — the active prototype's own configuration, which today
 * means its feature flags.
 *
 * Component configuration (`_Config/Header/*` and friends) deliberately does NOT
 * live here: those boards describe a design-system component across every brand,
 * not this project, so they sit in the Components view's Configuration section.
 */
export function ConfigView() {
  const sidebarOpen = useStore((s) => s.sidebarOpen);
  const project = useProject();
  const flags = useStore(selectProjectState).flags;
  const toggleFlag = useStore((s) => s.toggleFlag);
  const [query, setQuery] = useState('');

  const FLAGS = project.flags;
  const q = query.toLowerCase().trim();
  const matchFlag = (name: string, desc: string) =>
    !q || name.toLowerCase().includes(q) || desc.toLowerCase().includes(q);

  const flagGroups = useMemo(
    () => {
      const order = [...new Set(FLAGS.map((f) => f.group))];
      return order
        .map((group) => ({
          group,
          items: FLAGS.filter((f) => f.group === group && matchFlag(f.name, f.description)),
        }))
        .filter((g) => g.items.length);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [q, FLAGS],
  );

  const jump = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  return (
    // MainSection is a flex *column*; a view with its own sub-nav has to lay its
    // panel and content out as a row.
    <Box sx={{ flex: 1, minHeight: 0, display: 'flex' }}>
      {sidebarOpen && (
        <ViewNav
          title="Configurations"
          placeholder="Search configuration"
          query={query}
          onQueryChange={setQuery}
          groups={[
            {
              label: 'Feature flags',
              items: flagGroups.map((g) => ({
                id: g.group,
                label: g.group,
                onClick: () => jump(`cfgflag-${g.group}`),
              })),
            },
          ]}
        />
      )}

      <Box
        component="main"
        sx={{
          flex: 1,
          minWidth: 0,
          overflowY: 'auto',
          pt: 'var(--layout-dashboard-content-pt)',
          px: 'var(--layout-dashboard-content-px)',
          pb: 'var(--layout-dashboard-content-pb)',
        }}
      >
        <ViewHeading
          title="Configurations"
          subtitle={`Feature flags · ${FLAGS.filter((f) => flags[f.id]).length} of ${FLAGS.length} active`}
        />

        {flagGroups.length > 0 && (
          <>
            <Box
              sx={{
                display: 'grid',
                gap: 2,
                maxWidth: 1180,
                gridTemplateColumns: 'repeat(auto-fill, minmax(330px, 1fr))',
                alignItems: 'start',
              }}
            >
              {flagGroups.map((g) => {
                const on = g.items.filter((f) => flags[f.id]).length;
                return (
                  <Card key={g.group} id={`cfgflag-${g.group}`} sx={{ p: 1 }}>
                    <Stack
                      direction="row"
                      sx={{ alignItems: 'center', justifyContent: 'space-between', px: 1.25, pt: 1 }}
                    >
                      <Typography variant="overline" sx={{ color: 'text.disabled' }}>
                        {g.group}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ color: 'text.disabled', fontVariantNumeric: 'tabular-nums' }}
                      >
                        {on}/{g.items.length}
                      </Typography>
                    </Stack>
                    {g.items.map((f) => (
                      <Stack
                        key={f.id}
                        component="label"
                        direction="row"
                        sx={{
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: 1.5,
                          px: 1.25,
                          py: 1,
                          borderRadius: 1,
                          cursor: 'pointer',
                          '&:hover': { bgcolor: 'action.hover' },
                        }}
                      >
                        <Box sx={{ minWidth: 0 }}>
                          <Typography variant="body2">{f.name}</Typography>
                          <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                            {f.description}
                          </Typography>
                        </Box>
                        <Switch
                          size="small"
                          checked={flags[f.id]}
                          onChange={() => toggleFlag(f.id)}
                        />
                      </Stack>
                    ))}
                  </Card>
                );
              })}
            </Box>
          </>
        )}
      </Box>
    </Box>
  );
}
