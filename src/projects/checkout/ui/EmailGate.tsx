import { useId, useState } from 'react';
import { useProjectRuntime } from '../../../studio/runtime';
import { useCheckoutConfig } from '../checkoutConfig';
import { Button } from '../../../components/Button';
import { Link } from '../../../components/Link';
import { FormField } from '../components/FormField';
import { Chip } from '../components/Chip';
import { Spinner } from '../components/Spinner';
import { OtpInput } from './OtpScreen';
import { OrRule, AppleMark, LegalNote } from './parts';
import type { EmailFirst } from './useEmailFirst';

/**
 * The email-first entry block, at the top of the one-pager.
 *
 * Presentation for the machine in `useEmailFirst`: an email field that
 * auto-commits (no Continue button — a valid address fires on pause, blur or
 * Enter), a spinner while the account check runs, and then a locked chip. A
 * recognised address reveals the inline passcode step (with passkey and password
 * as alternatives); Apple Pay sits below as the email-free express path.
 *
 * `role="status"` narrates each transition, because a keyboard/auto commit has
 * no button press for assistive tech to announce.
 */
export function EmailGate({ ef }: { ef: EmailFirst }) {
  const { flags } = useCheckoutConfig();
  const { interactive, nav } = useProjectRuntime();
  const emailId = useId();
  const [touched, setTouched] = useState(false);
  const [code, setCode] = useState('');

  const locked = ef.phase === 'locked';
  const validating = ef.phase === 'validating';
  const formatError = touched && ef.email.trim().length > 0 && !ef.valid;

  return (
    <section className="co-emailgate" aria-label="Email">
      {/* Live region: the auto-commit has no button, so each step is spoken. */}
      <p className="co-sr-only" role="status">
        {ef.status}
      </p>

      {locked ? (
        <div className="co-emailgate__locked">
          <span className="co-emailgate__locklabel">Email address</span>
          <Chip
            label={ef.email}
            onAction={interactive ? ef.onChangeEmail : undefined}
            actionLabel="Change"
          />
        </div>
      ) : (
        <>
          <h2 className="co-lede">Enter your email address to continue</h2>
          <p className="co-lede__sub">We’ll check if you already have an account</p>

          <FormField
            id={emailId}
            label="Email address"
            hideLabel
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={ef.email}
            readOnly={!interactive || validating}
            onChange={(e) => {
              setTouched(false);
              ef.onInput(e.target.value);
            }}
            onBlur={() => {
              setTouched(true);
              ef.onBlur();
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                ef.onEnter();
              }
            }}
            endIcon={validating ? <Spinner size={18} label="Checking your email address" /> : undefined}
            status={formatError ? 'error' : 'default'}
            message={formatError ? 'Enter an email address in the format name@example.com' : undefined}
          />
        </>
      )}

      {ef.showVerify && (
        <div className="co-emailgate__verify">
          <p className="co-lede__sub">
            We’ve sent a one-time passcode to your email and phone. Enter it below, or use another
            way to sign in.
          </p>

          <OtpInput
            value={code}
            onChange={(v) => {
              setCode(v);
              if (v.length === 6) ef.onVerified();
            }}
          />
          <p className="co-help">
            Didn’t receive anything <Link href="#">Resend code</Link>
          </p>

          <Button
            variant="contained"
            color="primary"
            size="large"
            fullWidth
            onClick={interactive ? ef.onVerified : undefined}
          >
            Continue
          </Button>

          <OrRule />

          <Button
            variant="outlined"
            color="secondary"
            size="large"
            fullWidth
            onClick={interactive ? ef.onVerified : undefined}
          >
            Sign in with passkey
          </Button>

          <FormField label="Password" hideLabel type="password" placeholder="Enter your password" />
          <p className="co-help">
            <Link href="#">Forgotten password</Link>
          </p>
          <Button
            variant="outlined"
            color="secondary"
            size="large"
            fullWidth
            onClick={interactive ? ef.onVerified : undefined}
          >
            Sign in with password
          </Button>
        </div>
      )}

      {!locked && flags.expressPayment && (
        <div className="co-emailgate__express">
          <OrRule />
          <p className="co-guest__title">Check out now with express payment</p>
          <button
            type="button"
            className="co-express"
            onClick={interactive ? () => nav.patch('overlay', { applePay: true }) : undefined}
          >
            Buy with <AppleMark /> Pay
          </button>
          <LegalNote />
        </div>
      )}
    </section>
  );
}
