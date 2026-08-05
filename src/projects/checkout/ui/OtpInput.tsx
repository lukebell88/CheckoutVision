import { useEffect, useRef } from 'react';

/**
 * Six passcode boxes backed by one real input, split 3 · 3 with a dash between
 * the groups (matching the Figma sign-in design). The input is transparent and
 * sits over the boxes: tapping anywhere focuses it (raising the native keyboard)
 * and the digits render in the boxes as they're typed or autofilled.
 * `autocomplete="one-time-code"` lets iOS/Android offer the SMS/email code
 * natively, which is the whole point — the shopper barely types. It auto-focuses
 * on mount so the keyboard is up straight away where the OS allows it.
 */
const LENGTH = 6;

export function OtpInput({
  value,
  onChange,
  autoFocus = true,
}: {
  value: string;
  onChange: (v: string) => void;
  autoFocus?: boolean;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const chars = value.padEnd(LENGTH, ' ').slice(0, LENGTH).split('');

  useEffect(() => {
    if (autoFocus) ref.current?.focus();
  }, [autoFocus]);

  const box = (i: number) => (
    <span key={i} className={`co-otp__box ${i === value.length ? 'co-otp__box--active' : ''}`}>
      {chars[i].trim()}
    </span>
  );

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
        autoFocus={autoFocus}
        aria-label="One-time passcode"
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, '').slice(0, LENGTH))}
      />
      {[0, 1, 2].map(box)}
      <span className="co-otp__dash" aria-hidden="true" />
      {[3, 4, 5].map(box)}
    </div>
  );
}
