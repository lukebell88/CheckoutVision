import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DEFAULT_CLIENT_ID } from '../config/clients';
import { DEFAULT_DEVICE_ID, deviceById, type DeviceId } from '../config/devices';
import {
  defaultHeaderConfigByClient,
  headerConfigForClient,
  type HeaderConfigState,
} from '../config/headerConfig';
import { DEFAULT_PROJECT_ID, loadedProject } from './registry';
import {
  flagsForFlow,
  flowById,
  flowScreens,
  mergeData,
  type FlagValues,
  type ProjectData,
  type ProjectDef,
  type StudioView,
} from './project';

export type StudioTheme = 'light' | 'dark';
export type { StudioView };

/**
 * The studio store.
 *
 * Two tiers, deliberately separated:
 *
 *   Studio  — brand, device, theme, layout, panels, design-system config. These
 *             are the designer's preferences and persist across every project.
 *   Project — flow, screen, progress, flags and data buffers. Namespaced under
 *             `byProject[id]` so switching projects never hands one project
 *             another's incompatible state.
 *
 * Nothing here knows what a checkout is: every project-shaped operation goes
 * through the ProjectDef contract. Because projects load lazily, the store holds
 * only their *state* — definitions come from the registry, and project actions
 * no-op until the project they target has loaded (the shell gates on that, so in
 * practice they never fire early).
 */

/** One project's runtime state. */
export interface ProjectState {
  flowId: string;
  screen: string;
  /** Screens the customer has advanced past via the normal progression. */
  completed: string[];
  flags: FlagValues;
  data: ProjectData;
  /** Selected variant group in the Pages view. */
  variantId: string;
}

interface StudioState {
  // --- Studio-level (shared by every project) ---
  clientId: string;
  device: DeviceId;
  theme: StudioTheme;
  view: StudioView;
  columns: number;
  sidebarOpen: boolean;
  /** Nav collapsed to icons-only (Minimal's "mini" variant). */
  navMini: boolean;
  /** Chrome-free stakeholder present mode. */
  presentMode: boolean;
  /** ⌘K command palette. */
  paletteOpen: boolean;
  /** Keyboard-shortcuts help overlay. */
  shortcutsOpen: boolean;
  /** When true, a single screen is shown as an interactive walkthrough. */
  focused: boolean;
  /** Header component configuration per client (mirrors Figma `_Config/Header/*`). */
  headerConfigByClient: Record<string, HeaderConfigState>;
  /**
   * What the Components view is showing — one entry at a time. A plain id is a
   * component; `cfg:<id>` is that component's per-client configuration board.
   */
  componentSel: string;

  // --- Project-level ---
  projectId: string;
  byProject: Record<string, ProjectState>;

  // Studio controls
  setClient: (id: string) => void;
  setDevice: (id: DeviceId) => void;
  setColumns: (n: number) => void;
  setTheme: (t: StudioTheme) => void;
  toggleTheme: () => void;
  setView: (v: StudioView) => void;
  setPalette: (v: boolean) => void;
  togglePalette: () => void;
  setPresent: (v: boolean) => void;
  togglePresent: () => void;
  setShortcuts: (v: boolean) => void;
  toggleShortcuts: () => void;
  toggleSidebar: () => void;
  toggleNavMini: () => void;
  setHeaderConfig: (id: string, value: boolean | string | number) => void;
  setHeaderConfigFor: (clientId: string, id: string, value: boolean | string | number) => void;
  setComponentSel: (sel: string) => void;

  // Project controls
  setProject: (id: string) => void;
  /** Seed a freshly-loaded project's state, if it doesn't have any yet. */
  ensureProject: (def: ProjectDef) => void;
  setFlow: (id: string) => void;
  setVariant: (id: string) => void;
  goToScreen: (id: string) => void;
  openFocus: (id: string) => void;
  closeFocus: () => void;
  next: () => void;
  back: () => void;
  toggleFlag: (id: string) => void;
  setFlag: (id: string, value: boolean) => void;
  setFlags: (flags: FlagValues) => void;
  patchData: (bucket: string, values: Record<string, unknown>) => void;

  /** Restore the active project to its defaults. Studio preferences are kept. */
  reset: () => void;
}

/** A project's opening state: its first flow, that flow's flags and prefill. */
export function initialProjectState(project: ProjectDef): ProjectState {
  const flow = project.flows[0];
  if (!flow) {
    return { flowId: '', screen: '', completed: [], flags: {}, data: {}, variantId: '' };
  }
  const flags = flagsForFlow(project, flow);
  return {
    flowId: flow.id,
    screen: flowScreens(flow, flags)[0]?.id ?? '',
    completed: [],
    flags,
    data: mergeData({}, flow.prefill),
    variantId: project.variants?.[0]?.id ?? '',
  };
}

/**
 * Apply a new flag state, keeping the current screen if it survives the change
 * and otherwise falling back to the flow's first screen. A flag can gate a
 * screen out of the journey (see flowScreens), so toggling one while sitting on
 * that screen would otherwise strand the view on a screen no longer in the flow.
 */
function withFlags(project: ProjectDef, ps: ProjectState, flags: FlagValues) {
  const screens = flowScreens(flowById(project, ps.flowId), flags);
  const screen = screens.some((s) => s.id === ps.screen) ? ps.screen : (screens[0]?.id ?? '');
  return { flags, screen };
}

/** Stable empty slice, so selectors never return a fresh object. */
const EMPTY_PROJECT_STATE: ProjectState = {
  flowId: '',
  screen: '',
  completed: [],
  flags: {},
  data: {},
  variantId: '',
};

function initialState() {
  return {
    clientId: DEFAULT_CLIENT_ID,
    device: DEFAULT_DEVICE_ID,
    theme: 'dark' as StudioTheme,
    view: 'flows' as StudioView,
    columns: deviceById(DEFAULT_DEVICE_ID).defaultColumns,
    sidebarOpen: true,
    navMini: false,
    presentMode: false,
    paletteOpen: false,
    shortcutsOpen: false,
    focused: false,
    headerConfigByClient: defaultHeaderConfigByClient(),
    // The Components view opens on the Configuration section that sits above
    // the component list, not on a component.
    componentSel: 'cfg:header',
    projectId: DEFAULT_PROJECT_ID,
    byProject: {} as Record<string, ProjectState>,
  };
}

export const useStore = create<StudioState>()(
  persist(
    (set, get) => {
      /** Update the active project's slice. No-ops if the project isn't loaded. */
      const patch = (fn: (ps: ProjectState) => Partial<ProjectState>) =>
        set((s) => {
          const current = s.byProject[s.projectId];
          if (!current) return {};
          return { byProject: { ...s.byProject, [s.projectId]: { ...current, ...fn(current) } } };
        });

      /** The active project's definition + slice, if both are available. */
      const active = () => {
        const s = get();
        const project = loadedProject(s.projectId);
        const ps = s.byProject[s.projectId];
        return project && ps ? { project, ps } : null;
      };

      return {
        ...initialState(),

        // --- Studio: brand & device never discard entered data ---
        setClient: (id) => set({ clientId: id }),
        setDevice: (id) => set({ device: id, columns: deviceById(id).defaultColumns }),
        setColumns: (n) => set({ columns: n }),
        setTheme: (t) => set({ theme: t }),
        toggleTheme: () => set((s) => ({ theme: s.theme === 'dark' ? 'light' : 'dark' })),
        setView: (v) => set({ view: v }),
        setPalette: (v) => set({ paletteOpen: v }),
        togglePalette: () => set((s) => ({ paletteOpen: !s.paletteOpen })),
        setPresent: (v) => set({ presentMode: v }),
        togglePresent: () => set((s) => ({ presentMode: !s.presentMode })),
        setShortcuts: (v) => set({ shortcutsOpen: v }),
        toggleShortcuts: () => set((s) => ({ shortcutsOpen: !s.shortcutsOpen })),
        toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
        toggleNavMini: () => set((s) => ({ navMini: !s.navMini })),

        setHeaderConfig: (id, value) =>
          set((s) => {
            const current = s.headerConfigByClient[s.clientId] ?? headerConfigForClient(s.clientId);
            return {
              headerConfigByClient: {
                ...s.headerConfigByClient,
                [s.clientId]: { ...current, [id]: value },
              },
            };
          }),
        setHeaderConfigFor: (clientId, id, value) =>
          set((s) => {
            const current = s.headerConfigByClient[clientId] ?? headerConfigForClient(clientId);
            return {
              headerConfigByClient: {
                ...s.headerConfigByClient,
                [clientId]: { ...current, [id]: value },
              },
            };
          }),

        setComponentSel: (sel) => set({ componentSel: sel }),

        // --- Project selection ---
        setProject: (id) => set({ projectId: id, focused: false }),

        ensureProject: (def) =>
          set((s) => {
            if (s.byProject[def.id]) return {};
            return { byProject: { ...s.byProject, [def.id]: initialProjectState(def) } };
          }),

        // --- Flow change: reset only the state that is no longer valid ---
        setFlow: (id) => {
          const a = active();
          if (!a) return;
          const flow = flowById(a.project, id);
          const flags = flagsForFlow(a.project, flow);
          const screens = flowScreens(flow, flags);
          const valid = new Set(screens.map((s) => s.id));
          set({ focused: false });
          patch((ps) => ({
            flowId: flow.id,
            screen: screens[0]?.id ?? '',
            completed: ps.completed.filter((s) => valid.has(s)),
            flags,
            // Prefill wins over entered data so the presented scenario is coherent.
            data: mergeData(ps.data, flow.prefill),
          }));
        },

        setVariant: (id) => patch(() => ({ variantId: id })),

        // --- Navigation ---
        // Screen ids arrive from live links as well as from UI, so an id that
        // isn't in the current flow is ignored rather than written. Persisting
        // one would brick every later load: projects index their screens by id
        // and the shell renders before a link's scenario is applied.
        goToScreen: (id) => {
          const a = active();
          if (!a) return;
          const screens = flowScreens(flowById(a.project, a.ps.flowId), a.ps.flags);
          if (!screens.some((s) => s.id === id)) return;
          patch(() => ({ screen: id }));
        },
        openFocus: (id) => {
          get().goToScreen(id);
          set({ focused: true });
        },
        closeFocus: () => set({ focused: false }),
        next: () => {
          const a = active();
          if (!a) return;
          const screens = flowScreens(flowById(a.project, a.ps.flowId), a.ps.flags);
          const idx = screens.findIndex((s) => s.id === a.ps.screen);
          if (idx < 0 || idx >= screens.length - 1) return;
          patch((ps) => ({
            screen: screens[idx + 1].id,
            completed: ps.completed.includes(ps.screen) ? ps.completed : [...ps.completed, ps.screen],
          }));
        },
        back: () => {
          const a = active();
          if (!a) return;
          const screens = flowScreens(flowById(a.project, a.ps.flowId), a.ps.flags);
          const idx = screens.findIndex((s) => s.id === a.ps.screen);
          if (idx <= 0) return;
          patch(() => ({ screen: screens[idx - 1].id }));
        },

        // --- Flags & data buffers ---
        // A flag can gate a screen out of the journey, so re-clamp the current
        // screen whenever flags change (see withFlags).
        toggleFlag: (id) => {
          const a = active();
          if (!a) return;
          patch((ps) => withFlags(a.project, ps, { ...ps.flags, [id]: !ps.flags[id] }));
        },
        setFlag: (id, value) => {
          const a = active();
          if (!a) return;
          patch((ps) => withFlags(a.project, ps, { ...ps.flags, [id]: value }));
        },
        setFlags: (flags) => {
          const a = active();
          if (!a) return;
          patch((ps) => withFlags(a.project, ps, flags));
        },
        patchData: (bucket, values) =>
          patch((ps) => ({ data: { ...ps.data, [bucket]: { ...(ps.data[bucket] ?? {}), ...values } } })),

        reset: () =>
          set((s) => {
            const def = loadedProject(s.projectId);
            if (!def) return {};
            return { byProject: { ...s.byProject, [s.projectId]: initialProjectState(def) } };
          }),
      };
    },
    {
      name: 'studio-state',
      version: 2,
      /**
       * v1 → v2 changed only WHEN `byProject` slices are created (eagerly for
       * every project, vs. seeded as each project loads). The persisted shape is
       * identical, so v1 state carries over untouched — without this, zustand
       * discards it and the designer silently loses their scenario.
       */
      migrate: (persisted) => persisted as StudioState,
      // Don't persist transient overlay UI — a reload shouldn't restore these.
      partialize: (s) => {
        const rest = { ...s } as Record<string, unknown>;
        delete rest.paletteOpen;
        delete rest.presentMode;
        delete rest.shortcutsOpen;
        delete rest.focused;
        return rest as unknown as StudioState;
      },
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<StudioState>;
        return {
          ...current,
          ...p,
          byProject: { ...current.byProject, ...(p.byProject ?? {}) },
        };
      },
    },
  ),
);

// --- Selectors ---------------------------------------------------------------

/**
 * The active project's state. Returns a stable empty slice before the project
 * has loaded — shell views render below the load gate, so they never see it.
 */
export const selectProjectState = (s: StudioState): ProjectState =>
  s.byProject[s.projectId] ?? EMPTY_PROJECT_STATE;

export const selectHeaderConfig = (s: StudioState): HeaderConfigState =>
  s.headerConfigByClient[s.clientId] ?? headerConfigForClient(s.clientId);
