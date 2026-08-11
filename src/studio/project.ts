import type { ReactNode } from 'react';
import type { ClientDef } from '../config/clients';

/**
 * The project contract — the whole surface between the studio and a prototype.
 *
 * The studio hosts many projects; checkout is one. Nothing in the studio may
 * import a project directly. If the shell needs to know something about the
 * thing it is rendering, that knowledge belongs on `ProjectDef` — a missing
 * field here is the only correct reason for the shell to reach sideways.
 *
 * Platform concerns (brands, devices, the Fabric component library, the design
 * system config boards) are NOT part of this contract: they are shared by every
 * project and live under src/config and src/components.
 */

/** Views that render a project's own content. */
export type ProjectView = 'flows' | 'pages';

/**
 * Every view the studio can show. `components` and `config` are platform-level
 * (the Fabric library and its configuration); `projects` is the gallery, which
 * sits above projects entirely and renders without loading any of them.
 */
export type StudioView = ProjectView | 'components' | 'config' | 'projects';

/**
 * Card-level metadata for a project, in its own `meta.ts` so the studio can list
 * every project — names, descriptions — WITHOUT loading any of them. Loading all
 * the definitions just to render a gallery would defeat the lazy registry.
 */
export interface ProjectMeta {
  /** Must match the folder name; the registry enforces this. */
  id: string;
  name: string;
  description?: string;
}

/** One screen a project can render. */
export interface ScreenDef {
  id: string;
  /** Customer-facing title. */
  title: string;
  /** Short label for step lists and frame captions. */
  navLabel: string;
  /** Terminal screens end a journey — no "continue" action leaves them. */
  terminal?: boolean;
}

/**
 * A screen is present in a journey only while its `when` flag holds the given
 * value. This is how a flag can add or remove a whole screen — e.g. the
 * email-first checkout drops the standalone sign-in page when its flag is on.
 * Absent means "always present".
 */
export interface FlagCondition {
  flag: string;
  is: boolean;
}

/** A screen's slot within a flow. */
export interface FlowScreen {
  id: string;
  /** Optional screens can be skipped in the customer-facing progression. */
  optional?: boolean;
  /** Gate this screen's presence on a flag — absent means always present. */
  when?: FlagCondition;
}

/**
 * Project data is opaque to the studio: it carries the buckets, namespaces them
 * per project and hands them back at render time, but never reads inside one.
 * Each project casts to its own typed shape at its boundary.
 */
export type ProjectData = { [bucket: string]: Record<string, unknown> | undefined };

/** Flag state, keyed by flag id. Projects narrow this to their own union. */
export type FlagValues = Record<string, boolean>;

/**
 * Choice state, keyed by choice id. A choice is an ENUM control — the multi-way
 * counterpart to a boolean flag, for a setting whose options are mutually
 * exclusive (e.g. how the payment step is presented). Projects narrow this to
 * their own unions, exactly as they do with flags.
 */
export type ChoiceValues = Record<string, string>;

/** A journey: an ordered subset of screens plus the state it presents. */
export interface ProjectFlow {
  id: string;
  name: string;
  description: string;
  screens: FlowScreen[];
  /** Applied on top of the flag defaults when this flow is selected. */
  flagOverrides?: FlagValues;
  /** Applied on top of the choice defaults when this flow is selected. */
  choiceOverrides?: ChoiceValues;
  /** Seed data merged into the data buckets when this flow is selected. */
  prefill?: ProjectData;
}

/** A feature flag the project exposes to the studio's flag controls. */
export interface ProjectFlag {
  id: string;
  name: string;
  description: string;
  /** Free-form grouping label used by the sidebar and Config board. */
  group: string;
  default: boolean;
}

/** One selectable value of a ProjectChoice. */
export interface ChoiceOption {
  value: string;
  label: string;
}

/**
 * An enum control the project exposes to the studio — the multi-way counterpart
 * to ProjectFlag. The scenario tray and any sidebar render these generically, so
 * the studio never needs to know what the options mean.
 */
export interface ProjectChoice {
  id: string;
  name: string;
  description: string;
  /** Free-form grouping label. */
  group: string;
  options: ChoiceOption[];
  default: string;
}

/** One variant of a single screen (an error state, a payment type, …). */
export interface Variant {
  id: string;
  label: string;
  flags?: FlagValues;
  data?: ProjectData;
  note?: string;
}

/** A screen shown in several variants side by side in the Pages view. */
export interface VariantGroup {
  id: string;
  name: string;
  screen: string;
  description?: string;
  versions: Variant[];
}

/** Navigation and data actions handed to a rendered screen. */
export interface ProjectNav {
  next(): void;
  back(): void;
  goTo(screen: string): void;
  patch(bucket: string, values: Record<string, unknown>): void;
}

/**
 * Everything a project needs to render one screen. The studio builds this and
 * provides it via context, so a project never reads the studio store.
 */
export interface ProjectRuntime {
  /** The screen to render. */
  screen: string;
  /** Ordered screens of the active flow — for progress indicators. */
  screens: FlowScreen[];
  /** Screens already advanced past. */
  completed: string[];
  flags: FlagValues;
  /** Enum-control state, keyed by choice id. */
  choices: ChoiceValues;
  data: ProjectData;
  /** The active brand. */
  brand: ClientDef;
  /** False in the canvas gallery: render actions, but inert. */
  interactive: boolean;
  /** No-ops when `interactive` is false. */
  nav: ProjectNav;
}

/**
 * A prototype hosted by the studio. Extends its own `ProjectMeta` so the card
 * fields have a single source of truth — `project.tsx` spreads its `meta.ts`.
 */
export interface ProjectDef extends ProjectMeta {
  /** Which project-scoped views this project supports. */
  views: ProjectView[];
  screens: Record<string, ScreenDef>;
  flows: ProjectFlow[];
  flags: ProjectFlag[];
  /** Enum controls, surfaced by the studio and the scenario tray. */
  choices?: ProjectChoice[];
  variants?: VariantGroup[];
  /**
   * Render one screen. Simple projects can read the passed runtime directly;
   * projects with nested components read it from context via useProjectRuntime.
   */
  render(rt: ProjectRuntime): ReactNode;
}

// --- Lookups -----------------------------------------------------------------

export const screenDef = (project: ProjectDef, id: string): ScreenDef =>
  project.screens[id] ?? { id, title: id, navLabel: id };

export const flowById = (project: ProjectDef, id: string): ProjectFlow =>
  project.flows.find((f) => f.id === id) ?? project.flows[0];

/**
 * A flow's screens filtered to those whose `when` condition holds under the
 * given flag state. Every consumer that walks a flow's screens — navigation,
 * the canvas, the focus stepper — goes through this so a flag-gated screen is
 * uniformly absent: unreachable by next/back, unrendered in the canvas.
 */
export const flowScreens = (flow: ProjectFlow, flags: FlagValues): FlowScreen[] =>
  flow.screens.filter((s) => !s.when || flags[s.when.flag] === s.when.is);

export const variantGroupById = (project: ProjectDef, id: string): VariantGroup | undefined =>
  project.variants?.find((g) => g.id === id) ?? project.variants?.[0];

/** Baseline flag state from the project's declared defaults. */
export const defaultFlags = (project: ProjectDef): FlagValues =>
  project.flags.reduce<FlagValues>((acc, f) => ({ ...acc, [f.id]: f.default }), {});

/** Flag defaults with a flow's overrides applied. */
export const flagsForFlow = (project: ProjectDef, flow: ProjectFlow): FlagValues => ({
  ...defaultFlags(project),
  ...(flow.flagOverrides ?? {}),
});

/** Baseline choice state from the project's declared defaults. */
export const defaultChoices = (project: ProjectDef): ChoiceValues =>
  (project.choices ?? []).reduce<ChoiceValues>((acc, c) => ({ ...acc, [c.id]: c.default }), {});

/** Choice defaults with a flow's overrides applied. */
export const choicesForFlow = (project: ProjectDef, flow: ProjectFlow): ChoiceValues => ({
  ...defaultChoices(project),
  ...(flow.choiceOverrides ?? {}),
});

/** Merge a flow's prefill over existing data (prefill wins, so the scenario is coherent). */
export function mergeData(base: ProjectData, prefill: ProjectData | undefined): ProjectData {
  if (!prefill) return base;
  const out: ProjectData = { ...base };
  for (const [bucket, values] of Object.entries(prefill)) {
    out[bucket] = { ...(base[bucket] ?? {}), ...values };
  }
  return out;
}
