import { useEffect, useRef, useState } from 'react';
import { useProjectRuntime } from '../../../studio/runtime';
import { useCheckoutConfig } from '../checkoutConfig';
import { useSeededState } from './useSeededState';

/**
 * The email-first entry state machine.
 *
 * With `emailFirstCheckout` on, the sign-in page is gone and the one-pager owns
 * the email step: the shopper types their address at the top, and — with no
 * Continue button — a valid entry auto-commits on a short pause, on blur, or on
 * Enter. The email locks to a chip straight away, and the next step below shows
 * a SKELETON while we "check the account" (the same loading language the method
 * switcher uses), then fills in: a recognised email resolves to the inline
 * passcode step; everyone else drops into the numbered sections.
 *
 * The skeleton reserves the space up front, so the reveal never animates its
 * height against a collapsing block — the jank the grow/collapse version had.
 *
 * `email` (the editable text) is seeded so it resets on a flow/variant switch;
 * the resting phase is derived from whether the committed `customer.email`
 * exists. `checking` is deliberately NOT seeded — it's our own transient window
 * and the commit patch (which changes the seed) must not clear it.
 */
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
/** Auto-commit once the address has been valid and idle this long. */
const DEBOUNCE_MS = 800;
/** How long the "checking your account" skeleton shows before the step fills in. */
export const CHECK_MS = 800;

export type EmailPhase = 'editing' | 'locked';

export interface EmailFirst {
  /** The flag is on — the caller renders the email block and gates its sections. */
  active: boolean;
  interactive: boolean;
  phase: EmailPhase;
  /** Current field text (editing) or the committed address (locked). */
  email: string;
  valid: boolean;
  recognised: boolean;
  verified: boolean;
  /** The account is being checked — the next step shows its skeleton. */
  checking: boolean;
  /** Locked + recognised + not yet verified: show the inline verify step. */
  showVerify: boolean;
  /** Reveal the numbered checkout sections. */
  sectionsVisible: boolean;
  /** Guest, mid-check: show the sections skeleton in their place. */
  sectionsSkeleton: boolean;
  /** Text for the block's `role="status"` region — the auto-commit has no button. */
  status: string;
  onInput: (v: string) => void;
  onBlur: () => void;
  onEnter: () => void;
  onChangeEmail: () => void;
  onVerified: () => void;
}

export function useEmailFirst(): EmailFirst {
  const { flags, customer } = useCheckoutConfig();
  const { interactive, nav } = useProjectRuntime();

  const active = !!flags.emailFirstCheckout;
  const recognised = !!customer.recognised;
  const verified = !!customer.signedIn;
  const locked = !!customer.email;
  const phase: EmailPhase = locked ? 'locked' : 'editing';

  // The editable text resets when the scenario changes (flow/variant switch).
  const seed = `${active}|${customer.email ?? ''}|${customer.signedIn ? 1 : 0}|${recognised ? 1 : 0}`;
  const [email, setEmail] = useSeededState(seed, () => customer.email ?? '');
  const [checking, setChecking] = useState(false);

  const debounce = useRef<number | undefined>(undefined);
  const check = useRef<number | undefined>(undefined);
  const clearTimers = () => {
    if (debounce.current) window.clearTimeout(debounce.current);
    if (check.current) window.clearTimeout(check.current);
  };
  useEffect(() => clearTimers, []);

  const valid = EMAIL_RE.test(email.trim());

  // Commit: lock the email immediately, then hold the checking window so the
  // next step shows its skeleton before filling in.
  const startCheck = (value: string) => {
    if (!interactive || !EMAIL_RE.test(value.trim())) return;
    clearTimers();
    setChecking(true);
    nav.patch('customer', { email: value.trim() });
    check.current = window.setTimeout(() => setChecking(false), CHECK_MS);
  };

  const onInput = (v: string) => {
    setEmail(v);
    if (!interactive || locked) return;
    if (debounce.current) window.clearTimeout(debounce.current);
    if (EMAIL_RE.test(v.trim())) {
      debounce.current = window.setTimeout(() => startCheck(v), DEBOUNCE_MS);
    }
  };

  const onBlur = () => {
    if (interactive && valid && !locked) startCheck(email);
  };
  const onEnter = () => {
    if (interactive && valid && !locked) startCheck(email);
  };

  // Change is a full reset: clearing the address invalidates any match, so the
  // step re-collapses and the shopper starts from an empty field.
  const onChangeEmail = () => {
    if (!interactive) return;
    clearTimers();
    setChecking(false);
    nav.patch('customer', { email: '', signedIn: false });
  };

  const onVerified = () => {
    if (!interactive) return;
    nav.patch('customer', { signedIn: true });
  };

  const showVerify = active && locked && recognised && !verified;
  const sectionsSkeleton = active && locked && !recognised && !verified && checking;
  const sectionsVisible =
    !active || (locked && (verified || (!recognised && !checking)));

  const status = checking
    ? 'Checking your email address'
    : showVerify
      ? 'We found your account. Enter the passcode we sent you.'
      : locked
        ? 'We’ll send your order confirmation to this email.'
        : '';

  return {
    active,
    interactive,
    phase,
    email,
    valid,
    recognised,
    verified,
    checking,
    showVerify,
    sectionsVisible,
    sectionsSkeleton,
    status,
    onInput,
    onBlur,
    onEnter,
    onChangeEmail,
    onVerified,
  };
}
