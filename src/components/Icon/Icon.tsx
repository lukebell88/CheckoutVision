import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import './Icon.css';

/**
 * Icon — renders any SVG from the /iconography folder inline, so it inherits the
 * surrounding text/icon colour via `currentColor` (white on a contained button,
 * the brand colour on an outlined one, etc.). This is what lets Button and
 * IconButton swap in any icon from the set and have it colour correctly.
 *
 * Resolution is brand-aware:
 *   ui      → iconography/user-interface/<brand>/<name>-<variant>.svg
 *   feature → iconography/feature/<brand>/<name>-<variant>.svg
 *   common  → iconography/common/<group>/<name>.svg   (brand passed as group)
 * with a fallback to the NEXT set so a partially-populated brand never breaks.
 *
 * Loading is per FOLDER, on demand. Inlining every icon eagerly cost ~1.4 MB
 * (625 KB gzipped — two thirds of the whole bundle) to ship ten brands plus a
 * 750 KB payment-logo set to every visitor. Now `IconProvider` preloads just the
 * active brand's two folders, and anything outside them loads on first use.
 * `vite.config.ts` groups each folder into one chunk, so a folder is one request.
 */

// path -> loader. NOT eager: each folder becomes its own chunk (see manualChunks).
const loaders = import.meta.glob('../../../iconography/**/*.svg', {
  query: '?raw',
  import: 'default',
}) as Record<string, () => Promise<string>>;

type Category = 'ui' | 'feature' | 'common';
const DIR: Record<Category, string> = {
  ui: 'user-interface',
  feature: 'feature',
  common: 'common',
};
const FALLBACK_BRAND = 'next';

/** folder key = `<dir>/<brand-or-group>`, e.g. "feature/next", "common/payment". */
const byFolder = new Map<string, Map<string, () => Promise<string>>>();
for (const [path, load] of Object.entries(loaders)) {
  const parts = path.split('/');
  const file = parts.pop()!.replace('.svg', '');
  const group = parts.pop()!;
  const dir = parts.pop()!;
  const key = `${dir}/${group}`;
  let folder = byFolder.get(key);
  if (!folder) {
    folder = new Map();
    byFolder.set(key, folder);
  }
  folder.set(file, load);
}

/** Loaded folders: folder key -> (icon name -> cleaned markup). */
const cache = new Map<string, Map<string, string>>();
const inflight = new Map<string, Promise<void>>();

/** Strip the fixed width/height and force `fill=currentColor` so it recolours.
 * Paths authored without a `fill` inherit it; multi-colour icons keep theirs. */
function clean(svg: string): string {
  return svg
    .replace(/\swidth="[^"]*"/, '')
    .replace(/\sheight="[^"]*"/, '')
    .replace('<svg', '<svg fill="currentColor"');
}

/** Load one folder's icons. Idempotent, and de-duplicates concurrent calls. */
function loadFolder(key: string): Promise<void> {
  if (cache.has(key)) return Promise.resolve();
  const existing = inflight.get(key);
  if (existing) return existing;

  const folder = byFolder.get(key);
  if (!folder) {
    // No such folder (e.g. a brand with no feature icons) — cache the miss so we
    // don't retry on every render.
    cache.set(key, new Map());
    return Promise.resolve();
  }

  const pending = Promise.all(
    [...folder].map(async ([name, load]) => [name, clean(await load())] as const),
  ).then((pairs) => {
    cache.set(key, new Map(pairs));
    inflight.delete(key);
  });
  inflight.set(key, pending);
  return pending;
}

/** The folders a lookup may touch, brand first then the NEXT fallback. */
function foldersFor(category: Category | undefined, brand: string): string[] {
  const cats: Category[] = category ? [category] : ['ui', 'feature'];
  const keys: string[] = [];
  for (const c of cats) {
    keys.push(`${DIR[c]}/${brand}`);
    if (brand !== FALLBACK_BRAND) keys.push(`${DIR[c]}/${FALLBACK_BRAND}`);
  }
  return keys;
}

/**
 * Active icon brand. Kept as a plain string context — `Logotype` and others read
 * it directly. The load signal is a separate context so this contract is stable.
 */
export const IconBrandContext = createContext<string>(FALLBACK_BRAND);

/** Bumped whenever a folder finishes loading, to re-render mounted icons. */
const IconReadyContext = createContext<number>(0);

/**
 * Provides the icon brand and preloads that brand's icon folders, so everything
 * inside renders without a flash once the (single, per-folder) request lands.
 */
export function IconProvider({ value, children }: { value: string; children: ReactNode }) {
  const [ready, setReady] = useState(0);

  useEffect(() => {
    let alive = true;
    const keys = [...foldersFor('ui', value), ...foldersFor('feature', value)];
    if (keys.every((k) => cache.has(k))) return; // already loaded — no re-render
    Promise.all(keys.map(loadFolder)).then(() => {
      if (alive) setReady((n) => n + 1);
    });
    return () => {
      alive = false;
    };
  }, [value]);

  return (
    <IconBrandContext.Provider value={value}>
      <IconReadyContext.Provider value={ready}>{children}</IconReadyContext.Provider>
    </IconBrandContext.Provider>
  );
}

function resolve(category: Category, brand: string, name: string, variant: string): string | undefined {
  const dir = DIR[category];
  const key = `${name}-${variant}`;
  const brandFolder = cache.get(`${dir}/${brand}`);
  const fallbackFolder = cache.get(`${dir}/${FALLBACK_BRAND}`);
  return (
    brandFolder?.get(key) ??
    fallbackFolder?.get(key) ??
    brandFolder?.get(name) ??
    fallbackFolder?.get(name)
  );
}

export interface IconProps {
  /** Logical icon name, e.g. "bag", "check", "chevron-right", "delivery". */
  name: string;
  /** Where to look. Omit to search ui → feature. Use "common" for shared sets. */
  category?: Category;
  /** Brand/group override. Defaults to the active IconBrandContext. */
  brand?: string;
  /** Size/state suffix, e.g. "m-default", "m-active", "s-default". */
  variant?: string;
  /** Rendered box size in px (default 24). */
  size?: number;
  className?: string;
  /** Accessible label. Omit for decorative icons (default). */
  title?: string;
}

export function Icon({
  name,
  category,
  brand,
  variant = 'm-default',
  size = 24,
  className,
  title,
}: IconProps) {
  const contextBrand = useContext(IconBrandContext);
  useContext(IconReadyContext); // re-render when a preloaded folder lands
  const b = brand ?? contextBrand;

  // Self-load any folder this icon needs but nobody preloaded — covers icons used
  // outside an IconProvider, and `common` groups which are never preloaded.
  const keys = foldersFor(category, b);
  const dep = keys.join('|');
  const [, bump] = useState(0);
  useEffect(() => {
    const missing = keys.filter((k) => !cache.has(k));
    if (!missing.length) return;
    let alive = true;
    Promise.all(missing.map(loadFolder)).then(() => {
      if (alive) bump((n) => n + 1);
    });
    return () => {
      alive = false;
    };
    // `keys` is derived from `dep`; comparing the joined string keeps this stable.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dep]);

  const markup = category
    ? resolve(category, b, name, variant)
    : resolve('ui', b, name, variant) ?? resolve('feature', b, name, variant);

  const cls = ['fab-icon', className].filter(Boolean).join(' ');

  if (!markup) {
    // Not loaded yet, or unknown icon — hold the box so layout doesn't shift.
    return <span className={cls} style={{ width: size, height: size }} aria-hidden />;
  }

  return (
    <span
      className={cls}
      style={{ width: size, height: size }}
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      dangerouslySetInnerHTML={{ __html: markup }}
    />
  );
}
