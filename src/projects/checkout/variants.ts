import type { VariantGroup } from '../../studio/project';
import type { CheckoutPageId } from './screens';
import type { FlagId } from './flags';

/**
 * Screen variants — a single checkout screen rendered many ways (error states,
 * delivery types, payment types, …). Presented like Flows: the left panel lists
 * groups; the canvas shows every version of the selected group as a captioned
 * frame.
 *
 * A group fixes the `screen`; each version overrides feature flags and/or the
 * data buckets to produce its variant. With the checkout collapsed to one page,
 * most groups now fix `screen: 'checkout'` and vary the open section through
 * `data.progress` — which is exactly how the scamp shows them.
 */
export interface CheckoutVariantGroup extends VariantGroup {
  screen: CheckoutPageId;
  versions: Array<{
    id: string;
    label: string;
    flags?: Partial<Record<FlagId, boolean>>;
    data?: {
      customer?: Record<string, unknown>;
      delivery?: Record<string, unknown>;
      payment?: Record<string, unknown>;
      progress?: Record<string, unknown>;
      auth?: Record<string, unknown>;
    };
    note?: string;
  }>;
}

const GUEST = { email: 'alex_smith@next.co.uk', firstName: 'Alex', lastName: 'Smith', signedIn: false };

export const VARIANT_GROUPS: CheckoutVariantGroup[] = [
  {
    id: 'signin',
    name: 'Sign in',
    screen: 'signin',
    description: 'How sign-in is put to a shopper we recognise.',
    versions: [
      { id: 'email', label: 'Email capture', data: { auth: { treatment: 'none' } } },
      { id: 'chooser', label: 'Hi Alex — passcode or password', data: { auth: { treatment: 'chooser' }, customer: { ...GUEST, signedIn: false } } },
      { id: 'password-first', label: 'Password first (keychain)', data: { auth: { treatment: 'password-first' }, customer: GUEST } },
      { id: 'otp-first', label: 'Passcode first', data: { auth: { treatment: 'otp-first' }, customer: GUEST } },
      { id: 'no-express', label: 'Without express payment', flags: { expressPayment: false } },
    ],
  },
  {
    id: 'email-first',
    name: 'No sign-in page',
    screen: 'checkout',
    description: 'Email captured at the top of the one-pager, with the sign-in page removed — entry, inline verify, and the resting chip.',
    versions: [
      { id: 'entry', label: 'Email entry + express', flags: { emailFirstCheckout: true }, data: { customer: { email: '' } } },
      {
        id: 'verify',
        label: 'Recognised — verify inline',
        flags: { emailFirstCheckout: true },
        data: { customer: { email: 'alex_smith@next.co.uk', recognised: true, signedIn: false } },
        note: 'A known email locks to a chip and reveals the passcode step (passkey / password below).',
      },
      {
        id: 'guest',
        label: 'Guest — sections revealed',
        flags: { emailFirstCheckout: true },
        data: {
          customer: { ...GUEST, email: 'alex_smith@next.co.uk', signedIn: false },
          progress: { section: 'details', done: [] },
        },
        note: 'An unrecognised email drops straight into Your Details — no second email field.',
      },
      {
        id: 'verified',
        label: 'Signed in — chip at rest',
        flags: { emailFirstCheckout: true, savedPayment: true },
        data: {
          customer: { ...GUEST, email: 'alex_smith@next.co.uk', signedIn: true },
          delivery: { method: 'home', addressKnown: true },
          payment: { method: 'saved', savedCard: 'Visa ending 4567' },
          progress: { section: 'payment', done: ['details', 'delivery'] },
        },
      },
    ],
  },
  {
    id: 'sections',
    name: 'Checkout sections',
    screen: 'checkout',
    description: 'The one-pager with each section open in turn, then complete.',
    versions: [
      { id: 'details', label: '1 · Your Details', data: { progress: { section: 'details', done: [] } } },
      { id: 'delivery', label: '2 · Delivery', data: { progress: { section: 'delivery', done: ['details'] }, customer: GUEST } },
      { id: 'payment', label: '3 · Payment', data: { progress: { section: 'payment', done: ['details', 'delivery'] }, customer: GUEST, delivery: { method: 'home', addressKnown: true } } },
      { id: 'complete', label: 'Ready to pay', data: { progress: { section: 'complete', done: ['details', 'delivery', 'payment'] }, customer: GUEST, delivery: { method: 'home', addressKnown: true } } },
      // The scamp's row 2: matched inside an OPEN Your Details, sign-in offered
      // in place. The account-matched flow now arrives with the section already
      // complete, so this state only exists here — keep it, it's a real option
      // for how a match could be handled.
      {
        id: 'matched-inline',
        label: '1 · Matched, sign in here',
        data: {
          progress: { section: 'details', done: [] },
          customer: { email: 'alex_smith@next.co.uk', signedIn: false },
          auth: { treatment: 'inline' },
        },
      },
    ],
  },
  {
    id: 'delivery',
    name: 'Delivery method',
    screen: 'checkout',
    description: 'Home, collection and parcel shop, plus manual address entry.',
    versions: [
      { id: 'home', label: 'Home delivery', data: { progress: { section: 'delivery', done: ['details'] }, delivery: { method: 'home' } } },
      { id: 'collection', label: 'Collection', data: { progress: { section: 'delivery', done: ['details'] }, delivery: { method: 'collection' } } },
      { id: 'parcel', label: 'Parcel shop', data: { progress: { section: 'delivery', done: ['details'] }, delivery: { method: 'parcel' } } },
      { id: 'home-only', label: 'Home only', flags: { collectionOptions: false }, data: { progress: { section: 'delivery', done: ['details'] } } },
      { id: 'manual', label: 'Manual address entry', flags: { addressLookup: false }, data: { progress: { section: 'delivery', done: ['details'] } } },
    ],
  },
  {
    id: 'payment',
    name: 'Payment',
    screen: 'checkout',
    description: 'New card, saved card, and the credit options.',
    versions: [
      { id: 'new-card', label: 'New card', flags: { savedPayment: false }, data: { progress: { section: 'payment', done: ['details', 'delivery'] } } },
      { id: 'saved-card', label: 'Saved card', flags: { savedPayment: true }, data: { progress: { section: 'payment', done: ['details', 'delivery'] }, payment: { savedCard: 'Visa ending 4567' } } },
      { id: 'no-credit', label: 'Without credit options', flags: { creditOptions: false }, data: { progress: { section: 'payment', done: ['details', 'delivery'] } } },
    ],
  },
  {
    id: 'confirmation',
    name: 'Order complete',
    screen: 'confirmation',
    description: 'What we offer once the order is placed.',
    versions: [
      { id: 'guest', label: 'Guest — create an account', flags: { guestRegistration: true, passkeyUpsell: false } },
      { id: 'passkey', label: 'Signed in — save a passkey', flags: { guestRegistration: false, passkeyUpsell: true } },
      { id: 'plain', label: 'No upsell', flags: { guestRegistration: false, passkeyUpsell: false } },
    ],
  },
];
