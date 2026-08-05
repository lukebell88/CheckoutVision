import { useEffect, useId, useRef, useState } from 'react';
import { useProjectRuntime } from '../../../studio/runtime';
import { Button } from '../../../components/Button';
import { Icon } from '../../../components/Icon';
import { useCheckoutConfig } from '../checkoutConfig';
import { TitleBar } from '../components/TitleBar';
import { FormField } from '../components/FormField';
import { Spinner } from '../components/Spinner';
import { ConfirmIdentity } from './ConfirmIdentity';
import { OrRule, AppleMark, LegalNote } from './parts';
import { useSeededState } from './useSeededState';

/**
 * Sign / Register — the standalone page, when the email-first flag is off.
 *
 * The same idea as the email-first block, as its own screen: an email field
 * that auto-commits (no Continue button — valid fires on pause/blur/Enter), a
 * spinner while the account check runs, then a committed field with a ✕ to
 * change it. A recognised email reveals the inline "Confirm it's you" step
 * (passcode / password / passkey); on success we move to the checkout. A guest
 * gets the "Checkout as a guest" and Apple Pay express paths below.
 *
 * The old per-treatment faces (chooser / password-first / otp-first) are gone —
 * verification is one shared component now (see ConfirmIdentity).
 */
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const DEBOUNCE_MS = 800;
const CHECK_MS = 900;

export function SignInScreen() {
  const { flags, customer } = useCheckoutConfig();
  const { interactive, nav } = useProjectRuntime();
  const recognised = !!customer.recognised;

  const seed = `${customer.email ?? ''}|${customer.signedIn ? 1 : 0}|${recognised ? 1 : 0}`;
  const [email, setEmail] = useSeededState(seed, () => customer.email ?? '');
  const [phase, setPhase] = useSeededState<'editing' | 'validating' | 'locked'>(seed, () =>
    customer.email ? 'locked' : 'editing',
  );
  const [touched, setTouched] = useState(false);
  const emailId = useId();

  const timers = useRef<number[]>([]);
  const clearTimers = () => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  };
  useEffect(() => clearTimers, []);

  const valid = EMAIL_RE.test(email.trim());

  const commit = (value: string) => {
    if (!interactive || !EMAIL_RE.test(value.trim())) return;
    clearTimers();
    setPhase('validating');
    timers.current.push(
      window.setTimeout(() => {
        nav.patch('customer', { email: value.trim() });
        // Guest → straight into checkout. Recognised → the re-seed locks the
        // field and the verification step appears in place.
        if (!recognised) nav.next();
      }, CHECK_MS),
    );
  };

  const onInput = (v: string) => {
    setEmail(v);
    setTouched(false);
    if (!interactive || phase !== 'editing') return;
    clearTimers();
    if (EMAIL_RE.test(v.trim())) timers.current.push(window.setTimeout(() => commit(v), DEBOUNCE_MS));
  };
  const commitNow = () => {
    if (interactive && valid && phase === 'editing') commit(email);
  };
  const onChangeEmail = () => {
    if (!interactive) return;
    clearTimers();
    nav.patch('customer', { email: '', signedIn: false });
  };
  const onVerified = () => {
    if (!interactive) return;
    nav.patch('customer', { signedIn: true });
    nav.next();
  };

  const locked = phase === 'locked';
  const validating = phase === 'validating';
  const formatError = touched && email.trim().length > 0 && !valid;
  const back = interactive ? nav.back : undefined;

  return (
    <main className="co-screen co-screen--narrow">
      <TitleBar title="Sign / Register" onBack={back} />

      <h2 className="co-h3">Enter your email address to continue</h2>

      {locked ? (
        <div className="co-emailfield">
          <span className="co-emailfield__value">{email}</span>
          <button
            type="button"
            className="co-emailfield__clear"
            aria-label="Change email address"
            onClick={interactive ? onChangeEmail : undefined}
          >
            <Icon name="clear" size={24} />
          </button>
        </div>
      ) : (
        <FormField
          id={emailId}
          label="Email address"
          hideLabel
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          readOnly={!interactive || validating}
          onChange={(e) => onInput(e.target.value)}
          onBlur={() => {
            setTouched(true);
            commitNow();
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              commitNow();
            }
          }}
          endIcon={validating ? <Spinner size={18} label="Checking your email address" /> : undefined}
          status={formatError ? 'error' : 'default'}
          message={formatError ? 'Enter an email address in the format name@example.com' : undefined}
        />
      )}

      {recognised && locked && !customer.signedIn && (
        <ConfirmIdentity phone={customer.phone} interactive={interactive} onVerified={onVerified} />
      )}

      {!locked && (
        <>
          <OrRule />

          <div className="co-guest">
            <Button
              variant="outlined"
              color="secondary"
              size="large"
              fullWidth
              onClick={interactive ? () => nav.next() : undefined}
            >
              Checkout as a guest
            </Button>

            {flags.expressPayment && (
              <>
                <p className="co-guest__title">Checkout now with express payment</p>
                <button
                  type="button"
                  className="co-express"
                  onClick={interactive ? () => nav.patch('overlay', { applePay: true }) : undefined}
                >
                  Buy with <AppleMark /> Pay
                </button>
              </>
            )}

            <LegalNote />
          </div>
        </>
      )}
    </main>
  );
}
