import { useMemo } from 'react';
import { clientById } from '../config/clients';
import { useStore, selectProjectState } from './store';
import { INERT_NAV, useProject } from './runtime';
import { defaultFlags, flowById, flowScreens, mergeData, type ProjectRuntime, type Variant } from './project';

/**
 * Runtime builders.
 *
 * Every path that renders a project needs a `ProjectRuntime`. There are two
 * sources for one:
 *
 *   useStoreRuntime   — flags and data come from the live store. Used by the
 *                       flows canvas (inert), focus mode and live links.
 *   useVariantRuntime — flags and data come from a Pages-view variant, so the
 *                       same screen can be rendered many ways side by side.
 */

/** A runtime backed by the active project's live store state. */
export function useStoreRuntime(screen: string, interactive: boolean): ProjectRuntime {
  const project = useProject();
  const ps = useStore(selectProjectState);
  const clientId = useStore((s) => s.clientId);
  const next = useStore((s) => s.next);
  const back = useStore((s) => s.back);
  const goToScreen = useStore((s) => s.goToScreen);
  const patchData = useStore((s) => s.patchData);

  return useMemo(() => {
    const flow = flowById(project, ps.flowId);
    return {
      screen,
      screens: flowScreens(flow, ps.flags),
      completed: ps.completed,
      flags: ps.flags,
      data: ps.data,
      brand: clientById(clientId),
      interactive,
      nav: interactive ? { next, back, goTo: goToScreen, patch: patchData } : INERT_NAV,
    };
  }, [project, ps, clientId, screen, interactive, next, back, goToScreen, patchData]);
}

/** A runtime for one variant of a screen — always inert. */
export function useVariantRuntime(screen: string, variant: Variant): ProjectRuntime {
  const project = useProject();
  const clientId = useStore((s) => s.clientId);
  const ps = useStore(selectProjectState);

  return useMemo(() => {
    const flow = flowById(project, ps.flowId);
    const flags = { ...defaultFlags(project), ...(variant.flags ?? {}) };
    return {
      screen,
      screens: flowScreens(flow, flags),
      completed: [],
      flags,
      data: mergeData({}, variant.data),
      brand: clientById(clientId),
      interactive: false,
      nav: INERT_NAV,
    };
  }, [project, ps.flowId, clientId, screen, variant]);
}
