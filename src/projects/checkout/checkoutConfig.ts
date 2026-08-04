import { useProjectRuntime } from '../../studio/runtime';
import type { FlagState } from './flags';
import type { AuthTreatment } from './flows';
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
   * When set to a method id, the payment section shows ONLY a single
   * "Complete With <method>" button instead of the method list — the dedicated
   * nextpay / pay-in-3 journeys.
   */
  only?: string;
}
/** Which section of the one-pager is open, and which are behind us. */
export interface ProgressInfo {
  section?: SectionId | 'complete';
  done?: SectionId[];
}
export interface AuthInfo {
  treatment?: AuthTreatment;
}

export interface CheckoutConfig {
  flags: FlagState;
  customer: CustomerInfo;
  delivery: DeliveryInfo;
  payment: PaymentInfo;
  progress: ProgressInfo;
  auth: AuthInfo;
}

/** The active checkout config for the surrounding rendered instance. */
export function useCheckoutConfig(): CheckoutConfig {
  const rt = useProjectRuntime();
  return {
    flags: rt.flags as FlagState,
    customer: (rt.data.customer ?? {}) as CustomerInfo,
    delivery: (rt.data.delivery ?? {}) as DeliveryInfo,
    payment: (rt.data.payment ?? {}) as PaymentInfo,
    progress: (rt.data.progress ?? {}) as ProgressInfo,
    auth: (rt.data.auth ?? {}) as AuthInfo,
  };
}

/** The section the one-pager should have open, defaulting to the first. */
export const openSection = (p: ProgressInfo): SectionId | 'complete' => p.section ?? 'details';

/** Has this section been completed (so it renders collapsed with a Change link)? */
export const isDone = (p: ProgressInfo, id: SectionId): boolean =>
  (p.done ?? []).includes(id) || p.section === 'complete';
