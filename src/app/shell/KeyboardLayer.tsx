import { useEffect } from 'react';
import { useStore, selectProjectState } from '../../studio/store';
import { loadedProject } from '../../studio/registry';
import { CLIENTS } from '../../config/clients';
import type { DeviceId } from '../../config/devices';

/**
 * Global keyboard shortcuts (renders nothing):
 *   ⌘K  command palette · ⌘\  toggle panel · Esc  exit present mode
 *   1/2/3  device · [ ]  cycle client · { }  cycle flow
 * Single-key shortcuts are ignored while typing or when the palette is open.
 */
const DEVICE_KEYS: Record<string, DeviceId> = { '1': 'desktop', '2': 'tablet', '3': 'mobile' };

export function KeyboardLayer() {
  useEffect(() => {
    const cycle = <T,>(list: T[], idx: number, dir: number) => list[(idx + dir + list.length) % list.length];

    const onKey = (e: KeyboardEvent) => {
      const s = useStore.getState();
      const meta = e.metaKey || e.ctrlKey;

      if (meta && (e.key === 'k' || e.key === 'K')) { e.preventDefault(); s.togglePalette(); return; }
      if (meta && e.key === '\\') { e.preventDefault(); s.toggleSidebar(); return; }
      if (e.key === 'Escape' && s.presentMode) { s.setPresent(false); return; }

      const el = e.target as HTMLElement | null;
      const typing = !!el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT' || el.isContentEditable);
      if (typing || s.paletteOpen || meta) return;

      if (e.key === '?') { s.toggleShortcuts(); return; }

      if (DEVICE_KEYS[e.key] && s.view !== 'components') { s.setDevice(DEVICE_KEYS[e.key]); return; }

      if (e.key === '[' || e.key === ']') {
        const i = CLIENTS.findIndex((c) => c.id === s.clientId);
        s.setClient(cycle(CLIENTS, i < 0 ? 0 : i, e.key === ']' ? 1 : -1).id);
        return;
      }
      if (e.key === '{' || e.key === '}') {
        const flows = loadedProject(s.projectId)?.flows ?? [];
        if (!flows.length) return;
        const i = flows.findIndex((f) => f.id === selectProjectState(s).flowId);
        s.setView('flows');
        s.setFlow(cycle(flows, i < 0 ? 0 : i, e.key === '}' ? 1 : -1).id);
        return;
      }
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return null;
}
