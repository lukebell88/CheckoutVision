import type { ChoiceValues, ProjectData, ProjectFlow } from '../../studio/project';
import type { CheckoutPageId, SectionId } from './screens';
import type { FlagId } from './flags';

/**
 * Journey definitions. A flow is pure configuration: an ordered list of screens
 * (some optional), the customer/payment state it presents, feature-flag and
 * choice overrides, and any pre-populated data. Adding a journey is a new entry
 * here — no navigation code changes.
 *
 * The set is a 2×2 matrix: two entry models — WITH a standalone sign-in page and
 * WITHOUT one (email captured at the top of checkout) — each running an Account
 * Matched shopper and an Unknown User. The only thing that varies down each
 * column is where the email lives; the payment PRESENTATION (preferred card,
 * standard list, Nextpay/Pay In 3 CTA) is a choice, not a journey, so it's set
 * per-flow and switchable in the tray.
 *
 * Apple Pay is not its own journey — it's the express button on the sign-in page
 * and an option in the payment list, reachable from both the known and unknown
 * flows — so it doesn't need a dedicated row here.
 *
 * The screen list is the order a presenter walks and the order the canvas lays
 * out — it is not a constraint on navigation, which can `goTo`/`next` any screen.
 */
export type FlowId =
  | 'signin-account'
  | 'signin-unknown'
  | 'nosignin-account'
  | 'nosignin-account-keychain'
  | 'nosignin-unknown';

export type CustomerType = 'guest' | 'matched' | 'returning';

export interface FlowScreenRef {
  id: CheckoutPageId;
  /** Optional screens can be skipped in the customer-facing progression. */
  optional?: boolean;
  /**
   * Gate this screen on a flag — absent means always present. The email-first
   * checkout uses this to drop the sign-in PAGE, folding email capture and
   * verification into the top of the one-pager instead.
   */
  when?: { flag: FlagId; is: boolean };
}

/** Present only while the email-first flag is OFF — the page it replaces. */
const UNLESS_EMAIL_FIRST = { flag: 'emailFirstCheckout', is: false } as const;

/**
 * Checkout's data buckets, as carried opaquely by the studio. A type alias
 * rather than an interface so it satisfies ProjectData's index signature.
 */
export type CheckoutPrefill = ProjectData & {
  customer?: Partial<{
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
    signedIn: boolean;
    /** The email belongs to a known account — sign-in shows the verify step. */
    recognised: boolean;
  }>;
  delivery?: Partial<{
    method: string;
    addressKnown: boolean;
    store: string;
    line1: string;
    line2: string;
    city: string;
    postcode: string;
    date: string;
  }>;
  payment?: Partial<{ savedCard: string; method: string; preferred: string; card: string; scheme: string; giftCardApplied: number }>;
  /** Which of the one-pager's sections is open, and which are done. */
  progress?: Partial<{ section: SectionId | 'complete'; done: SectionId[] }>;
  /** Overlays sitting on top of the current screen (the Apple Pay sheet). */
  overlay?: Partial<{ applePay: boolean }>;
};

export interface FlowDef extends ProjectFlow {
  id: FlowId;
  screens: FlowScreenRef[];
  /** Descriptive metadata for the scenario this journey presents. */
  customerType: CustomerType;
  flagOverrides?: Partial<Record<FlagId, boolean>>;
  choiceOverrides?: ChoiceValues;
  prefill?: CheckoutPrefill;
}

/**
 * A shopper we've never met: every field empty.
 *
 * Spelled out rather than omitted. `setFlow` MERGES a flow's prefill over the
 * existing data, so a key a flow doesn't mention keeps whatever the last flow
 * left there — switching from a returning journey to Guest would otherwise carry
 * the previous shopper's email in. Declaring the blanks makes "we know nothing
 * about this person" a property of the flow rather than an accident of order.
 */
const BLANK: CheckoutPrefill = {
  customer: { email: '', firstName: '', lastName: '', phone: '', password: '', signedIn: false, recognised: false },
  delivery: { line1: '', line2: '', city: '', postcode: '', store: '', date: '' },
  payment: { savedCard: '', method: '', preferred: '', card: '', scheme: '', giftCardApplied: 0 },
  // Reset the overlay too: without this, a flow that doesn't mention it would
  // keep the last flow's open Apple Pay sheet (see the merge note above).
  overlay: { applePay: false },
};

/**
 * The account-matched shopper: recognised by email, so the account supplies the
 * name, saved home address and phone. Shared by the three account journeys,
 * which differ only in how they pay. `recognised` but `signedIn: false` — they
 * land on the sign-in page's "Confirm it's you" step and verify before the
 * account details unlock.
 */
const ACCOUNT_CUSTOMER = {
  ...BLANK.customer,
  firstName: 'Luke',
  lastName: 'Bell',
  email: 'luke_bell@next.co.uk',
  phone: '07784141908',
  signedIn: false,
  recognised: true,
};
const ACCOUNT_DELIVERY = {
  ...BLANK.delivery,
  method: 'home',
  addressKnown: true,
  line1: '53 Carlton Road',
  line2: 'Long Eaton',
  city: 'Nottingham',
  postcode: 'NG10 3LF',
  date: 'Weds 12th July',
};

/** The recognised account, remembered card. Shared by both Account Matched flows. */
const ACCOUNT_PAYMENT = {
  ...BLANK.payment,
  method: 'card',
  preferred: 'card',
  card: 'Monzo •••• 1234',
  scheme: 'mastercard',
};

/** Recognised account details unlock only once verified. */
const ACCOUNT_FLAGS = { savedPayment: false, creditOptions: true, guestRegistration: false, passkeyUpsell: true } as const;
const GUEST_FLAGS = { savedPayment: false, creditOptions: true, guestRegistration: true, passkeyUpsell: false } as const;

export const FLOWS: FlowDef[] = [
  // ---- With Sign In Page (emailFirstCheckout OFF) --------------------------
  {
    id: 'signin-unknown',
    name: 'Unknown User',
    group: 'With Sign in Page',
    description: 'Standalone sign-in page: no account. Whether they enter an (unrecognised) email or tap "Checkout as a guest", the in-checkout email step captures the email then reveals the guest fields, and they fill every section. Payment opens on the full list with nothing preselected.',
    customerType: 'guest',
    screens: [{ id: 'signin', when: UNLESS_EMAIL_FIRST }, { id: 'checkout' }, { id: 'confirmation' }],
    flagOverrides: { ...GUEST_FLAGS, guestIdentityStep: true },
    choiceOverrides: { paymentPresentation: 'none' },
    prefill: {
      ...BLANK,
      delivery: { ...BLANK.delivery, method: 'home' },
      progress: { section: 'details', done: [] },
    },
  },
  {
    id: 'signin-account',
    name: 'Account Match',
    group: 'With Sign in Page',
    description: 'Standalone sign-in page: the email starts empty. Entering a recognised email verifies inline ("Confirm it’s you") and lands on Payment with the remembered card; tapping "Checkout as a guest" instead re-asks the email in checkout and — since it matches — reveals the same passcode there before landing on Payment.',
    customerType: 'matched',
    screens: [{ id: 'signin', when: UNLESS_EMAIL_FIRST }, { id: 'checkout' }, { id: 'confirmation' }],
    // guestIdentityStep: the guest route runs the in-checkout email step, which
    // recognises the account (recognised) and shows the passcode.
    flagOverrides: { ...ACCOUNT_FLAGS, guestIdentityStep: true },
    choiceOverrides: { paymentPresentation: 'preferred' },
    // Email empty so the page shows the field + guest button (not a pre-locked
    // "confirm it's you"). The account's details are seeded for after verify;
    // a recognised email never renders the guest name form, so they don't leak.
    // progress='payment' is where the on-page verify path lands; the guest button
    // resets it to Details for the in-checkout email step.
    prefill: {
      ...BLANK,
      customer: { ...ACCOUNT_CUSTOMER, email: '' },
      delivery: ACCOUNT_DELIVERY,
      payment: ACCOUNT_PAYMENT,
      progress: { section: 'payment', done: ['details', 'delivery'] },
    },
  },

  // ---- No Sign In Page (emailFirstCheckout ON) ----------------------------
  {
    id: 'nosignin-unknown',
    name: 'Unknown User',
    group: 'Checkout',
    description: 'No sign-in page: email is captured at the top. The entered email is not recognised, so the guest name form fills in inline and they complete the sections. Payment opens on the full list with nothing preselected.',
    customerType: 'guest',
    screens: [{ id: 'signin', when: UNLESS_EMAIL_FIRST }, { id: 'checkout' }, { id: 'confirmation' }],
    flagOverrides: { ...GUEST_FLAGS, emailFirstCheckout: true },
    choiceOverrides: { paymentPresentation: 'none' },
    prefill: {
      ...BLANK,
      delivery: { ...BLANK.delivery, method: 'home' },
      progress: { section: 'details', done: [] },
    },
  },
  {
    id: 'nosignin-account',
    name: 'Account Match',
    group: 'Checkout',
    description: 'No sign-in page: email is captured at the top of checkout. The entered email is recognised, so "Confirm it’s you" is presented inline; on success the journey jumps to Payment with the remembered card collapsed.',
    customerType: 'matched',
    screens: [{ id: 'signin', when: UNLESS_EMAIL_FIRST }, { id: 'checkout' }, { id: 'confirmation' }],
    flagOverrides: { ...ACCOUNT_FLAGS, emailFirstCheckout: true },
    choiceOverrides: { paymentPresentation: 'preferred' },
    // Known (`recognised`) but not verified; email starts EMPTY so the tester
    // types it and watches the check. Its card is seeded for the Payment jump.
    prefill: {
      ...BLANK,
      customer: { ...ACCOUNT_CUSTOMER, email: '' },
      delivery: ACCOUNT_DELIVERY,
      payment: ACCOUNT_PAYMENT,
      progress: { section: 'details', done: [] },
    },
  },
  {
    id: 'nosignin-account-keychain',
    name: 'Account Match - Keychain',
    group: 'Checkout',
    description: 'No sign-in page: the shopper is recognised with their email already populated (luke_bell@next.co.uk) and locked, landing straight on "Confirm it’s you" opened on the password (Keychain) method — Sign In with a saved password, or switch to a passkey or a texted code.',
    customerType: 'matched',
    screens: [{ id: 'signin', when: UNLESS_EMAIL_FIRST }, { id: 'checkout' }, { id: 'confirmation' }],
    flagOverrides: { ...ACCOUNT_FLAGS, emailFirstCheckout: true, passwordLogin: true },
    choiceOverrides: { paymentPresentation: 'preferred' },
    // Email KEPT (like soft login) so it loads locked with the verify step
    // already shown; passwordLogin opens that step on the password method.
    prefill: {
      ...BLANK,
      customer: ACCOUNT_CUSTOMER,
      delivery: ACCOUNT_DELIVERY,
      payment: ACCOUNT_PAYMENT,
      progress: { section: 'details', done: [] },
    },
  },
];

export const flowById = (id: FlowId): FlowDef => FLOWS.find((f) => f.id === id) ?? FLOWS[0];
