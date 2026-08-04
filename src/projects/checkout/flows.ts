import type { ProjectData, ProjectFlow } from '../../studio/project';
import type { CheckoutPageId, SectionId } from './screens';
import type { FlagId } from './flags';

/**
 * Journey definitions. A flow is pure configuration: an ordered list of screens
 * (some optional), the customer/payment state it presents, feature-flag
 * overrides, and any pre-populated data. Adding a journey is a new entry here —
 * no navigation code changes.
 *
 * The five flows are the journeys the team is comparing: an Apple Pay express
 * path, a full guest checkout, and three account-matched journeys that differ
 * only by how they pay (saved card, Nextpay, Pay In 3). Keeping them separate is
 * so they can be sent to a tester, or lined up side by side, one at a time.
 *
 * The screen list is the order a presenter walks and the order the canvas lays
 * out — it is not a constraint on navigation, which can `goTo`/`next` any screen.
 */
export type FlowId =
  | 'apple-pay'
  | 'guest'
  | 'account-cash'
  | 'account-nextpay'
  | 'account-payin3';

export type CustomerType = 'guest' | 'matched' | 'returning';

/**
 * How sign-in is put to a shopper we recognise — the axis rows 2-4 of the scamp
 * are exploring.
 *
 *   inline        · matched inside "1. Your Details"; never leaves the one-pager
 *   password-first· a Sign in page shaped for keychain autofill, OTP secondary
 *   otp-first     · a Sign in page leading with the passcode, password below
 *   chooser       · "Hi Alex" — pick one-time code or password
 */
export type AuthTreatment = 'none' | 'inline' | 'password-first' | 'otp-first' | 'chooser';

export interface FlowScreenRef {
  id: CheckoutPageId;
  /** Optional screens can be skipped in the customer-facing progression. */
  optional?: boolean;
}

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
  payment?: Partial<{ savedCard: string; method: string; only: string }>;
  /** Which of the one-pager's sections is open, and which are done. */
  progress?: Partial<{ section: SectionId | 'complete'; done: SectionId[] }>;
  auth?: Partial<{ treatment: AuthTreatment }>;
};

export interface FlowDef extends ProjectFlow {
  id: FlowId;
  screens: FlowScreenRef[];
  /** Descriptive metadata for the scenario this journey presents. */
  customerType: CustomerType;
  flagOverrides?: Partial<Record<FlagId, boolean>>;
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
  customer: { email: '', firstName: '', lastName: '', phone: '', signedIn: false },
  delivery: { line1: '', line2: '', city: '', postcode: '', store: '', date: '' },
  payment: { savedCard: '', method: '', only: '' },
};

/**
 * The account-matched shopper: recognised by email, so the account supplies the
 * name, saved home address and phone. Shared by the three account journeys,
 * which differ only in how they pay.
 */
const ACCOUNT_CUSTOMER = {
  ...BLANK.customer,
  firstName: 'Luke',
  lastName: 'Bell',
  email: 'luke_bell@next.co.uk',
  phone: '07784141908',
  signedIn: true,
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

export const FLOWS: FlowDef[] = [
  {
    id: 'apple-pay',
    name: 'Apple Pay',
    description: 'Express checkout: from sign-in, the Apple Pay button opens the Apple Pay sheet and the order completes — no checkout page.',
    customerType: 'guest',
    screens: [{ id: 'signin' }, { id: 'applepay' }, { id: 'confirmation' }],
    flagOverrides: { expressPayment: true, savedPayment: false },
    // Nothing is entered — Apple Pay supplies contact/address/card in its sheet.
    prefill: {
      ...BLANK,
      delivery: { ...BLANK.delivery, method: 'home' },
      auth: { treatment: 'none' },
    },
  },
  {
    id: 'guest',
    name: 'Guest Checkout',
    description: 'No account. Signs in as a guest and fills in every section; no payment method preselected, Nextpay & Pay In 3 shown.',
    customerType: 'guest',
    screens: [{ id: 'signin' }, { id: 'checkout' }, { id: 'confirmation' }],
    flagOverrides: { savedPayment: false, creditOptions: true, guestRegistration: true, passkeyUpsell: false },
    // Every field blank; the one-pager opens on Your Details and they fill it in.
    // `payment.method: ''` leaves the payment list with nothing preselected.
    prefill: {
      ...BLANK,
      delivery: { ...BLANK.delivery, method: 'home' },
      progress: { section: 'details', done: [] },
      auth: { treatment: 'none' },
    },
  },
  {
    id: 'account-cash',
    name: 'Account Matched - Cash',
    description: 'Recognised email → one-time passcode → checkout with details and saved address prefilled; the saved card is selected and open.',
    customerType: 'matched',
    screens: [{ id: 'signin' }, { id: 'otp' }, { id: 'checkout' }, { id: 'confirmation' }],
    flagOverrides: { savedPayment: true, creditOptions: true, guestRegistration: false, passkeyUpsell: true },
    // Details and Delivery arrive complete and collapsed; the journey picks up on
    // Payment, with the saved card selected and expanded.
    prefill: {
      ...BLANK,
      customer: ACCOUNT_CUSTOMER,
      delivery: ACCOUNT_DELIVERY,
      payment: { ...BLANK.payment, method: 'saved', savedCard: 'Visa ending 4567' },
      progress: { section: 'payment', done: ['details', 'delivery'] },
      auth: { treatment: 'none' },
    },
  },
  {
    id: 'account-nextpay',
    name: 'Account Matched - Nextpay',
    description: 'As the matched journey, but the shopper sees no payment options — just a single "Complete With Nextpay" button.',
    customerType: 'matched',
    screens: [{ id: 'signin' }, { id: 'otp' }, { id: 'checkout' }, { id: 'confirmation' }],
    flagOverrides: { savedPayment: false, creditOptions: true, guestRegistration: false, passkeyUpsell: true },
    // `payment.only: 'nextpay'` collapses the whole Payment section to one CTA.
    prefill: {
      ...BLANK,
      customer: ACCOUNT_CUSTOMER,
      delivery: ACCOUNT_DELIVERY,
      payment: { ...BLANK.payment, only: 'nextpay' },
      progress: { section: 'payment', done: ['details', 'delivery'] },
      auth: { treatment: 'none' },
    },
  },
  {
    id: 'account-payin3',
    name: 'Account Matched - Pay In 3',
    description: 'The matched journey with a single "Complete With Pay In 3" button in place of the payment options.',
    customerType: 'matched',
    screens: [{ id: 'signin' }, { id: 'otp' }, { id: 'checkout' }, { id: 'confirmation' }],
    flagOverrides: { savedPayment: false, creditOptions: true, guestRegistration: false, passkeyUpsell: true },
    prefill: {
      ...BLANK,
      customer: ACCOUNT_CUSTOMER,
      delivery: ACCOUNT_DELIVERY,
      payment: { ...BLANK.payment, only: 'payin3' },
      progress: { section: 'payment', done: ['details', 'delivery'] },
      auth: { treatment: 'none' },
    },
  },
];

export const flowById = (id: FlowId): FlowDef => FLOWS.find((f) => f.id === id) ?? FLOWS[0];
