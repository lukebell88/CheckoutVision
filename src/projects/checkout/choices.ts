import type { ProjectChoice } from '../../studio/project';

/**
 * Enum-control registry — the multi-way counterpart to flags.ts.
 *
 * A choice is for a setting whose options are mutually exclusive, where a set of
 * booleans would allow nonsense combinations. Payment presentation is the first:
 * "Nextpay only" and "Pay In 3 only" and the standard list can't coexist, so
 * they're one enum, not three toggles.
 *
 * The scenario tray and any studio sidebar render these generically from the
 * declaration, so the studio never learns what the values mean — checkout reads
 * `choices[id]` and maps it, exactly as it does with flags.
 */
export type ChoiceId = 'paymentPresentation' | 'paymentLogos' | 'billingAddress' | 'guestButton';

/** How the Payment step presents itself. */
export type PaymentPresentation =
  | 'preferred' // a remembered card, collapsed with a Change link
  | 'applepay' // a remembered Apple Pay wallet, collapsed with its own button
  | 'paypal' // a remembered PayPal wallet, collapsed with its own button
  | 'standard' // the full method list, a sensible default selected
  | 'none' // the full method list, nothing selected (an unknown shopper)
  | 'nextpay' // a single "Complete With Nextpay" CTA
  | 'payin3'; // a single "Complete With Pay In 3" CTA

/** Whether each Payment row carries its scheme / wallet logo on the right. */
export type PaymentLogos = 'shown' | 'hidden';

/** Whether the payment methods collect a billing address (Collection / Parcel
 *  Shop orders have no delivery address to bill to). */
export type BillingAddress = 'on' | 'off';

/** Whether the Your Details page offers a "Checkout As Guest" button. */
export type GuestButton = 'on' | 'off';

export interface ChoiceDef extends ProjectChoice {
  id: ChoiceId;
}

export const CHOICES: ChoiceDef[] = [
  {
    id: 'paymentPresentation',
    name: 'Payment presentation',
    description: 'How the Payment step is shown — a remembered card, the full list, or a single credit CTA.',
    group: 'Payment',
    options: [
      { value: 'preferred', label: 'Preferred card' },
      { value: 'applepay', label: 'Apple Pay' },
      { value: 'paypal', label: 'PayPal' },
      { value: 'standard', label: 'Standard list' },
      { value: 'none', label: 'Nothing selected' },
      { value: 'nextpay', label: 'Nextpay only' },
      { value: 'payin3', label: 'Pay In 3 only' },
    ],
    default: 'standard',
  },
  {
    id: 'paymentLogos',
    name: 'Show payment logos',
    description: 'Show the scheme / wallet logo on the right of each Payment method. Hidden for a signed-in shopper on Nextpay.',
    group: 'Payment',
    options: [
      { value: 'shown', label: 'Shown' },
      { value: 'hidden', label: 'Hidden' },
    ],
    default: 'shown',
  },
  {
    id: 'billingAddress',
    name: 'Billing address at payment',
    description: 'Collect a billing address on Card, Apple Pay, PayPal and Gift Card — for an Unknown User collecting to a store (Collection / Parcel Shop), who has no delivery address. When collecting, the card drops its “Use Delivery Address as Billing Address” checkbox and asks for billing directly.',
    group: 'Payment',
    options: [
      { value: 'off', label: 'Off' },
      { value: 'on', label: 'On' },
    ],
    default: 'off',
  },
  {
    id: 'guestButton',
    name: 'Guest button',
    description: 'Offer a “Checkout As Guest” button on Your Details (above Apple Pay). It page-refreshes into a guest form where the email is captured before the name; a @gmail.com address triggers a (fake) account match.',
    group: 'Account',
    options: [
      { value: 'off', label: 'Off' },
      { value: 'on', label: 'On' },
    ],
    default: 'off',
  },
];

/** Checkout's narrowed view of the studio's generic choice state. */
export type ChoiceState = {
  paymentPresentation: PaymentPresentation;
  paymentLogos: PaymentLogos;
  billingAddress: BillingAddress;
  guestButton: GuestButton;
};
