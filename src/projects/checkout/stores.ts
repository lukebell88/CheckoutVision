/**
 * Store lookup for the Collection delivery method.
 *
 * This used to wrap Next's live "collect in store" endpoint, but that endpoint
 * only allows its own origin cross-origin — so the static GitHub Pages build had
 * to route through public CORS relays, which were flaky and slow. It now reads
 * frozen sample data (see storeData.ts) in the same shape the API returned, so
 * the step is instant and works offline. Kept async so the "Find a Store"
 * loading state still shows.
 */
import {
  LEICESTER_PARCEL_SHOPS,
  LEICESTER_STORES,
  NOTTINGHAM_PARCEL_SHOPS,
  NOTTINGHAM_STORES,
} from './storeData';

export interface Store {
  branchNumber: string;
  name: string;
  address: string;
  postcode: string;
  distanceMiles: number;
  /** e.g. "09:00 - 20:00". */
  openingMessage: string;
  isOpen: boolean;
}

/** A brief pause so the search reads as a lookup rather than an instant swap. */
const LOOKUP_MS = 350;
const delay = (ms: number) => new Promise<void>((resolve) => window.setTimeout(resolve, ms));

/**
 * Look up stores near a typed city or postcode. Returns nearest first; an empty
 * query yields no results. With only two cities on file, a Leicester query (the
 * word or an LE postcode) returns the Leicester branches and everything else
 * falls back to Nottingham, so the step never dead-ends.
 */
export async function searchStores(query: string): Promise<Store[]> {
  await delay(LOOKUP_MS);
  return nearestStores(query);
}

/** Parcel shops (the Parcel Shop method) — same lookup, different data. */
export async function searchParcelShops(query: string): Promise<Store[]> {
  await delay(LOOKUP_MS);
  return nearestParcelShops(query);
}

/**
 * Synchronous nearest-first lookups. Used when the postcode is already known (a
 * signed-in shopper) so switching delivery method shows the list immediately,
 * with no loading flash — the async searches above wrap these for a guest's
 * typed search, where a brief loading state is expected.
 */
export const nearestStores = (query: string): Store[] =>
  select(query, NOTTINGHAM_STORES, LEICESTER_STORES);
export const nearestParcelShops = (query: string): Store[] =>
  select(query, NOTTINGHAM_PARCEL_SHOPS, LEICESTER_PARCEL_SHOPS);

function select(query: string, nottingham: Store[], leicester: Store[]): Store[] {
  const location = query.trim();
  if (!location) return [];
  const isLeicester = /leicester|\ble\d/i.test(location);
  const set = isLeicester ? leicester : nottingham;
  return [...set].sort((a, b) => a.distanceMiles - b.distanceMiles);
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
