import { useProjectRuntime } from '../../studio/runtime';
import type { FlagState } from './flags';
import type { ChoiceState, PaymentPresentation } from './choices';
import { CHOICES } from './choices';
import type { SectionId } from './screens';

/**
 * Checkout's typed view of the studio runtime.
 *
 * The studio carries flags as `Record<string, boolean>` and data as opaque
 * buckets — it never looks inside them. This is the one place checkout narrows
 * those back to its own types, so every checkout component below it stays
 * strongly typed and unaware that a studio exists.
 */
export interface CustomerInfo {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  signedIn?: boolean;
  createAccount?: boolean;
  /** The email is recognised as a known account (pre-verification). */
  recognised?: boolean;
}
export interface DeliveryInfo {
  method?: string;
  addressKnown?: boolean;
  store?: string;
  line1?: string;
  line2?: string;
  city?: string;
  postcode?: string;
  date?: string;
}
export interface PaymentInfo {
  /** Method preselected/expanded in the list. '' means none selected. */
  method?: string;
  savedCard?: string;
  promoCode?: string;
  /**
   * A returning shopper's previously-chosen method. When set, the payment
   * section opens collapsed on that method with a Change link (rather than the
   * full list), the way Details and Delivery collapse to a summary.
   */
  preferred?: string;
  /** The preferred card's display label, e.g. "Monzo •••• 1234". */
  card?: string;
  /** The preferred card's scheme logo, e.g. "mastercard" (common/payment icon). */
  scheme?: string;
}
/** Which section of the one-pager is open, and which are behind us. */
export interface ProgressInfo {
  section?: SectionId | 'complete';
  done?: SectionId[];
}
/** Transient overlays that sit ON TOP of the current screen, not beside it. */
export interface OverlayInfo {
  /** The Apple Pay sheet is open over whatever screen invoked it. */
  applePay?: boolean;
}

export interface CheckoutConfig {
  flags: FlagState;
  choices: ChoiceState;
  customer: CustomerInfo;
  delivery: DeliveryInfo;
  payment: PaymentInfo;
  progress: ProgressInfo;
  overlay: OverlayInfo;
}

/** The paymentPresentation default, so a runtime without choices still resolves. */
const PRESENTATION_DEFAULT = CHOICES[0].default;

/** The active checkout config for the surrounding rendered instance. */
export function useCheckoutConfig(): CheckoutConfig {
  const rt = useProjectRuntime();
  const paymentPresentation = (rt.choices?.paymentPresentation ?? PRESENTATION_DEFAULT) as PaymentPresentation;
  return {
    flags: rt.flags as FlagState,
    choices: { paymentPresentation },
    customer: (rt.data.customer ?? {}) as CustomerInfo,
    delivery: (rt.data.delivery ?? {}) as DeliveryInfo,
    payment: (rt.data.payment ?? {}) as PaymentInfo,
    progress: (rt.data.progress ?? {}) as ProgressInfo,
    overlay: (rt.data.overlay ?? {}) as OverlayInfo,
  };
}

/** The section the one-pager should have open, defaulting to the first. */
export const openSection = (p: ProgressInfo): SectionId | 'complete' => p.section ?? 'details';

/** Has this section been completed (so it renders collapsed with a Change link)? */
export const isDone = (p: ProgressInfo, id: SectionId): boolean =>
  (p.done ?? []).includes(id) || p.section === 'complete';
