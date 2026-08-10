import { useId, useState } from 'react';
import { useProjectRuntime } from '../../../studio/runtime';
import { Icon } from '../../../components/Icon';
import { useCheckoutConfig } from '../checkoutConfig';
import { FormField } from '../components/FormField';
import { ConfirmIdentity } from './ConfirmIdentity';
import { DetailsSection } from './sections/DetailsSection';
import { OrRule, AppleMark, LegalNote } from './parts';
import type { EmailFirst } from './useEmailFirst';

/**
 * Section 1 "Your Details", email-first: the open body of the first step.
 *
 * The section header owns the "1. Your Details" title and the "Enter your email
 * address to continue" subtitle; this renders what sits under it, by state:
 *
 *   editing   · the email field (+ Apple Pay express below)
 *   checking  · the email locked to a chip, and a skeleton for what's coming
 *   recognised· the chip + the inline "Confirm it's you" verify step
 *   guest     · the chip + the name form (DetailsSection, email already captured)
 *
 * When it resolves the step completes: a recognised shopper's account fills
 * Details + Delivery (jump handled by the caller), a guest continues to Delivery.
 */
export function IdentityStep({
  ef,
  onGuestContinue,
  onAccountVerified,
}: {
  ef: EmailFirst;
  onGuestContinue?: () => void;
  onAccountVerified: () => void;
}) {
  const { customer, flags } = useCheckoutConfig();
  const { interactive, nav } = useProjectRuntime();
  const emailId = useId();
  const [touched, setTouched] = useState(false);

  const locked = ef.phase === 'locked';
  const formatError = touched && ef.email.trim().length > 0 && !ef.valid;

  return (
    <>
      {/* Live region: the auto-commit has no button, so each step is spoken. */}
      <p className="co-sr-only" role="status">
        {ef.status}
      </p>

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

      {/* Recognised: the inline verify step (its own skeleton while checking). */}
      {locked && ef.recognised && !ef.verified && (
        <div className="co-fadein">
          <ConfirmIdentity
            phone={customer.phone}
            interactive={interactive}
            loading={ef.checking}
            onVerified={onAccountVerified}
          />
        </div>
      )}

      {/* Guest: the name form fills in after the check (skeleton meanwhile). */}
      {locked && !ef.recognised &&
        (ef.checking ? (
          <div className="co-skelform co-fadein" aria-hidden="true">
            <span className="co-skel co-skel--field" />
            <span className="co-skel co-skel--field" />
          </div>
        ) : (
          <div className="co-fadein">
            <DetailsSection onContinue={onGuestContinue} />
          </div>
        ))}

      {/* Express is offered only while editing the email. */}
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
    </>
  );
}
