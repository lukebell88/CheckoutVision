/**
 * Store lookup for the Collection delivery method.
 *
 * Wraps Next's real "collect in store" stock endpoint, which the PDP uses to
 * check branch stock: `/CollectInStoreEnquiry?location=<city|postcode>`. It
 * returns nearby branches ordered by distance — plenty for the prototype's
 * "Find a Store" step.
 *
 * Cross-origin is the catch: the endpoint only sends
 * `Access-Control-Allow-Origin: https://www.next.co.uk`, so a browser on any
 * other origin can't read it directly. Two routes around that:
 *
 *   · dev  — the Vite dev server proxies `/next-api/*` → www.next.co.uk, so the
 *            browser makes a same-origin request (see vite.config.ts).
 *   · prod — GitHub Pages is static with no server, so requests go through a
 *            public CORS relay. Relays are best-effort (rate limits, downtime),
 *            so we try a few in turn and the caller surfaces an error if all
 *            fail rather than showing stale data.
 */
export interface Store {
  branchNumber: string;
  name: string;
  address: string;
  postcode: string;
  distanceMiles: number;
  /** e.g. "09:00 - 20:00", straight from the API. */
  openingMessage: string;
  isOpen: boolean;
}

/** Public CORS relays, tried in order in production. Each wraps a full URL. */
const CORS_PROXIES: ((url: string) => string)[] = [
  (u) => `https://api.allorigins.win/raw?url=${encodeURIComponent(u)}`,
  (u) => `https://corsproxy.io/?url=${encodeURIComponent(u)}`,
  (u) => `https://api.codetabs.com/v1/proxy/?quest=${u}`,
];

async function fetchEnquiry(location: string): Promise<unknown> {
  const path = `CollectInStoreEnquiry?location=${encodeURIComponent(location)}`;

  if (import.meta.env.DEV) {
    const res = await fetch(`/next-api/${path}`);
    if (!res.ok) throw new Error(`Store lookup failed (${res.status})`);
    return res.json();
  }

  const target = `https://www.next.co.uk/${path}`;
  let lastError: unknown;
  for (const wrap of CORS_PROXIES) {
    try {
      const res = await fetch(wrap(target));
      if (!res.ok) throw new Error(`status ${res.status}`);
      return await res.json();
    } catch (err) {
      lastError = err;
    }
  }
  throw new Error(`Store lookup failed: ${String(lastError)}`);
}

/** Narrow the API's nested shape to the fields the store list renders. */
interface RawBranch {
  BranchNumber?: string;
  IsOpen?: boolean;
  BranchData?: {
    BranchName?: string;
    BranchDisplayAddress?: string;
    BranchPostcode?: string;
    Distance?: string;
    CistOpeningMessage?: string;
  };
}

/**
 * Look up stores near a typed city or postcode. Returns nearest first; an empty
 * query yields no results without a network call. Throws if the lookup fails so
 * the caller can show an error state.
 */
export async function searchStores(query: string): Promise<Store[]> {
  const location = query.trim();
  if (!location) return [];

  const data = fetchEnquiryResult(await fetchEnquiry(location));
  return data
    .map((b) => ({
      branchNumber: b.BranchNumber ?? '',
      name: b.BranchData?.BranchName ?? '',
      address: b.BranchData?.BranchDisplayAddress ?? '',
      postcode: b.BranchData?.BranchPostcode ?? '',
      distanceMiles: Number(b.BranchData?.Distance ?? 0),
      openingMessage: b.BranchData?.CistOpeningMessage ?? '',
      isOpen: !!b.IsOpen,
    }))
    .sort((a, b) => a.distanceMiles - b.distanceMiles);
}

function fetchEnquiryResult(data: unknown): RawBranch[] {
  const options = (data as { ItemOptions?: { Branches?: RawBranch[] }[] })?.ItemOptions;
  return options?.[0]?.Branches ?? [];
}

/**
 * Display formatting. The API returns names and addresses in ALL CAPS; the
 * design shows them title-cased, with the postcode kept uppercase. Done in JS
 * (not CSS `capitalize`, which only touches the first letter and would leave the
 * rest of an all-caps word shouting) so the value reads correctly wherever it's
 * shown — including the collapsed delivery summary.
 */
const titleCase = (s: string) => s.toLowerCase().replace(/\b[a-z]/g, (c) => c.toUpperCase());

export const storeName = (s: Store) => titleCase(s.name);
export const storeAddress = (s: Store) => titleCase(s.address);
export const storePostcode = (s: Store) => s.postcode.toUpperCase();
/** The one-line label written to the delivery summary. */
export const storeLabel = (s: Store) => `${storeName(s)}, ${storePostcode(s)}`;
