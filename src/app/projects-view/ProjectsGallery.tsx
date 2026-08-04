import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import CardActionArea from '@mui/material/CardActionArea';
import Typography from '@mui/material/Typography';

import { useStore } from '../../studio/store';
import { PROJECT_METAS } from '../../studio/registry';
import { IcLayout } from '../shell/icons';
import { ViewHeading } from '../shell/ViewHeading';

/**
 * The studio home: one card per project.
 *
 * This is the only view that sits ABOVE a project — the list comes entirely from
 * the eagerly loaded `meta.ts` files, so rendering it loads no project
 * definitions. (The *active* project does load in parallel, above in `App`, so
 * that opening it is instant; every other project stays unloaded until chosen.)
 *
 * First view rebuilt on the Minimal theme: MUI components, no `.proj-*` classes.
 */
export function ProjectsGallery() {
  const projectId = useStore((s) => s.projectId);
  const setProject = useStore((s) => s.setProject);
  const setView = useStore((s) => s.setView);

  const open = (id: string) => {
    setProject(id);
    setView('flows');
  };

  return (
    <Box component="main" sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          pt: 'var(--layout-dashboard-content-pt)',
          px: 'var(--layout-dashboard-content-px)',
          pb: 'var(--layout-dashboard-content-pb)',
        }}
      >
        <ViewHeading
          title="Projects"
          subtitle={`${PROJECT_METAS.length} ${PROJECT_METAS.length === 1 ? 'prototype' : 'prototypes'} in this studio`}
        />
        {PROJECT_METAS.length === 0 ? (
          <Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: 560 }}>
            No projects found. Add <code>src/projects/&lt;id&gt;/project.tsx</code> with a
            default-exported <code>ProjectDef</code>, plus a <code>meta.ts</code>.
          </Typography>
        ) : (
          <Box
            sx={{
              display: 'grid',
              gap: 2,
              maxWidth: 1180,
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              alignItems: 'start',
            }}
          >
            {PROJECT_METAS.map((m) => {
              const active = m.id === projectId;
              return (
                <Card
                  key={m.id}
                  sx={{
                    ...(active && {
                      outline: (t) => `2px solid ${t.vars.palette.primary.main}`,
                      outlineOffset: -2,
                    }),
                  }}
                >
                  <CardActionArea onClick={() => open(m.id)} sx={{ p: 2 }}>
                    <Stack direction="row" spacing={2} alignItems="flex-start">
                      <Box
                        aria-hidden
                        sx={{
                          flex: 'none',
                          width: 44,
                          height: 44,
                          borderRadius: 1.25,
                          display: 'grid',
                          placeItems: 'center',
                          color: 'primary.main',
                          bgcolor: (t) => t.vars.palette.primary.lighter,
                        }}
                      >
                        <IcLayout size={22} />
                      </Box>
                      <Box sx={{ minWidth: 0 }}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Typography variant="subtitle1">{m.name}</Typography>
                          {active && <Chip label="Active" size="small" color="primary" />}
                        </Stack>
                        {m.description && (
                          <Typography
                            variant="body2"
                            sx={{ color: 'text.secondary', mt: 0.5 }}
                          >
                            {m.description}
                          </Typography>
                        )}
                      </Box>
                    </Stack>
                  </CardActionArea>
                </Card>
              );
            })}
          </Box>
        )}
      </Box>
    </Box>
  );
}
