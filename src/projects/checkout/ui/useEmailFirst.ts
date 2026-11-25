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
  /** Text for the block's `role="status"` region — the auto-commit has no button. */
  status: string;
  onInput: (v: string) => void;
  onBlur: () => void;
  onEnter: () => void;
  onChangeEmail: () => void;
  onVerified: () => void;
}

/** The domain a "Checkout As Guest" email is (fake-)matched to an account on, and
 *  the matched account's phone — so the inline "Confirm it's you" step reads like
 *  a real match (the signed-in handoff then fills the rest from the account). */
const MATCH_DOMAIN = '@gmail.com';
const MATCH_PHONE = '07784141908';

export function useEmailFirst(): EmailFirst {
  const { flags, customer, journey } = useCheckoutConfig();
  const { interactive, nav } = useProjectRuntime();

  // The in-checkout email step runs both when the sign-in page is dropped
  // (emailFirstCheckout) and when a sign-in-page flow sends its guest route
  // through the same step (guestIdentityStep).
  const active = !!flags.emailFirstCheckout || !!flags.guestIdentityStep;

  // In guest mode ("Checkout As Guest") recognition is decided by the email the
  // shopper types — a @gmail.com address is a (fake) account match — rather than
  // by the flow's prefilled `recognised`. Computed from the committed value so it
  // can't disagree with what the shopper sees.
  const guestMode = !!journey.guestChosen;
  const isRecognised = (val: string) =>
    guestMode ? EMAIL_RE.test(val.trim()) && val.trim().toLowerCase().endsWith(MATCH_DOMAIN) : !!customer.recognised;

  const verified = !!customer.signedIn;
  const locked = !!customer.email;
  const recognised = isRecognised(locked ? customer.email ?? '' : '');
  const phase: EmailPhase = locked ? 'locked' : 'editing';

  // The editable text resets when the scenario changes (flow/variant switch).
  // Keyed on the FLOW's recognised (not the derived one), so typing in guest mode
  // — which flips recognition — doesn't reset the field mid-entry.
  const seed = `${active}|${customer.email ?? ''}|${customer.signedIn ? 1 : 0}|${customer.recognised ? 1 : 0}|${guestMode ? 1 : 0}`;
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
    // A guest-mode @gmail.com match adopts the fake account's phone so the verify
    // step's masked number isn't blank.
    nav.patch('customer', {
      email: value.trim(),
      ...(guestMode && isRecognised(value) ? { phone: MATCH_PHONE } : {}),
    });
    check.current = window.setTimeout(() => {
      setChecking(false);
      // An unrecognised email's account check runs on Auth0 too, so hand off to
      // the Next checkout now (a guest doesn't verify). A recognised account
      // verifies first and hands off from onVerified instead. In guest mode the
      // shopper is already on the guest page, so an unrecognised address just
      // reveals the name fields inline — no further refresh.
      const q = new URLSearchParams(window.location.search);
      const live = q.get('live') === '1' || q.get('mode') === 'live';
      if (live && !guestMode && !isRecognised(value)) nav.goTo('loading');
    }, CHECK_MS);
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
    // On a live link the login → checkout handoff is a real cross-domain redirect
    // (Auth0 → Next): blank the page and reload into the signed-in checkout — see
    // LoadingHandoff. In the studio it reveals the authenticated checkout inline.
    const q = new URLSearchParams(window.location.search);
    if (q.get('live') === '1' || q.get('mode') === 'live') nav.goTo('loading');
  };

  const status = checking
    ? 'Checking your email address'
    : locked && recognised && !verified
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
    status,
    onInput,
    onBlur,
    onEnter,
    onChangeEmail,
    onVerified,
  };
}
