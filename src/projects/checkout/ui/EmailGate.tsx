import { useId, useState } from 'react';
import { useProjectRuntime } from '../../../studio/runtime';
import { Icon } from '../../../components/Icon';
import { useCheckoutConfig } from '../checkoutConfig';
import { FormField } from '../components/FormField';
import { ConfirmIdentity } from './ConfirmIdentity';
import { OrRule, AppleMark, LegalNote } from './parts';
import type { EmailFirst } from './useEmailFirst';

/**
 * The email-first entry block, at the top of the one-pager.
 *
 * Presentation for the machine in `useEmailFirst`: an email field that
 * auto-commits (no Continue button — a valid address fires on pause, blur or
 * Enter). On commit the email locks to a filled field with a ✕ to change it, and
 * the next step below shows a SKELETON while the account is checked, then fills
 * in — a recognised address resolves to the inline "Confirm it's you" step
 * (passcode / password / passkey). The skeleton reserves the space, so the step
 * fills in place rather than growing against a collapsing block. Apple Pay sits
 * below while editing as the email-free express path.
 *
 * `role="status"` narrates each transition, because a keyboard/auto commit has
 * no button press for assistive tech to announce.
 */
export function EmailGate({ ef }: { ef: EmailFirst }) {
  const { flags, customer } = useCheckoutConfig();
  const { interactive, nav } = useProjectRuntime();
  const emailId = useId();
  const [touched, setTouched] = useState(false);

  const locked = ef.phase === 'locked';
  const formatError = touched && ef.email.trim().length > 0 && !ef.valid;

  return (
    <section className="co-emailgate" aria-label="Email">
      {/* Live region: the auto-commit has no button, so each step is spoken. */}
      <p className="co-sr-only" role="status">
        {ef.status}
      </p>

      <h2 className="co-h3">Enter your email address to continue</h2>

      {locked ? (
        <div className="co-emailfield">
          <span className="co-emailfield__value">{ef.email}</span>
          <button
            type="button"
            className="co-emailfield__clear"
            aria-label="Change email address"
            onClick={interactive ? ef.onChangeEmail : undefined}
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
          value={ef.email}
          readOnly={!interactive}
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
          status={formatError ? 'error' : 'default'}
          message={formatError ? 'Enter an email address in the format name@example.com' : undefined}
        />
      )}

      {/* The verify step fills in below the committed email — it shows its own
          skeleton while `checking`, then the passcode. */}
      {ef.showVerify && (
        <div className="co-fadein">
          <ConfirmIdentity
            phone={customer.phone}
            interactive={interactive}
            onVerified={ef.onVerified}
            loading={ef.checking}
          />
        </div>
      )}

      {/* Express is offered only while editing — once the email commits, the
          next step takes this space. */}
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
