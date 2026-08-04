import { createContext, useContext, type ReactNode } from 'react';
import type { ProjectDef, ProjectRuntime } from './project';

/**
 * The two contexts that carry a project through the shell.
 *
 * `ProjectContext`  — which project is active. Set once, near the app root, so
 *                     every shell view (canvas, sidebars, palette) reads flows,
 *                     screens and flags from the contract rather than importing
 *                     a project's config.
 *
 * `RuntimeContext`  — the flags/data/nav for ONE rendered instance. The canvas
 *                     mounts many instances of the same screen with different
 *                     runtimes (the Pages view's variants), so this is provided
 *                     per frame, not per app.
 */

const ProjectContext = createContext<ProjectDef | null>(null);
const RuntimeContext = createContext<ProjectRuntime | null>(null);

export function ProjectProvider({ project, children }: { project: ProjectDef; children: ReactNode }) {
  return <ProjectContext.Provider value={project}>{children}</ProjectContext.Provider>;
}

/** The active project. Throws outside a provider — that's a wiring bug, not a state. */
export function useProject(): ProjectDef {
  const project = useContext(ProjectContext);
  if (!project) throw new Error('useProject() called outside a <ProjectProvider>');
  return project;
}

/**
 * The active project, or null. For the few things that render ABOVE the load
 * gate and must work with no project open — the gallery and the ⌘K palette.
 */
export function useProjectOptional(): ProjectDef | null {
  return useContext(ProjectContext);
}

export function RuntimeProvider({ runtime, children }: { runtime: ProjectRuntime; children: ReactNode }) {
  return <RuntimeContext.Provider value={runtime}>{children}</RuntimeContext.Provider>;
}

/**
 * The runtime for the surrounding rendered instance. Every path that renders a
 * project (canvas frame, focus mode, live link) provides one, so a project never
 * needs to reach for the studio store.
 */
export function useProjectRuntime(): ProjectRuntime {
  const runtime = useContext(RuntimeContext);
  if (!runtime) throw new Error('useProjectRuntime() called outside a <RuntimeProvider>');
  return runtime;
}

/**
 * Render the active project into a runtime.
 *
 * Every render path goes through this one component so the provider and the
 * `render()` call can never drift apart. It must stay module-level: defining it
 * inside a view would remount the project on each render and reset any state the
 * screens hold (selected options, typed fields).
 */
export function RenderedProject({ runtime }: { runtime: ProjectRuntime }) {
  const project = useProject();
  return <RuntimeProvider runtime={runtime}>{project.render(runtime)}</RuntimeProvider>;
}

/** Navigation that does nothing — used by inert canvas frames. */
export const INERT_NAV = {
  next: () => {},
  back: () => {},
  goTo: () => {},
  patch: () => {},
};
