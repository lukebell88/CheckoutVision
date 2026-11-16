import { useEffect, useRef, useState, type ChangeEvent, type KeyboardEvent } from 'react';
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
        onClick={interactive ? () => nav.goTo('loading') : undefined}
      >
        Continue
      </Button>
    </main>
  );
}

/**
 * Six passcode boxes, each a real single-character input. Typing a digit
 * advances to the next box and backspace steps back, so it's typeable on
 * desktop; on mobile each box raises the native keyboard, and the first carries
 * `autocomplete="one-time-code"` so the OS can autofill the whole code (a paste
 * or autofill is distributed across the boxes). Auto-focuses the first box.
 */
const LENGTH = 6;

export function OtpInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const chars = value.padEnd(LENGTH, ' ').slice(0, LENGTH).split('').map((c) => (c === ' ' ? '' : c));

  useEffect(() => {
    refs.current[0]?.focus();
  }, []);

  const setAt = (i: number, digits: string) => {
    const arr = [...chars];
    // A single digit fills this box; a paste/autofill of several spreads forward.
    digits.split('').slice(0, LENGTH - i).forEach((d, k) => {
      arr[i + k] = d;
    });
    onChange(arr.join(''));
    const next = Math.min(i + Math.max(digits.length, 1), LENGTH - 1);
    refs.current[next]?.focus();
  };

  const handleChange = (i: number, e: ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, '');
    if (digits) setAt(i, digits);
    else {
      const arr = [...chars];
      arr[i] = '';
      onChange(arr.join(''));
    }
  };

  const handleKeyDown = (i: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !chars[i] && i > 0) {
      e.preventDefault();
      const arr = [...chars];
      arr[i - 1] = '';
      onChange(arr.join(''));
      refs.current[i - 1]?.focus();
    }
  };

  return (
    <div className="co-otp">
      {chars.map((c, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          className="co-otp__box"
          type="text"
          inputMode="numeric"
          autoComplete={i === 0 ? 'one-time-code' : 'off'}
          maxLength={i === 0 ? LENGTH : 1}
          aria-label={`Passcode digit ${i + 1}`}
          value={c}
          onChange={(e) => handleChange(i, e)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onFocus={(e) => e.target.select()}
        />
      ))}
    </div>
  );
}
