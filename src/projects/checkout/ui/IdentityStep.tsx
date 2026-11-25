import { useId, useState } from 'react';
import { useProjectRuntime } from '../../../studio/runtime';
import { Button } from '../../../components/Button';
import { Icon } from '../../../components/Icon';
import { useCheckoutConfig } from '../checkoutConfig';
import { FormField } from '../components/FormField';
import { Spinner } from '../components/Spinner';
import { ConfirmIdentity } from './ConfirmIdentity';
import { DetailsSection } from './sections/DetailsSection';
import { OrRule, ApplePayButton, LegalNote } from './parts';
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
  const { customer, flags, choices, journey } = useCheckoutConfig();
  const { interactive, nav } = useProjectRuntime();
  const emailId = useId();
  const [touched, setTouched] = useState(false);

  const locked = ef.phase === 'locked';
  const formatError = touched && ef.email.trim().length > 0 && !ef.valid;

  // The guest form must open with a BLANK email — the shopper chose to skip it.
  // The field is editable, so the browser would otherwise autofill the saved
  // address (and the auto-commit would lock it in). Keep it read-only until the
  // shopper focuses it — a read-only field is never autofilled — and drop the
  // `autocomplete="email"` hint. Normal flows keep their autofill.
  const [guestEmailArmed, setGuestEmailArmed] = useState(false);

  // "Checkout As Guest" is offered while editing the email (toggle on). Tapping it
  // page-refreshes into the guest form (email before name, domain-based match) —
  // the same handoff the login step uses. Once in guest mode the button and the
  // express/sign-in chrome are gone; it's just the guest form.
  const guestButton = choices.guestButton === 'on';
  const guestMode = !!journey.guestChosen;
  const onCheckoutAsGuest =
    interactive
      ? () => {
          nav.patch('journey', { guestChosen: true });
          nav.goTo('loading');
        }
      : undefined;

  return (
    <>
      {/* Live region: the auto-commit has no button, so each step is spoken. */}
      <p className="co-sr-only" role="status">
        {ef.status}
      </p>

      {locked ? (
        <div className="co-emailfield">
          <span className="co-emailfield__value">{ef.email}</span>
          {ef.checking ? (
            // While the account is checked, the right of the input shows a
            // spinner — the same loading language as the skeleton below it.
            <span className="co-emailfield__spinner">
              <Spinner size={20} label="Checking your email address" />
            </span>
          ) : (
            <button
              type="button"
              className="co-emailfield__clear"
              aria-label="Change email address"
              onClick={interactive ? ef.onChangeEmail : undefined}
            >
              <Icon name="clear" size={24} />
            </button>
          )}
        </div>
      ) : (
        <FormField
          id={emailId}
          label="Email address"
          hideLabel
          type="email"
          inputMode="email"
          autoComplete={guestMode ? 'off' : 'email'}
          value={ef.email}
          readOnly={!interactive || (guestMode && !guestEmailArmed)}
          onFocus={() => setGuestEmailArmed(true)}
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
            preSend={flags.softLogin}
            passwordFirst={flags.passwordLogin}
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
          <div className="co-fadein co-emailgate__guest">
            <DetailsSection onContinue={onGuestContinue} />
          </div>
        ))}

      {/* Express is offered only while editing the email — and not when the
          sign-in page already carries it (guestIdentityStep), to avoid repeating
          the Apple Pay button in checkout. Gone once "Checkout As Guest" is taken:
          the guest form stands alone. The "Checkout As Guest" button sits above
          Apple Pay, so the heading drops "payment" to cover both options. */}
      {!locked && !guestMode && flags.expressPayment && !flags.guestIdentityStep && (
        <div className="co-emailgate__express">
          <OrRule />
          <p className="co-guest__title">
            Check out now with express{guestButton ? '' : ' payment'}
          </p>
          {guestButton && (
            <Button
              variant="outlined"
              color="primary"
              size="large"
              fullWidth
              className="co-guestbtn"
              onClick={onCheckoutAsGuest}
            >
              Checkout As Guest
            </Button>
          )}
          <ApplePayButton
            onClick={interactive ? () => nav.patch('overlay', { applePay: true }) : undefined}
          />
          <LegalNote />
        </div>
      )}
    </>
  );
}
