/**
 * Brand logo resolver.
 *
 *   iconography/logotype/<brand>-<variant>.svg
 *
 * Logos are imported as URLs and kept eager: they're small (~76 KB for all ten
 * brands) and the BrandPill renders every brand's logo at once, so there's
 * nothing to defer.
 *
 * Feature / user-interface / common icons are NOT resolved here. They're loaded
 * per folder, on demand, by `components/Icon` — see the note there. Inlining
 * them eagerly was two thirds of the JS bundle.
 */

const logoIcons = import.meta.glob('../../iconography/logotype/*.svg', {
  query: '?url',
  import: 'default',
  eager: true,
}) as Record<string, string>;

const logoIndex = new Map<string, string>(
  Object.entries(logoIcons).map(([path, url]) => [path.split('/').pop()!.replace('.svg', ''), url]),
);

/** Resolve a brand logo by its logotype basename, e.g. "next-default". */
export function logo(basename: string): string | undefined {
  return logoIndex.get(basename);
}
