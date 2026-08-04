import { useEffect, useRef, useState } from 'react';
import { useProjectRuntime } from '../../../studio/runtime';
import { Link } from '../../../components/Link';
import { Button } from '../../../components/Button';
import { useCheckoutConfig } from '../checkoutConfig';
import { TitleBar } from '../components/TitleBar';

/**
 * One-time passcode entry.
 *
 * The boxes are backed by a real input so the device's own keyboard comes up —
 * `autocomplete="one-time-code"` lets iOS/Android offer the code from the SMS or
 * email natively, which is the whole concept: the shopper barely types. The push
 * notification slides in from the top like an iOS banner and dismisses itself.
 */
export function OtpScreen() {
  const { customer } = useCheckoutConfig();
  const { interactive, nav } = useProjectRuntime();
  const phoneTail = (customer.phone ?? '07777771234').slice(-4);

  const [code, setCode] = useState('');

  return (
    <main className="co-screen co-screen--narrow">
      {/* The OS notification arriving — a banner over everything that slides in
          from the top and slides back out on its own. Decorative. */}
      <div className="co-push" aria-hidden="true">
        <span className="co-push__icon" />
        <div className="co-push__body">
          <div className="co-push__title">
            <strong>Next</strong>
            <span>now</span>
          </div>
          <div className="co-push__text">Your one time passcode 123456</div>
        </div>
      </div>

      <TitleBar title="Sign in" onBack={interactive ? nav.back : undefined} />

      <h2 className="co-lede">
        We have sent you a 6-digit code to your email and an SMS to the number ending in {phoneTail}
      </h2>
      <p className="co-lede__sub">Enter the code within 15 minutes to sign in</p>

      <OtpInput value={code} onChange={setCode} />

      <p className="co-help">
        Didn’t receive anything <Link href="#">Resend code</Link> or try{' '}
        <Link href="#">Forgotten password</Link>
      </p>

      <Button
        variant="contained"
        color="primary"
        size="large"
        fullWidth
        onClick={interactive ? () => nav.goTo('checkout') : undefined}
      >
        Continue
      </Button>
    </main>
  );
}

/**
 * Six passcode boxes backed by one real input. The input is transparent and sits
 * over the boxes: tapping anywhere focuses it (raising the native keyboard) and
 * the digits render in the boxes as they're typed or autofilled. It auto-focuses
 * on mount so the keyboard is up straight away where the OS allows it.
 */
const LENGTH = 6;

export function OtpInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const ref = useRef<HTMLInputElement>(null);
  const chars = value.padEnd(LENGTH, ' ').slice(0, LENGTH).split('');

  useEffect(() => {
    ref.current?.focus();
  }, []);

  return (
    <div className="co-otp" onClick={() => ref.current?.focus()}>
      <input
        ref={ref}
        className="co-otp__field"
        type="text"
        inputMode="numeric"
        autoComplete="one-time-code"
        maxLength={LENGTH}
        // eslint-disable-next-line jsx-a11y/no-autofocus
        autoFocus
        aria-label="One-time passcode"
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, '').slice(0, LENGTH))}
      />
      {chars.map((c, i) => (
        <span key={i} className={`co-otp__box ${i === value.length ? 'co-otp__box--active' : ''}`}>
          {c.trim()}
        </span>
      ))}
    </div>
  );
}
