import { useEffect, useState } from 'react';
import { useStore } from './store';
import { loadProject, loadedProject } from './registry';
import type { ProjectDef } from './project';

/**
 * The shell's load gate.
 *
 * Loads whichever project is active, seeds its state on first sight, and returns
 * null until it's ready. Everything rendered below this can assume both the
 * definition and its state exist — which is what lets the rest of the shell stay
 * synchronous despite projects being lazily loaded.
 */
export function useActiveProject(): { project: ProjectDef | null; failed: boolean } {
  const projectId = useStore((s) => s.projectId);
  const ensureProject = useStore((s) => s.ensureProject);
  const [project, setProject] = useState<ProjectDef | null>(() => loadedProject(projectId) ?? null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let alive = true;
    const apply = (def: ProjectDef) => {
      if (!alive) return;
      ensureProject(def);
      setProject(def);
      setFailed(false);
    };

    const already = loadedProject(projectId);
    if (already) {
      apply(already);
      return () => {
        alive = false;
      };
    }

    setProject(null);
    setFailed(false);
    loadProject(projectId).then((def) => {
      if (!alive) return;
      if (def) apply(def);
      else setFailed(true);
    });

    return () => {
      alive = false;
    };
  }, [projectId, ensureProject]);

  return { project, failed };
}
