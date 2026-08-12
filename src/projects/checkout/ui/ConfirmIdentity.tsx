import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Icon } from '../../../components/Icon';
import { Button } from '../../../components/Button';
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
 * Structure and every token (Next Display type, #949494 field borders, #eee
 * dividers, Body-3 links, 44px controls, 4/16 spacing) mirror the Figma board;
 * switcher glyphs are the brand's own `secure` / `phone` icons (passkey has no
 * design-system icon, so it's inlined).
 */
type Method = 'passcode' | 'password' | 'passkey';

const SKELETON_MS = 350;
/** How long the passkey spinner shows before it resolves (the OS prompt). */
const PASSKEY_MS = 1400;
/** The "Signing you in…" account-lookup beat after a passcode/password submit. */
const FINALISE_MS = 800;
/** The Send Code button holds a spinner this long before the inputs appear. */
const SEND_MS = 800;

const LABEL: Record<Method, string> = {
  passcode: 'Text me a code',
  password: 'Use password',
  passkey: 'Use a passkey',
};

/** The two alternative methods, in the order the Figma switcher shows them. */
const SWITCH: Record<Method, [Method, Method]> = {
  passcode: ['passkey', 'password'],
  password: ['passkey', 'passcode'],
  passkey: ['passcode', 'password'],
};

/** Mask a phone the way the design does: "+44 •••• •••908". */
function maskPhone(phone?: string): string {
  const tail = (phone ?? '07000000908').replace(/\D/g, '').slice(-3);
  return `+44 •••• •••${tail}`;
}

function MethodIcon({ method }: { method: Method }): ReactNode {
  if (method === 'passcode') return <Icon name="phone" category="feature" size={24} />;
  if (method === 'password') return <Icon name="secure" category="feature" size={24} />;
  // Passkey key — no design-system glyph, so drawn inline to match the Figma key.
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="8.5" cy="8.5" r="4" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M11.4 11.4 19 19M16 16l1.8-1.8M18 18l1.8-1.8"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export interface ConfirmIdentityProps {
  phone?: string;
  interactive?: boolean;
  onVerified?: () => void;
  /** While true, the body shows its skeleton — used as the initial "checking"
   *  state so this reuses the exact loading language of a method switch. */
  loading?: boolean;
  /**
   * Soft-login: the shopper landed recognised but no passcode has been issued,
   * so the passcode step starts with a Send Code button (in the inputs' slot,
   * no re-send) rather than showing the inputs as if a code were already sent.
   */
  preSend?: boolean;
}

export function ConfirmIdentity({
  phone,
  interactive = true,
  onVerified,
  loading = false,
  preSend = false,
}: ConfirmIdentityProps) {
  const [method, setMethod] = useState<Method>('passcode');
  const [switching, setSwitching] = useState(false);
  const [finalising, setFinalising] = useState(false);
  const [code, setCode] = useState('');
  // Whether the passcode has been "sent" — false only while a soft-login shopper
  // hasn't yet tapped Send Code; `sending` holds the button's spinner.
  const [sent, setSent] = useState(!preSend);
  const [sending, setSending] = useState(false);
  const timers = useRef<number[]>([]);

  // The body is a skeleton while the account is being checked (loading) or a
  // method is being switched — one loading treatment for both.
  const skeleton = loading || switching;

  const clearTimers = () => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  };
  useEffect(() => clearTimers, []);

  const verify = () => {
    if (interactive) onVerified?.();
  };

  // A submitted passcode/password isn't instant: it's an account lookup. Show a
  // "Signing you in…" beat so the jump to Payment reads as being signed in,
  // rather than the sections popping open with no feedback. (Passkey has its own
  // OS-prompt spinner and resolves through `verify` directly.)
  const finalise = () => {
    if (!interactive || finalising) return;
    clearTimers();
    setFinalising(true);
    timers.current.push(window.setTimeout(verify, FINALISE_MS));
  };

  // Soft-login Send Code: hold a spinner in the button, then reveal the inputs.
  const sendCode = () => {
    if (!interactive || sending) return;
    setSending(true);
    timers.current.push(
      window.setTimeout(() => {
        setSending(false);
        setSent(true);
      }, SEND_MS),
    );
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
    if (method !== 'passkey' || skeleton || !interactive) return;
    const t = window.setTimeout(verify, PASSKEY_MS);
    timers.current.push(t);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [method, skeleton, interactive]);

  const others = SWITCH[method];

  const sub =
    method === 'passcode' ? (
      <>
        {sent ? 'Enter the code sent to' : 'A code will be sent to'}{' '}
        <strong>{maskPhone(phone)}</strong> by text or email to securely sign in.
      </>
    ) : method === 'password' ? (
      'Enter your password to sign in.'
    ) : (
      'Follow the steps in the prompt to securely sign in.'
    );

  return (
    <section className="co-confirm" aria-label="Confirm it's you">
      <div className="co-confirm__head">
        <h3 className="co-h3">Confirm it’s you</h3>
        {!skeleton && !finalising && <p className="co-confirm__sub">{sub}</p>}
        {finalising && (
          <span className="co-skel co-skel--line" aria-hidden="true" />
        )}
      </div>

      {finalising ? (
        // Keep the passcode layout: a spinner the height of the code boxes where
        // they were, and the rest of the view as skeleton, so the account-lookup
        // reads in place rather than a jump.
        <>
          <div className="co-otp co-otp--finalising" role="status" aria-label="Signing you in">
            <Spinner size={28} label="Signing you in" />
          </div>
          <p className="co-confirm__resend" aria-hidden="true">
            <span className="co-skel co-skel--link" />
          </p>
        </>
      ) : skeleton ? (
        <div className="co-confirm__skeleton" aria-hidden="true">
          <span className="co-skel co-skel--line" />
          <span className="co-skel co-skel--field" />
          <span className="co-skel co-skel--link" />
        </div>
      ) : method === 'passcode' ? (
        !sent ? (
          // Soft-login: the code isn't issued on arrival. A Send Code button sits
          // in the inputs' slot (no re-send) and, on tap, spins then reveals them.
          <div className="co-otp co-otp--send">
            <Button
              variant="contained"
              color="primary"
              size="large"
              fullWidth
              loading={sending}
              onClick={interactive ? sendCode : undefined}
            >
              Send Code
            </Button>
          </div>
        ) : (
          <>
            <OtpInput
              value={code}
              onChange={(v) => {
                setCode(v);
                if (v.length === 6) finalise();
              }}
            />
            <p className="co-confirm__resend">
              <button type="button" className="co-linklabel">
                Re-send Code
              </button>
            </p>
          </>
        )
      ) : method === 'password' ? (
        <>
          <FormField
            label="Password"
            hideLabel
            type="password"
            placeholder="Password"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                finalise();
              }
            }}
          />
          <Button
            variant="contained"
            color="primary"
            size="large"
            fullWidth
            onClick={interactive ? finalise : undefined}
          >
            Sign In
          </Button>
          <p className="co-confirm__resend">
            <button type="button" className="co-linklabel">
              Reset Your Password
            </button>
          </p>
        </>
      ) : (
        <div className="co-confirm__passkey">
          <Spinner size={34} label="Waiting for passkey" />
        </div>
      )}

      <div className="co-confirm__hr" />

      {finalising ? (
        <div className="co-confirm__switch" aria-hidden="true">
          <span className="co-skel co-skel--link" />
          <span className="co-confirm__vdiv" />
          <span className="co-skel co-skel--link" />
        </div>
      ) : (
        <div className="co-confirm__switch">
          <button type="button" className="co-confirm__method" onClick={() => switchTo(others[0])}>
            <MethodIcon method={others[0]} />
            <span className="co-linklabel">{LABEL[others[0]]}</span>
          </button>
          <span className="co-confirm__vdiv" aria-hidden="true" />
          <button type="button" className="co-confirm__method" onClick={() => switchTo(others[1])}>
            <MethodIcon method={others[1]} />
            <span className="co-linklabel">{LABEL[others[1]]}</span>
          </button>
        </div>
      )}
    </section>
  );
}
