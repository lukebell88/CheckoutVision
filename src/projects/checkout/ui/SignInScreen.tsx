import { useId, useState } from 'react';
import { useProjectRuntime } from '../../../studio/runtime';
import { Button } from '../../../components/Button';
import { TextField } from '../../../components/TextField';
import { Link } from '../../../components/Link';
import { useCheckoutConfig } from '../checkoutConfig';
import { TitleBar } from '../components/TitleBar';
import { LegalNote, OrRule, AppleMark } from './parts';
import { FormField } from '../components/FormField';

/**
 * Sign / Register — the fork every journey starts at.
 *
 * One screen, five faces, chosen by the flow's `auth.treatment`. That's the axis
 * the scamp's middle three rows exist to compare, so it belongs in one component
 * where the differences are readable side by side rather than in five near-copies.
 *
 *   none           · email capture + guest + express pay (the default entry)
 *   chooser        · "Hi Alex" — one-time code recommended, password secondary
 *   password-first · password above the fold for keychain autofill, OTP below
 *   otp-first      · passcode boxes lead, password underneath
 */
export function SignInScreen() {
  const { flags, customer, auth } = useCheckoutConfig();
  const { interactive, nav } = useProjectRuntime();

  const go = (id: string) => (interactive ? () => nav.goTo(id) : undefined);
  const back = interactive ? nav.back : undefined;

  // Email capture, with submit-time validation. Deliberately not validated as
  // you type: the complaint here is "you haven't filled this in", which isn't
  // true until you try to move on.
  const emailId = useId();
  const [emailInput, setEmailInput] = useState('');
  const [emailMissing, setEmailMissing] = useState(false);

  const continueWithEmail = () => {
    if (!emailInput.trim()) {
      setEmailMissing(true);
      // Take the shopper to the problem. `role="alert"` on the message announces
      // it; focus is what makes it reachable without hunting up the page.
      document.getElementById(emailId)?.focus();
      return;
    }
    // Carry it forward so Your Details opens with the address already in it —
    // asking twice for something they just typed is its own kind of error.
    if (interactive) {
      nav.patch('customer', { email: emailInput.trim() });
      nav.goTo('checkout');
    }
  };
  const treatment = auth.treatment ?? 'none';
  const email = customer.email ?? 'alex_smith@next.co.uk';
  const masked = email.replace(/^(.{4}).*(@.*)$/, '$1*******$2');

  if (treatment === 'chooser') {
    return (
      <main className="co-screen co-screen--narrow">
        <TitleBar title="Sign / Register" onBack={back} />

        <h2 className="co-lede">Hi {customer.firstName ?? 'Alex'}</h2>
        <p className="co-lede__sub">Sign in securely without entering your password</p>

        <div className="co-method">
          <span className="co-method__flag">Recommended</span>
          <div className="co-method__head">
            <span className="co-method__badge">1234</span>
            <div>
              <div className="co-method__title">Sign in with one-time code</div>
              <div className="co-method__meta">We’ll send it to {masked}</div>
            </div>
          </div>
          <Button variant="contained" color="primary" size="large" fullWidth onClick={go('otp')}>
            Send my code
          </Button>
        </div>

        <OrRule />

        <div className="co-method">
          <div className="co-method__head">
            <span className="co-method__badge">••••</span>
            <div>
              <div className="co-method__title">Sign in with your password</div>
              <div className="co-method__meta">Use your existing account password</div>
            </div>
          </div>
          <Button variant="outlined" color="secondary" size="large" fullWidth onClick={go('checkout')}>
            Use password
          </Button>
        </div>

        <p className="co-centre">
          <Link href="#">Use different account</Link>
        </p>
      </main>
    );
  }

  if (treatment === 'password-first' || treatment === 'otp-first') {
    const otpFirst = treatment === 'otp-first';
    return (
      <main className="co-screen co-screen--narrow">
        <TitleBar title="Sign in" onBack={back} />

        <h2 className="co-lede">Great, we have found an account for this email address</h2>
        <p className="co-lede__sub">
          {otpFirst
            ? 'Please enter your one time passcode or password below'
            : 'Please enter your password below or use one time passcode'}
        </p>

        <div className="co-emailrow">
          <TextField size="large" defaultValue={email} readOnly />
          <Button variant="outlined" color="secondary" size="large">
            Change
          </Button>
        </div>

        {otpFirst ? (
          <>
            <p className="co-field__label">Please enter your one time passcode below</p>
            <OtpBoxes />
            <p className="co-help">
              Didn’t receive anything <Link href="#">Resend code</Link>
            </p>
            <OrRule />
            <FormField label="Password" type="password" placeholder="Enter your password" />
            <p className="co-help">
              <Link href="#">Forgotten password</Link>
            </p>
            <Button variant="contained" color="primary" size="large" fullWidth onClick={go('checkout')}>
              Continue
            </Button>
          </>
        ) : (
          <>
            <FormField label="Password" type="password" value="Summer2026!" />
            <p className="co-help">
              <Link href="#">Forgotten password</Link>
            </p>
            <Button variant="contained" color="primary" size="large" fullWidth onClick={go('checkout')}>
              Continue
            </Button>
            <Button variant="outlined" color="secondary" size="large" fullWidth onClick={go('checkout')}>
              Sign in with passkey
            </Button>
            <OrRule />
            <Button variant="outlined" color="secondary" size="large" fullWidth onClick={go('otp')}>
              Sign in with one time passcode
            </Button>
            <p className="co-help">
              We’ll send you a one time passcode via text message and email that will allow you to sign in
            </p>
          </>
        )}
      </main>
    );
  }

  // Default: email capture, guest, express payment.
  return (
    <main className="co-screen co-screen--narrow">
      <TitleBar title="Sign / Register" onBack={back} />

      <h2 className="co-lede">Enter your email address to continue</h2>
      <p className="co-lede__sub">We’ll check if you already have an account</p>

      <FormField
        id={emailId}
        label="Email address"
        hideLabel
        type="email"
        placeholder="you@example.com"
        value={emailInput}
        onChange={(e) => {
          setEmailInput(e.target.value);
          // Stop complaining the moment they start fixing it.
          if (emailMissing) setEmailMissing(false);
        }}
        status={emailMissing ? 'error' : 'default'}
        message={emailMissing ? 'Enter your email address to continue.' : undefined}
      />

      <Button variant="contained" color="primary" size="large" fullWidth onClick={continueWithEmail}>
        Continue
      </Button>

      <OrRule />

      <div className="co-guest">
        <Button variant="outlined" color="secondary" size="large" fullWidth onClick={go('checkout')}>
          Checkout as a guest
        </Button>

        {flags.expressPayment && (
          <>
            <p className="co-guest__title">Checkout now with express payment</p>
            <button type="button" className="co-express" onClick={go('confirmation')}>
              Buy with <AppleMark /> Pay
            </button>
          </>
        )}

        <LegalNote />
      </div>
    </main>
  );
}

/** Six passcode boxes. Presentational — the scamp shows them pre-filled or empty. */
export function OtpBoxes({ code }: { code?: string }) {
  const chars = (code ?? '').padEnd(6, ' ').slice(0, 6).split('');
  return (
    <div className="co-otp" role="group" aria-label="One-time passcode">
      {chars.map((c, i) => (
        <span key={i} className="co-otp__box">
          {c.trim()}
        </span>
      ))}
    </div>
  );
}
