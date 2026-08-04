import { useMemo, useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';

import { useStore } from '../../studio/store';
import { clientById } from '../../config/clients';
import { IconProvider } from '../../components/Icon';
import { CODE_CONNECT, FIGMA_FILE_KEY } from '../../components/codeConnect';
import { ViewNav } from '../shell/ViewNav';
import { ViewHeading } from '../shell/ViewHeading';
import { IcExternal } from '../shell/icons';
import { Playground } from './Playground';
import { ConfigBoard, boardGroups } from './ConfigBoard';
import { REGISTRY, CONFIGURABLE, CATEGORY_ORDER, categoryOf, type ComponentSpec } from './registry';

const CONNECTED = new Set(CODE_CONNECT.map((m) => m.component));
const figmaUrl = (node: string) =>
  `https://www.figma.com/design/${FIGMA_FILE_KEY}/components-fabric-v2b?node-id=${node}`;

/** Selections are `cfg:<id>` for a configuration board, or a bare component id. */
const CFG = 'cfg:';
const configId = (sel: string) => (sel.startsWith(CFG) ? sel.slice(CFG.length) : null);

/**
 * Components view — a design-system browser showing ONE entry at a time. Left:
 * search + an index; right: the selected entry, filling the pane.
 *
 * The index opens with a **Configuration** section listing every component that
 * exposes a per-client `_Config` board, above the component categories. Those
 * boards describe a component across all brands, so they belong here rather than
 * in Configurations, which is the active prototype's own settings.
 *
 * The preview canvas keeps `data-client` and its own `.ds-canvas` styling: the
 * specimens are real Fabric components and must render in brand tokens, not the
 * studio's theme — the same boundary the checkout previews sit behind.
 */
export function ComponentsBrowser() {
  const clientId = useStore((s) => s.clientId);
  const sidebarOpen = useStore((s) => s.sidebarOpen);
  const sel = useStore((s) => s.componentSel);
  const setSel = useStore((s) => s.setComponentSel);
  const [query, setQuery] = useState('');

  const configurable = useMemo(() => CONFIGURABLE(), []);
  const filtered = useMemo(() => filterRegistry(REGISTRY, query), [query]);
  const grouped = useMemo(
    () =>
      CATEGORY_ORDER.map((cat) => ({
        cat,
        items: filtered.filter((c) => categoryOf(c.id) === cat),
      })).filter((g) => g.items.length),
    [filtered],
  );

  const cfgFor = configId(sel);
  // A selection that no longer resolves (a renamed component, or stale persisted
  // state) falls back to the first entry rather than rendering an empty pane.
  const active = REGISTRY.find((c) => c.id === (cfgFor ?? sel)) ?? configurable[0] ?? REGISTRY[0];
  const showingConfig = !!cfgFor && !!active.config;

  return (
    <Box sx={{ flex: 1, minHeight: 0, display: 'flex' }}>
      {sidebarOpen && (
        <ViewNav
          title="Components"
          placeholder="Search components"
          query={query}
          onQueryChange={setQuery}
          groups={[
            {
              label: 'Configuration',
              items: configurable
                .filter((c) => matches(c, query))
                .map((c) => ({
                  id: `${CFG}${c.id}`,
                  label: c.name,
                  active: sel === `${CFG}${c.id}`,
                  onClick: () => setSel(`${CFG}${c.id}`),
                })),
            },
            ...grouped.map((g) => ({
              label: g.cat,
              items: g.items.map((c) => ({
                id: c.id,
                label: c.name,
                active: sel === c.id,
                onClick: () => setSel(c.id),
              })),
            })),
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
        {showingConfig ? (
          <ConfigEntry spec={active} />
        ) : (
          <ComponentEntry spec={active} clientId={clientId} />
        )}
      </Box>
    </Box>
  );
}

/**
 * One component's configuration across every client. The nav's search box
 * deliberately doesn't reach in here — it filters the index, and gutting the
 * open board while you search for a component name is just confusing.
 */
function ConfigEntry({ spec }: { spec: ComponentSpec }) {
  const groups = useMemo(() => boardGroups(spec.config!), [spec]);

  return (
    <>
      <ViewHeading
        title={`${spec.name} configuration`}
        subtitle="Figma _Config variables · one column per client"
      />
      <ConfigBoard groups={groups} />
    </>
  );
}

/** One component's playground, filling the pane. */
function ComponentEntry({ spec, clientId }: { spec: ComponentSpec; clientId: string }) {
  return (
    <>
      <ViewHeading title={spec.name} />

      <Stack direction="row" sx={{ alignItems: 'center', flexWrap: 'wrap', gap: 1, mb: 2 }}>
        <Chip label={spec.figmaNode} size="small" variant="soft" sx={{ fontFamily: 'monospace' }} />
        <Chip
          size="small"
          variant="soft"
          color={CONNECTED.has(spec.name) ? 'success' : 'default'}
          label={CONNECTED.has(spec.name) ? 'Code Connect · local' : 'Not mapped'}
        />
        {spec.config && (
          <Chip size="small" variant="soft" color="info" label="Has configuration" />
        )}
        {spec.figmaNode !== '—' && (
          <Link
            href={figmaUrl(spec.figmaNode)}
            target="_blank"
            rel="noreferrer"
            variant="body2"
            sx={{ ml: 'auto', display: 'inline-flex', alignItems: 'center', gap: 0.5 }}
          >
            <IcExternal size={15} /> Figma
          </Link>
        )}
      </Stack>

      <IconProvider value={clientById(clientId).iconBrand}>
        <Box className="ds-canvas" data-client={clientId}>
          <Card sx={{ p: 2.5 }}>
            <Playground spec={spec.playground} name={spec.name} />
          </Card>
        </Box>
      </IconProvider>
    </>
  );
}

const matches = (c: ComponentSpec, query: string) => {
  const q = query.toLowerCase().trim();
  return !q || c.name.toLowerCase().includes(q);
};

/** Filter components by a query over their names. */
function filterRegistry(registry: ComponentSpec[], query: string): ComponentSpec[] {
  return registry.filter((c) => matches(c, query));
}
