import type { ProjectFlag } from '../../studio/project';

/**
 * Feature-flag registry.
 *
 * Flags are centralised here so a new demonstrable concept is one entry plus the
 * checkout code that reads `flags[id]`. Only flags that produce a visible change
 * belong here. `group` drives sidebar grouping; `default` is the baseline used
 * by Reset and as the starting point a flow may override.
 *
 * Four flags went when the checkout became a single page: `steppedCheckout` (the
 * page IS the step sequence now), `progressIndicator` (the numbered sections are
 * the progress), and `summaryLeft` / `stickyOrderSummary` (there is no summary
 * column — the total bar is pinned by definition and the basket lives behind
 * VIEW ORDER). Don't reintroduce them without a design that uses them.
 */
export type FlagId =
  | 'expressPayment'
  | 'savedPayment'
  | 'creditOptions'
  | 'promoCode'
  | 'saveCardPrompt'
  | 'addressLookup'
  | 'collectionOptions'
  | 'deliveryDates'
  | 'emailFirstCheckout'
  | 'guestIdentityStep'
  | 'softLogin'
  | 'passwordLogin'
  | 'guestRegistration'
  | 'passkeyUpsell'
  | 'freeDeliveryCountdown'
  | 'inlineValidation';

export type FlagGroup = 'Delivery' | 'Payment' | 'Account' | 'Order complete' | 'Validation';

export interface FlagDef extends ProjectFlag {
  id: FlagId;
  group: FlagGroup;
}

export const FLAGS: FlagDef[] = [
  { id: 'addressLookup', name: 'Address lookup', description: 'Search-as-you-type address finder instead of manual entry.', group: 'Delivery', default: true },
  { id: 'collectionOptions', name: 'Collection options', description: 'Offer Collection and Parcel Shop alongside home delivery.', group: 'Delivery', default: true },
  { id: 'deliveryDates', name: 'Delivery date picker', description: 'Choose a delivery day once the address is known.', group: 'Delivery', default: true },

  { id: 'expressPayment', name: 'Express payment', description: 'Apple Pay / express checkout on the sign-in screen.', group: 'Payment', default: true },
  { id: 'savedPayment', name: 'Saved payment methods', description: 'Offer a stored card for returning customers.', group: 'Payment', default: false },
  { id: 'creditOptions', name: 'Credit payment options', description: 'Show nextpay and pay in 3 in the payment list.', group: 'Payment', default: true },
  { id: 'saveCardPrompt', name: 'Save card prompt', description: '“Checkout faster” — offer to store the card for next time.', group: 'Payment', default: true },
  { id: 'promoCode', name: 'Promotional code', description: 'Show a promo/voucher code entry in the order panel.', group: 'Payment', default: false },

  { id: 'emailFirstCheckout', name: 'No sign-in page', description: 'Drop the sign-in page — capture email (and express pay) at the top of checkout; recognised shoppers verify inline.', group: 'Account', default: false },
  { id: 'guestIdentityStep', name: 'Guest identity step', description: 'On the sign-in-page flows, the guest route captures the email first in checkout, then reveals guest fields or an inline passcode depending on whether it matches an account.', group: 'Account', default: false },
  { id: 'softLogin', name: 'Soft login', description: 'A soft-recognised shopper: the verify step starts with a Send Code button (no passcode issued on arrival) rather than the code inputs.', group: 'Account', default: false },
  { id: 'passwordLogin', name: 'Password login (Keychain)', description: 'The verify step opens on the password method (Sign In with a saved/Keychain password) rather than the passcode.', group: 'Account', default: false },
  { id: 'guestRegistration', name: 'Guest registration', description: 'Offer account creation to guests on the confirmation.', group: 'Account', default: true },
  { id: 'passkeyUpsell', name: 'Passkey upsell', description: 'Offer to save a passkey once the order is placed.', group: 'Account', default: true },

  { id: 'freeDeliveryCountdown', name: 'Free delivery countdown', description: 'Time-limited free delivery banner on the confirmation.', group: 'Order complete', default: true },

  { id: 'inlineValidation', name: 'Inline validation', description: 'Validate fields on blur rather than on submit.', group: 'Validation', default: true },
];

/** Checkout's narrowed view of the studio's generic flag state. */
export type FlagState = Record<FlagId, boolean>;

export const defaultFlagState = (): FlagState =>
  FLAGS.reduce((acc, f) => ({ ...acc, [f.id]: f.default }), {} as FlagState);

export const flagById = (id: FlagId): FlagDef => FLAGS.find((f) => f.id === id)!;
