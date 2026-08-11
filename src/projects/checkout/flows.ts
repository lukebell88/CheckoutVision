import type { ChoiceValues, ProjectData, ProjectFlow } from '../../studio/project';
import type { CheckoutPageId, SectionId } from './screens';
import type { FlagId } from './flags';

/**
 * Journey definitions. A flow is pure configuration: an ordered list of screens
 * (some optional), the customer/payment state it presents, feature-flag and
 * choice overrides, and any pre-populated data. Adding a journey is a new entry
 * here — no navigation code changes.
 *
 * The set is a 2×3 matrix: two entry models — WITH a standalone sign-in page and
 * WITHOUT one (email captured at the top of checkout) — each running the same
 * three journeys: an Account Matched shopper, an Unknown User, and Apple Pay
 * express. The only thing that varies down each column is where the email lives;
 * the payment PRESENTATION (preferred card, standard list, Nextpay/Pay In 3 CTA)
 * is a choice, not a journey, so it's set per-flow and switchable in the tray.
 *
 * The screen list is the order a presenter walks and the order the canvas lays
 * out — it is not a constraint on navigation, which can `goTo`/`next` any screen.
 */
export type FlowId =
  | 'signin-account'
  | 'signin-unknown'
  | 'signin-applepay'
  | 'nosignin-account'
  | 'nosignin-unknown'
  | 'nosignin-applepay';

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
  payment?: Partial<{ savedCard: string; method: string; preferred: string; card: string; scheme: string }>;
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
  customer: { email: '', firstName: '', lastName: '', phone: '', signedIn: false, recognised: false },
  delivery: { line1: '', line2: '', city: '', postcode: '', store: '', date: '' },
  payment: { savedCard: '', method: '', preferred: '', card: '', scheme: '' },
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
    id: 'signin-account',
    name: 'Sign In · Account Matched',
    description: 'Standalone sign-in page: a recognised email verifies inline ("Confirm it’s you"), then the one-pager lands on Payment with the remembered card collapsed and a Change link.',
    customerType: 'matched',
    screens: [{ id: 'signin', when: UNLESS_EMAIL_FIRST }, { id: 'checkout' }, { id: 'confirmation' }],
    flagOverrides: ACCOUNT_FLAGS,
    choiceOverrides: { paymentPresentation: 'preferred' },
    prefill: {
      ...BLANK,
      customer: ACCOUNT_CUSTOMER,
      delivery: ACCOUNT_DELIVERY,
      payment: ACCOUNT_PAYMENT,
      progress: { section: 'payment', done: ['details', 'delivery'] },
    },
  },
  {
    id: 'signin-unknown',
    name: 'Sign In · Unknown User',
    description: 'Standalone sign-in page: no account, so they continue as a guest and fill every section. Payment opens on the full list with nothing preselected.',
    customerType: 'guest',
    screens: [{ id: 'signin', when: UNLESS_EMAIL_FIRST }, { id: 'checkout' }, { id: 'confirmation' }],
    flagOverrides: GUEST_FLAGS,
    choiceOverrides: { paymentPresentation: 'none' },
    prefill: {
      ...BLANK,
      delivery: { ...BLANK.delivery, method: 'home' },
      progress: { section: 'details', done: [] },
    },
  },
  {
    id: 'signin-applepay',
    name: 'Sign In · Apple Pay',
    description: 'Standalone sign-in page: the Apple Pay button opens the sheet over the page and the order completes — no checkout page.',
    customerType: 'guest',
    screens: [{ id: 'signin' }, { id: 'confirmation' }],
    flagOverrides: { expressPayment: true, savedPayment: false },
    // Nothing is entered — Apple Pay supplies contact/address/card in its sheet.
    prefill: {
      ...BLANK,
      delivery: { ...BLANK.delivery, method: 'home' },
    },
  },

  // ---- No Sign In Page (emailFirstCheckout ON) ----------------------------
  {
    id: 'nosignin-account',
    name: 'No Sign In · Account Matched',
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
    id: 'nosignin-unknown',
    name: 'No Sign In · Unknown User',
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
    id: 'nosignin-applepay',
    name: 'No Sign In · Apple Pay',
    description: 'No sign-in page: the Apple Pay express button sits at the top of checkout. Tapping it opens the sheet over the page and the order completes — no details entered.',
    customerType: 'guest',
    screens: [{ id: 'signin', when: UNLESS_EMAIL_FIRST }, { id: 'checkout' }, { id: 'confirmation' }],
    flagOverrides: { emailFirstCheckout: true, expressPayment: true, savedPayment: false },
    prefill: {
      ...BLANK,
      delivery: { ...BLANK.delivery, method: 'home' },
      progress: { section: 'details', done: [] },
    },
  },
];

export const flowById = (id: FlowId): FlowDef => FLOWS.find((f) => f.id === id) ?? FLOWS[0];
