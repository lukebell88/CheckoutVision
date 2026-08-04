import { useEffect, useMemo, useRef, useState } from 'react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import ButtonBase from '@mui/material/ButtonBase';
import InputBase from '@mui/material/InputBase';
import Typography from '@mui/material/Typography';

import { useStore, selectProjectState } from '../../studio/store';
import { useProjectOptional } from '../../studio/runtime';
import { PROJECT_METAS } from '../../studio/registry';
import { CLIENTS } from '../../config/clients';
import { DEVICES, type DeviceId } from '../../config/devices';
import { REGISTRY } from '../components-view/registry';

interface Cmd {
  id: string;
  label: string;
  section: string;
  hint?: string;
  run: () => void;
}

/** ⌘K command palette — jump to any view/flow/page/client/component/flag. */
export function CommandPalette() {
  const open = useStore((s) => s.paletteOpen);
  const setPalette = useStore((s) => s.setPalette);
  // Null in the gallery, where the palette still works for switching project.
  const project = useProjectOptional();
  const flags = useStore(selectProjectState).flags;

  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const close = () => setPalette(false);
  const go = (fn: () => void) => {
    fn();
    close();
  };

  const commands = useMemo<Cmd[]>(() => {
    const s = useStore.getState;
    // The Components view shows one entry at a time, so a component command
    // selects it rather than scrolling to an anchor.
    const openComponent = (sel: string) => {
      s().setComponentSel(sel);
      s().setView('components');
    };
    return [
      // Views
      { id: 'v-projects', label: 'All projects', section: 'View', run: () => s().setView('projects') },
      { id: 'v-flows', label: 'Prototype', section: 'View', run: () => s().setView('flows') },
      { id: 'v-pages', label: 'Pages', section: 'View', run: () => s().setView('pages') },
      { id: 'v-components', label: 'Components', section: 'View', run: () => s().setView('components') },
      // Projects — always available, and the only commands the gallery needs.
      ...PROJECT_METAS.map((m) => ({
        id: `proj-${m.id}`,
        label: m.name,
        section: 'Project',
        hint: m.id === s().projectId ? 'active' : undefined,
        run: () => {
          s().setProject(m.id);
          s().setView('flows');
        },
      })),
      // Devices
      ...DEVICES.map((d) => ({
        id: `d-${d.id}`,
        label: `${d.name} preview`,
        section: 'Device',
        hint: `${d.width}×${d.height}`,
        run: () => s().setDevice(d.id as DeviceId),
      })),
      // Clients
      ...CLIENTS.map((c) => ({
        id: `c-${c.id}`,
        label: c.name,
        section: 'Client',
        run: () => s().setClient(c.id),
      })),
      // Flows
      ...(project?.flows ?? []).map((f) => ({
        id: `f-${f.id}`,
        label: f.name,
        section: 'Flow',
        run: () => {
          s().setView('flows');
          s().setFlow(f.id);
        },
      })),
      // Variant groups
      ...(project?.variants ?? []).map((g) => ({
        id: `pg-${g.id}`,
        label: g.name,
        section: 'Page',
        hint: `${g.versions.length} versions`,
        run: () => {
          s().setView('pages');
          s().setVariant(g.id);
        },
      })),
      // Components
      ...REGISTRY.map((c) => ({
        id: `cmp-${c.id}`,
        label: c.name,
        section: 'Component',
        run: () => openComponent(c.id),
      })),
      // Component configuration boards
      ...REGISTRY.filter((c) => c.config).map((c) => ({
        id: `cmpcfg-${c.id}`,
        label: `${c.name} configuration`,
        section: 'Component',
        hint: 'all clients',
        run: () => openComponent(`cfg:${c.id}`),
      })),
      // Flags
      ...(project?.flags ?? []).map((fl) => ({
        id: `fl-${fl.id}`,
        label: `Toggle ${fl.name}`,
        section: 'Flag',
        hint: flags[fl.id] ? 'on' : 'off',
        run: () => s().toggleFlag(fl.id),
      })),
      // Actions
      { id: 'a-present', label: 'Present mode', section: 'Action', hint: 'hide chrome', run: () => s().setPresent(true) },
      { id: 'a-theme', label: 'Toggle light / dark', section: 'Action', run: () => s().toggleTheme() },
      { id: 'a-panel', label: 'Toggle side panel', section: 'Action', run: () => s().toggleSidebar() },
      { id: 'a-reset', label: 'Reset prototype', section: 'Action', run: () => s().reset() },
    ];
  }, [flags, project]);

  const results = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return commands;
    return commands.filter(
      (c) => c.label.toLowerCase().includes(q) || c.section.toLowerCase().includes(q) || c.hint?.toLowerCase().includes(q),
    );
  }, [commands, query]);

  useEffect(() => {
    if (open) {
      setQuery('');
      setActive(0);
      setTimeout(() => inputRef.current?.focus(), 20);
    }
  }, [open]);

  useEffect(() => setActive(0), [query]);

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const cmd = results[active];
      if (cmd) go(cmd.run);
    }
    // Escape is handled by Dialog's onClose.
  };

  return (
    <Dialog
      open={open}
      onClose={close}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: { sx: { mt: '12vh', alignSelf: 'flex-start', maxHeight: '66vh' } },
      }}
    >
      <InputBase
        inputRef={inputRef}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={onKey}
        placeholder="Jump to a view, project, client, flow, page, component or flag…"
        sx={{
          px: 2.25,
          py: 2,
          fontSize: 15,
          borderBottom: (t) => `1px solid ${t.vars.palette.divider}`,
        }}
      />

      <Box sx={{ overflowY: 'auto', p: 0.75 }}>
        {results.length === 0 && (
          <Typography variant="body2" sx={{ color: 'text.disabled', textAlign: 'center', py: 2.5 }}>
            No matches
          </Typography>
        )}

        {results.map((c, i) => (
          <ButtonBase
            key={c.id}
            onMouseEnter={() => setActive(i)}
            onClick={() => go(c.run)}
            sx={{
              width: 1,
              gap: 1.5,
              px: 1.5,
              py: 1.125,
              borderRadius: 1,
              justifyContent: 'flex-start',
              bgcolor: i === active ? 'action.selected' : 'transparent',
            }}
          >
            <Chip
              label={c.section}
              size="small"
              variant="outlined"
              sx={{ minWidth: 78, fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}
            />
            <Typography variant="body2" sx={{ flex: 1, textAlign: 'left' }} noWrap>
              {c.label}
            </Typography>
            {c.hint && (
              <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                {c.hint}
              </Typography>
            )}
          </ButtonBase>
        ))}
      </Box>
    </Dialog>
  );
}
