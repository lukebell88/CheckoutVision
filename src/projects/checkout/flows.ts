import type { ProjectData, ProjectFlow } from '../../studio/project';
import type { CheckoutPageId, SectionId } from './screens';
import type { FlagId } from './flags';

/**
 * Journey definitions. A flow is pure configuration: an ordered list of screens
 * (some optional), the customer/payment state it presents, feature-flag
 * overrides, and any pre-populated data. Adding a journey is a new entry here —
 * no navigation code changes.
 *
 * The five flows are the five scamp rows. They are one journey underneath: the
 * same one-page checkout, entered from a different sign-in treatment and with a
 * different amount already known about the shopper. Keeping them separate is so
 * they can be sent to a tester, or lined up side by side, one at a time.
 *
 * The screen list is the order a presenter walks and the order the canvas lays
 * out — it is not a constraint on navigation, which can `goTo` any screen.
 */
export type FlowId =
  | 'guest'
  | 'collection'
  | 'account-matched'
  | 'keychain'
  | 'otp-first';

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
  payment?: Partial<{ savedCard: string }>;
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
  payment: { savedCard: '' },
};

/** A recognised shopper: saved address, saved card, nothing left to type. */
const RETURNING: CheckoutPrefill = {
  customer: {
    firstName: 'Alex',
    lastName: 'Smith',
    email: 'alex_smith@next.co.uk',
    phone: '07777777777',
    signedIn: true,
  },
  // The address is spelled out because the summary now shows only what it's
  // given — with no sample-data fallbacks left, a returning shopper missing an
  // address would render "Deliver to:" and nothing else.
  delivery: {
    method: 'home',
    addressKnown: true,
    line1: '162 Somewhere Street',
    line2: 'Somewhere',
    city: 'Somewhere',
    postcode: 'SW14NGT',
    date: 'Weds 12th July',
  },
  payment: { savedCard: 'Visa ending 4567' },
  progress: { section: 'complete', done: ['details', 'delivery', 'payment'] },
};

export const FLOWS: FlowDef[] = [
  {
    id: 'guest',
    name: 'Guest',
    description: 'No account. Fills in every section, pays by card, offered an account at the end.',
    customerType: 'guest',
    screens: [{ id: 'signin' }, { id: 'checkout' }, { id: 'confirmation' }],
    flagOverrides: { savedPayment: false, guestRegistration: true, passkeyUpsell: false },
    // Nothing is known about a guest — the one-pager opens with every field
    // blank and they fill it in. Seeding a name here would make the guest
    // journey a demo of a returning customer.
    prefill: {
      ...BLANK,
      delivery: { ...BLANK.delivery, method: 'home' },
      progress: { section: 'details', done: [] },
      auth: { treatment: 'none' },
    },
  },
  {
    id: 'collection',
    name: 'Guest · collection',
    description: 'The guest journey routed through Collection rather than home delivery.',
    customerType: 'guest',
    screens: [{ id: 'signin' }, { id: 'checkout' }, { id: 'confirmation' }],
    flagOverrides: { savedPayment: false, guestRegistration: true, passkeyUpsell: false, collectionOptions: true },
    // Also a guest, so also blank, and it opens on Your Details like any other
    // guest — what makes this flow "collection" is the pre-chosen delivery
    // method, which shows when they reach section 2.
    //
    // It used to open on Delivery with `done: ['details']` so the canvas landed
    // straight on the interesting bit. That marked Your Details complete when it
    // was empty, so walking the flow from sign-in gave you a finished section
    // with nothing in it and a Change link to nowhere. Jumping to a mid-journey
    // state is what the Pages variants are for — a flow has to stay walkable.
    prefill: {
      ...BLANK,
      delivery: { ...BLANK.delivery, method: 'collection' },
      progress: { section: 'details', done: [] },
      auth: { treatment: 'none' },
    },
  },
  {
    id: 'account-matched',
    name: 'Account matched',
    description: 'Guest types an email we recognise; sign-in is offered inside Your Details without leaving the page.',
    customerType: 'matched',
    screens: [{ id: 'signin' }, { id: 'checkout' }, { id: 'otp' }, { id: 'confirmation' }],
    flagOverrides: { savedPayment: true, guestRegistration: false, passkeyUpsell: true },
    // They typed an email we recognise, so Your Details arrives already complete
    // — the account supplies the name, and there's nothing left for them to fill
    // in. Delivery is where the journey picks up.
    //
    // The address is NOT prefilled: knowing who an email belongs to is not the
    // same as having authenticated them, and a saved address is a lot more to
    // hand over than a first name. Change on Your Details returns to sign-in, so
    // "that isn't me" has somewhere to go — see OnePageCheckout.
    prefill: {
      ...BLANK,
      customer: {
        ...BLANK.customer,
        email: 'alex_smith@next.co.uk',
        firstName: 'Alex',
        lastName: 'Smith',
      },
      delivery: { ...BLANK.delivery, method: 'home' },
      progress: { section: 'delivery', done: ['details'] },
      auth: { treatment: 'inline' },
    },
  },
  {
    id: 'keychain',
    name: 'Keychain friendly',
    description: 'A password-first sign-in page shaped for iOS / Android autofill, with a passcode fallback.',
    customerType: 'returning',
    screens: [{ id: 'signin' }, { id: 'otp', optional: true }, { id: 'checkout' }, { id: 'confirmation' }],
    flagOverrides: { savedPayment: true, guestRegistration: false, passkeyUpsell: true },
    prefill: { ...RETURNING, auth: { treatment: 'password-first' } },
  },
  {
    id: 'otp-first',
    name: 'Focus on OTP',
    description: 'Sign-in leads with the one-time passcode; password sits underneath as the alternative.',
    customerType: 'returning',
    screens: [{ id: 'signin' }, { id: 'otp' }, { id: 'checkout' }, { id: 'confirmation' }],
    flagOverrides: { savedPayment: true, guestRegistration: false, passkeyUpsell: true },
    prefill: { ...RETURNING, auth: { treatment: 'otp-first' } },
  },
];

export const flowById = (id: FlowId): FlowDef => FLOWS.find((f) => f.id === id) ?? FLOWS[0];
