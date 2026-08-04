import type { ProjectDef, ProjectMeta } from './project';

/**
 * The project registry.
 *
 * A project is a folder under `src/projects/<id>/` with a `project.tsx` that
 * default-exports a `ProjectDef`, and a tiny `meta.ts` default-exporting its
 * `ProjectMeta`. The folder name IS the project id — nothing here needs editing
 * to add one.
 *
 * Metadata loads EAGERLY (it's a few lines per project) so the gallery can list
 * every project by name; definitions load lazily.
 *
 * Projects load lazily: a tester opening a live link downloads only the project
 * the URL names, and one project failing to build can't take the studio with it.
 * The trade-off is that a project isn't available synchronously, so the shell
 * gates on `useActiveProject()` and the store keeps per-project state keyed by id
 * rather than holding the definitions themselves.
 */

type ProjectModule = { default: ProjectDef };

const modules = import.meta.glob('../projects/*/project.tsx') as Record<
  string,
  () => Promise<ProjectModule>
>;

/** Project id (folder name) -> module loader. */
const loaders = new Map<string, () => Promise<ProjectModule>>();
for (const [path, load] of Object.entries(modules)) {
  const id = path.split('/').at(-2);
  if (id) loaders.set(id, load);
}

/** Every registered project id, without loading any of them. */
export const PROJECT_IDS: string[] = [...loaders.keys()].sort();

const metaModules = import.meta.glob('../projects/*/meta.ts', {
  eager: true,
  import: 'default',
}) as Record<string, ProjectMeta>;

const metas = new Map<string, ProjectMeta>();
for (const [path, meta] of Object.entries(metaModules)) {
  const id = path.split('/').at(-2);
  // The folder name is authoritative, so a mismatched `id` in meta.ts can't
  // desync the gallery from what actually loads.
  if (id) metas.set(id, { ...meta, id });
}

/** A project's card metadata. Falls back to the folder name if meta.ts is absent. */
export const projectMeta = (id: string): ProjectMeta => metas.get(id) ?? { id, name: id };

/** Every project's metadata, for the gallery — no definitions loaded. */
export const PROJECT_METAS: ProjectMeta[] = PROJECT_IDS.map(projectMeta);

export const DEFAULT_PROJECT_ID = PROJECT_IDS.includes('checkout')
  ? 'checkout'
  : PROJECT_IDS[0] ?? '';

export const isProjectId = (id: string): boolean => loaders.has(id);

const loaded = new Map<string, ProjectDef>();
const inflight = new Map<string, Promise<ProjectDef | undefined>>();

/**
 * A project's definition if it's already loaded, else undefined.
 * For synchronous callers — store actions, the keyboard layer — that run below
 * the shell's load gate and can therefore assume the active project is present.
 */
export const loadedProject = (id: string): ProjectDef | undefined => loaded.get(id);

/** Load a project by id. Idempotent, and de-duplicates concurrent calls. */
export function loadProject(id: string): Promise<ProjectDef | undefined> {
  const already = loaded.get(id);
  if (already) return Promise.resolve(already);

  const pending = inflight.get(id);
  if (pending) return pending;

  const load = loaders.get(id);
  if (!load) return Promise.resolve(undefined);

  const promise = load()
    .then((mod) => {
      const def = mod.default;
      if (def) loaded.set(id, def);
      inflight.delete(id);
      return def;
    })
    .catch((err) => {
      // One broken project shouldn't blank the studio — surface it and carry on.
      console.error(`[studio] failed to load project "${id}"`, err);
      inflight.delete(id);
      return undefined;
    });

  inflight.set(id, promise);
  return promise;
}
