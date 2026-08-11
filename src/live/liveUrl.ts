import { defaultFlags, type FlagValues, type ProjectDef } from '../studio/project';

/**
 * Live-link encoding.
 *
 * A live link is a self-contained URL that opens ONLY the prototype, full-screen,
 * on the recipient's real device — no studio chrome. The scenario (project,
 * brand, flow, enabled flags) is encoded in the query string so the link is
 * portable and reproducible on any device, independent of local storage.
 *
 *   ?live=1&project=checkout&client=next&flow=guest&flags=steppedCheckout,…
 *
 * Query params rather than paths: the studio is a static build with no SPA
 * rewrite, so a path route would 404 on the direct links testers are sent.
 */

export interface LiveParams {
  isLive: boolean;
  project?: string;
  client?: string;
  flow?: string;
  /** Optional starting screen (else the flow's first). */
  screen?: string;
  /** null = not specified (use flow defaults); otherwise the exact enabled set. */
  enabledFlags: Set<string> | null;
  /**
   * A REVIEW link (`?review=1`) opts into the in-preview scenario tray (⌘J), so
   * the reviewer can flip journey / payment live. A plain tester link stays
   * locked to its URL scenario — that's the reproducibility guarantee — so the
   * tray is gated to this flag rather than every live link.
   */
  review: boolean;
}

export function readLiveParams(search = window.location.search): LiveParams {
  const p = new URLSearchParams(search);
  const isLive = p.get('live') === '1' || p.get('mode') === 'live';

  const raw = p.get('flags');
  const enabledFlags = raw === null ? null : new Set(raw.split(',').filter(Boolean));

  return {
    isLive,
    project: p.get('project') ?? undefined,
    client: p.get('client') ?? undefined,
    flow: p.get('flow') ?? undefined,
    // `page` is the pre-multi-project spelling; still honoured so older links work.
    screen: p.get('screen') ?? p.get('page') ?? undefined,
    enabledFlags,
    review: p.get('review') === '1',
  };
}

/** Resolve a link's enabled-flag set against a project's declared flags. */
export function flagsFromLink(project: ProjectDef, enabled: Set<string>): FlagValues {
  return project.flags.reduce<FlagValues>(
    (acc, f) => ({ ...acc, [f.id]: enabled.has(f.id) }),
    defaultFlags(project),
  );
}

/** Build a shareable live URL from the current scenario. */
export function buildLiveUrl(opts: {
  project: string;
  client: string;
  flow: string;
  flags: FlagValues;
  screen?: string;
}): string {
  const p = new URLSearchParams();
  p.set('live', '1');
  p.set('project', opts.project);
  p.set('client', opts.client);
  p.set('flow', opts.flow);
  if (opts.screen) p.set('screen', opts.screen);
  const enabled = Object.entries(opts.flags)
    .filter(([, on]) => on)
    .map(([id]) => id);
  p.set('flags', enabled.join(','));
  const base = `${window.location.origin}${window.location.pathname}`;
  return `${base}?${p.toString()}`;
}
