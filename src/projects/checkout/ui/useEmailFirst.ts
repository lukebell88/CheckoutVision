import { useEffect, useRef } from 'react';
import { useProjectRuntime } from '../../../studio/runtime';
import { useCheckoutConfig } from '../checkoutConfig';
import { useSeededState } from './useSeededState';

/**
 * The email-first entry state machine.
 *
 * With `emailFirstCheckout` on, the sign-in page is gone and the one-pager owns
 * the email step: the shopper types their address at the top, and — with no
 * Continue button — a valid entry auto-commits on a short pause, on blur, or on
 * Enter. A spinner covers the "are you a known account?" check, then the email
 * locks to a chip. A recognised email reveals an inline passcode step; everyone
 * else drops straight into the numbered sections.
 *
 * State lives in three seeded values (phase, email, verified). Every real
 * transition is a `nav.patch` to the customer bucket, which re-seeds them — so
 * the machine has one source of truth and can't drift from the data a summary
 * or the sections read. The only purely-local step is the transient `validating`
 * window, which shows while the check timer runs before the email is committed.
 */
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
/** Auto-commit once the address has been valid and idle this long. */
const DEBOUNCE_MS = 800;
/** How long the "checking your account" spinner shows before the email locks. */
const CHECK_MS = 900;

export type EmailPhase = 'editing' | 'validating' | 'locked';

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
  /** Locked + recognised + not yet verified: show the inline passcode step. */
  showVerify: boolean;
  /** Reveal the numbered checkout sections. */
  sectionsVisible: boolean;
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

  // Re-seed whenever the scenario changes (flow/variant switch, or our own
  // commit/verify patches). Email presence drives the resting phase, so a
  // switched-in flow lands in the right state without an effect.
  const seed = `${active}|${customer.email ?? ''}|${customer.signedIn ? 1 : 0}|${recognised ? 1 : 0}`;
  const [email, setEmail] = useSeededState(seed, () => customer.email ?? '');
  const [phase, setPhase] = useSeededState<EmailPhase>(seed, () =>
    customer.email ? 'locked' : 'editing',
  );
  const [verified] = useSeededState(seed, () => !!customer.signedIn);

  const debounce = useRef<number | undefined>(undefined);
  const check = useRef<number | undefined>(undefined);
  const clearTimers = () => {
    if (debounce.current) window.clearTimeout(debounce.current);
    if (check.current) window.clearTimeout(check.current);
  };
  useEffect(() => clearTimers, []);

  const valid = EMAIL_RE.test(email.trim());

  // Run the check: show the spinner, then commit the email — the patch re-seeds
  // the phase to `locked`, so there's no second setPhase to keep in sync.
  const startCheck = (value: string) => {
    if (!interactive || !EMAIL_RE.test(value.trim())) return;
    clearTimers();
    setPhase('validating');
    check.current = window.setTimeout(() => {
      nav.patch('customer', { email: value.trim() });
    }, CHECK_MS);
  };

  const onInput = (v: string) => {
    setEmail(v);
    if (!interactive || phase !== 'editing') return;
    if (debounce.current) window.clearTimeout(debounce.current);
    if (EMAIL_RE.test(v.trim())) {
      debounce.current = window.setTimeout(() => startCheck(v), DEBOUNCE_MS);
    }
  };

  const onBlur = () => {
    if (interactive && valid && phase === 'editing') startCheck(email);
  };
  const onEnter = () => {
    if (interactive && valid && phase === 'editing') startCheck(email);
  };

  // Change is a full reset: clearing the address invalidates any match, so the
  // sections re-collapse and the shopper starts from an empty field.
  const onChangeEmail = () => {
    if (!interactive) return;
    clearTimers();
    nav.patch('customer', { email: '', signedIn: false });
  };

  const onVerified = () => {
    if (!interactive) return;
    nav.patch('customer', { signedIn: true });
  };

  const showVerify = active && phase === 'locked' && recognised && !verified;
  const sectionsVisible = !active || (phase === 'locked' && (verified || !recognised));

  const status =
    phase === 'validating'
      ? 'Checking your email address'
      : showVerify
        ? 'We found your account. Enter the passcode we sent you.'
        : phase === 'locked'
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
    showVerify,
    sectionsVisible,
    status,
    onInput,
    onBlur,
    onEnter,
    onChangeEmail,
    onVerified,
  };
}
