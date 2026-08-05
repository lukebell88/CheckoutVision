import type { ScreenDef } from '../../studio/project';

/**
 * The catalogue of checkout screens a flow can be composed from.
 *
 * Deliberately short. The checkout itself is ONE screen — the scamp's numbered
 * one-pager, where "1. Your Details / 2. Delivery / 3. Payment" expand in turn
 * and collapse to a summary with a Change link. Which section is open is state
 * (`section` in the runtime's `progress` bucket), not navigation, so the whole
 * journey is a single route the shopper never leaves.
 *
 * That leaves the screens either side of it: the sign-in fork and the terminal
 * confirmation. Sign-in now owns identity verification inline (the "Confirm it's
 * you" step), so there is no separate passcode page.
 *
 * The Apple Pay sheet is NOT a screen: it's an overlay that sits on top of
 * whichever page invoked it (sign-in or checkout), so that page stays mounted
 * behind its scrim. It's driven by the `overlay` data bucket — see
 * `ApplePaySheet` and `CheckoutPage`.
 */
export type CheckoutPageId = 'signin' | 'checkout' | 'confirmation';

export const CHECKOUT_SCREENS: Record<CheckoutPageId, ScreenDef> = {
  signin: { id: 'signin', title: 'Sign / Register', navLabel: 'Sign in' },
  checkout: { id: 'checkout', title: 'Checkout', navLabel: 'Checkout' },
  confirmation: { id: 'confirmation', title: 'Order complete', navLabel: 'Confirmation', terminal: true },
};

export const pageDef = (id: CheckoutPageId): ScreenDef => CHECKOUT_SCREENS[id];

/**
 * The one-pager's sections, in order. `review` is not a section — it's the state
 * where all three are complete and the pay button is live, which the scamp draws
 * as "Your Order".
 */
export type SectionId = 'details' | 'delivery' | 'payment';
export const SECTIONS: SectionId[] = ['details', 'delivery', 'payment'];

export const SECTION_LABEL: Record<SectionId, string> = {
  details: 'Your Details',
  delivery: 'Delivery',
  payment: 'Payment',
};

/** Sections before `id`, i.e. the ones shown collapsed with a Change link. */
export const sectionsBefore = (id: SectionId): SectionId[] =>
  SECTIONS.slice(0, SECTIONS.indexOf(id));

/** The section after `id`, or null when the order is ready to place. */
export const nextSection = (id: SectionId): SectionId | null =>
  SECTIONS[SECTIONS.indexOf(id) + 1] ?? null;
