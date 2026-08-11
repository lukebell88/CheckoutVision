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
export type ChoiceId = 'paymentPresentation';

/** How the Payment step presents itself. */
export type PaymentPresentation =
  | 'preferred' // a remembered card, collapsed with a Change link
  | 'standard' // the full method list, a sensible default selected
  | 'none' // the full method list, nothing selected (an unknown shopper)
  | 'nextpay' // a single "Complete With Nextpay" CTA
  | 'payin3'; // a single "Complete With Pay In 3" CTA

export interface ChoiceDef extends ProjectChoice {
  id: ChoiceId;
  options: { value: PaymentPresentation; label: string }[];
  default: PaymentPresentation;
}

export const CHOICES: ChoiceDef[] = [
  {
    id: 'paymentPresentation',
    name: 'Payment presentation',
    description: 'How the Payment step is shown — a remembered card, the full list, or a single credit CTA.',
    group: 'Payment',
    options: [
      { value: 'preferred', label: 'Preferred card' },
      { value: 'standard', label: 'Standard list' },
      { value: 'none', label: 'Nothing selected' },
      { value: 'nextpay', label: 'Nextpay only' },
      { value: 'payin3', label: 'Pay In 3 only' },
    ],
    default: 'standard',
  },
];

/** Checkout's narrowed view of the studio's generic choice state. */
export type ChoiceState = Record<ChoiceId, string> & { paymentPresentation: PaymentPresentation };
