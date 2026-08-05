import { useEffect, useRef, useState } from 'react';
import { Link } from '../../../components/Link';
import { FormField } from '../components/FormField';
import { Spinner } from '../components/Spinner';
import { OtpInput } from './OtpInput';

/**
 * "Confirm it's you" — the verification step for a recognised shopper.
 *
 * One method is shown at a time (passcode by default), with a switcher offering
 * the other two. Because the three methods share a layout, switching shows a
 * brief skeleton rather than a jump — see the Figma "Sign In Methods" states.
 * Passkey is special: after the skeleton it shows a spinner, standing in for the
 * OS passkey prompt, then resolves.
 *
 * Presentation + local flow only. Success is reported through `onVerified`; the
 * caller decides what "signed in" means (reveal the checkout sections, etc.).
 */
type Method = 'passcode' | 'password' | 'passkey';

const SKELETON_MS = 350;
/** How long the passkey spinner shows before it resolves (the OS prompt). */
const PASSKEY_MS = 1400;

const LABEL: Record<Method, string> = {
  passcode: 'Text me a code',
  password: 'Use password',
  passkey: 'Use a passkey',
};

/** Mask a phone the way the design does: "+44 •••• •••908". */
function maskPhone(phone?: string): string {
  const tail = (phone ?? '07000000908').replace(/\D/g, '').slice(-3);
  return `+44 •••• •••${tail}`;
}

function MethodIcon({ method }: { method: Method }) {
  if (method === 'passcode') {
    // Phone
    return (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <rect x="6" y="2" width="8" height="16" rx="2" stroke="currentColor" strokeWidth="1.4" />
        <line x1="9" y1="15" x2="11" y2="15" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    );
  }
  if (method === 'password') {
    // Padlock
    return (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <rect x="4" y="9" width="12" height="8" rx="2" stroke="currentColor" strokeWidth="1.4" />
        <path d="M7 9V6.5a3 3 0 0 1 6 0V9" stroke="currentColor" strokeWidth="1.4" />
      </svg>
    );
  }
  // Key (passkey)
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="7" cy="7" r="3.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M9.5 9.5L16 16M13 13l1.5-1.5M15 15l1.5-1.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export interface ConfirmIdentityProps {
  phone?: string;
  interactive?: boolean;
  onVerified?: () => void;
}

export function ConfirmIdentity({ phone, interactive = true, onVerified }: ConfirmIdentityProps) {
  const [method, setMethod] = useState<Method>('passcode');
  const [switching, setSwitching] = useState(false);
  const [code, setCode] = useState('');
  const timers = useRef<number[]>([]);

  const clearTimers = () => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  };
  useEffect(() => clearTimers, []);

  const verify = () => {
    if (interactive) onVerified?.();
  };

  const switchTo = (next: Method) => {
    if (!interactive || next === method) return;
    clearTimers();
    setCode('');
    setSwitching(true);
    timers.current.push(
      window.setTimeout(() => {
        setMethod(next);
        setSwitching(false);
      }, SKELETON_MS),
    );
  };

  // Passkey resolves on its own once its spinner is showing (the OS prompt).
  useEffect(() => {
    if (method !== 'passkey' || switching || !interactive) return;
    const t = window.setTimeout(verify, PASSKEY_MS);
    timers.current.push(t);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [method, switching, interactive]);

  const others = (['passcode', 'password', 'passkey'] as Method[]).filter((m) => m !== method);

  return (
    <section className="co-confirm" aria-label="Confirm it's you">
      <h3 className="co-confirm__title">Confirm it’s you</h3>

      {switching ? (
        <div className="co-confirm__skeleton" aria-hidden="true">
          <span className="co-skel co-skel--line" />
          <span className="co-skel co-skel--field" />
          <span className="co-skel co-skel--link" />
        </div>
      ) : method === 'passcode' ? (
        <>
          <p className="co-confirm__sub">
            Enter the code sent to <strong>{maskPhone(phone)}</strong> to securely sign in.
          </p>
          <OtpInput
            value={code}
            onChange={(v) => {
              setCode(v);
              if (v.length === 6) verify();
            }}
          />
          <p className="co-confirm__action">
            <Link href="#">Re-send Code</Link>
          </p>
        </>
      ) : method === 'password' ? (
        <>
          <p className="co-confirm__sub">Enter your password to sign in.</p>
          <FormField
            label="Password"
            hideLabel
            type="password"
            placeholder="Password"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                verify();
              }
            }}
          />
          <p className="co-confirm__action">
            <Link href="#">Reset Your Password</Link>
          </p>
        </>
      ) : (
        <>
          <p className="co-confirm__sub">Follow the steps in the prompt to securely sign in.</p>
          <div className="co-confirm__passkey">
            <Spinner size={34} label="Waiting for passkey" />
          </div>
        </>
      )}

      <div className="co-confirm__switch">
        <button type="button" className="co-confirm__method" onClick={() => switchTo(others[0])}>
          <MethodIcon method={others[0]} />
          <span>{LABEL[others[0]]}</span>
        </button>
        <span className="co-confirm__sep" aria-hidden="true" />
        <button type="button" className="co-confirm__method" onClick={() => switchTo(others[1])}>
          <MethodIcon method={others[1]} />
          <span>{LABEL[others[1]]}</span>
        </button>
      </div>
    </section>
  );
}
