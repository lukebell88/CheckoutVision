import { useEffect, useId, useRef, useState, type ChangeEvent } from 'react';
import { useProjectRuntime } from '../../../../studio/runtime';
import { Button } from '../../../../components/Button';
import { Checkbox } from '../../../../components/Checkbox';
import { Icon } from '../../../../components/Icon';
import { useCheckoutConfig } from '../../checkoutConfig';
import { FormField } from '../../components/FormField';
import { Spinner } from '../../components/Spinner';
import { ConfirmIdentity } from '../ConfirmIdentity';
import { CHECK_MS } from '../useEmailFirst';
import { useSeededState } from '../useSeededState';

/** The Continue button holds a brief loading state before advancing, so the
 *  press registers and bridges into the section's landing transition. */
const CONTINUE_MS = 650;

/**
 * 1. Your Details.
 *
 * Fields start with whatever the runtime knows and nothing more. For a guest
 * that's nothing — we haven't met them — so the section opens blank with
 * placeholders. Substituting sample data here would turn the guest journey into
 * a demo of a returning customer, which is the one thing it isn't.
 *
 * What gets typed is held locally and written back to the `customer` bucket on
 * Continue, so the collapsed summary shows the shopper's own details rather than
 * a fixture. In an inert runtime (the canvas) `patch` is a no-op and the section
 * renders whatever the flow or variant configured.
 *
 * A recognised shopper is usually handled before they ever reach this section —
 * the sign-in step (or the email-first block) verifies them and fills their
 * details from the account. The exception is `guestAccountMatch`: a shopper who
 * took the guest route, then enters an email that turns out to match an account.
 * The guest form stays put until the email commits; if it's recognised the form
 * gives way to the inline "Confirm it's you" passcode, and on verify the account
 * fills Details + Delivery and the journey lands on Payment (via onAccountVerified).
 *
 * When email-first has already captured the address up top, the email field here
 * is hidden and only carried through on submit.
 */
export function DetailsSection({
  onContinue,
  onAccountVerified,
}: {
  onContinue?: () => void;
  onAccountVerified?: () => void;
}) {
  const { customer, flags } = useCheckoutConfig();
  const { interactive, nav } = useProjectRuntime();

  // With guestAccountMatch the account's details are seeded (so they can fill in
  // on verify) but the shopper is still a guest here, so the form starts blank —
  // otherwise the account's name would pre-fill the "guest" fields.
  const matchable = !!flags.guestAccountMatch;
  const seed = `${customer.email}|${customer.firstName}|${customer.lastName}|${matchable}`;
  const [form, setForm] = useSeededState(
    seed,
    () =>
      matchable
        ? { email: '', firstName: '', lastName: '' }
        : {
            email: customer.email ?? '',
            firstName: customer.firstName ?? '',
            lastName: customer.lastName ?? '',
          },
  );

  // The account-match reveal: once a recognised email commits we show a brief
  // "checking" beat (spinner on the locked email), then the passcode step in
  // place of the guest fields.
  const [matched, setMatched] = useSeededState(seed, () => false);
  const [checking, setChecking] = useState(false);
  const matchTimer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(matchTimer.current), []);
  const set = (key: keyof typeof form) => (e: ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  // Every required field must be filled before the section can close. Errors
  // stay hidden until the shopper tries to continue — flagging a name field as
  // wrong before they've reached it is nagging, not helping.
  const [tried, setTried] = useSeededState(seed, () => false);

  // Email-first captures the address at the top of the page, so this section
  // neither asks for it again nor validates it — it just carries the value
  // through on submit.
  const emailFirst = flags.emailFirstCheckout;
  const emailValid = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email);

  // guestAccountMatch: a committed, valid email that belongs to an account moves
  // the shopper from the guest form to the passcode step. Recognition is scripted
  // by the flow (`customer.recognised`), as everywhere else in the prototype.
  const canMatch = matchable && !!customer.recognised && interactive;
  const tryMatch = () => {
    if (!canMatch || !emailValid || matched) return;
    // Don't commit the email to the store here — it's part of the seed, so a
    // patch would re-seed (and clear) this section's local state mid-reveal. The
    // typed email lives in `form` until verify; it's written on verify below.
    setMatched(true);
    setChecking(true);
    window.clearTimeout(matchTimer.current);
    matchTimer.current = window.setTimeout(() => setChecking(false), CHECK_MS);
  };
  const resetMatch = () => {
    window.clearTimeout(matchTimer.current);
    setMatched(false);
    setChecking(false);
  };
  // On verify, commit the typed email (so the summary shows it) and hand off to
  // the returning-customer path, which signs them in and jumps to Payment.
  const handleVerified = () => {
    if (interactive) nav.patch('customer', { email: form.email.trim() });
    onAccountVerified?.();
  };

  const errors: Partial<Record<keyof typeof form, string>> = {
    email: emailFirst
      ? undefined
      : !form.email.trim()
        ? 'Enter your email address to continue.'
        : !emailValid
          ? 'Enter an email address in the format name@example.com'
          : undefined,
    firstName: !form.firstName.trim() ? 'Enter your first name to continue.' : undefined,
    lastName: !form.lastName.trim() ? 'Enter your last name to continue.' : undefined,
  };
  const firstInvalid = (Object.keys(form) as (keyof typeof form)[]).find((k) => errors[k]);

  const ids = useId();
  const fieldId = (k: keyof typeof form) => `${ids}-${k}`;

  // On submit the button shows a spinner and disables for a short beat before the
  // section advances — the press feedback that leads into the landing.
  const [submitting, setSubmitting] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const submit = () => {
    if (submitting) return;
    // Continue with a matching email surfaces the passcode instead of advancing.
    if (canMatch && emailValid && !matched) {
      tryMatch();
      return;
    }
    if (firstInvalid) {
      setTried(true);
      // Send them to the first thing that needs fixing rather than leaving them
      // to find it — the same reason the sign-in screen focuses its email.
      document.getElementById(fieldId(firstInvalid))?.focus();
      return;
    }
    if (!interactive) {
      onContinue?.();
      return;
    }
    nav.patch('customer', form);
    setSubmitting(true);
    timer.current = window.setTimeout(() => onContinue?.(), CONTINUE_MS);
  };

  /**
   * Email is the exception: it validates as you type once you've typed
   * something, because "that isn't an email address" is true immediately. The
   * name fields only complain after a failed submit. `inlineValidation` gates
   * the live behaviour, never the submit check — the flag is about feedback
   * timing, not about whether the form has rules.
   */
  const liveEmail = flags.inlineValidation && form.email.length > 0;
  const showError = (k: keyof typeof form) =>
    !!errors[k] && (tried || (k === 'email' && liveEmail));

  const emailStatus = showError('email')
    ? 'error'
    : liveEmail && emailValid
      ? 'success'
      : 'default';

  // Matched: the guest fields give way to the locked email + the passcode step.
  // A spinner shows on the email while the account is checked; the ✕ returns to
  // the guest form. On verify the account takes over (onAccountVerified).
  if (matchable && matched) {
    return (
      <>
        <div className="co-emailfield">
          <span className="co-emailfield__value">{form.email}</span>
          {checking ? (
            <span className="co-emailfield__spinner">
              <Spinner size={20} label="Checking your email address" />
            </span>
          ) : (
            <button
              type="button"
              className="co-emailfield__clear"
              aria-label="Change email address"
              onClick={interactive ? resetMatch : undefined}
            >
              <Icon name="clear" size={24} />
            </button>
          )}
        </div>
        <div className="co-fadein">
          <ConfirmIdentity
            phone={customer.phone}
            interactive={interactive}
            loading={checking}
            onVerified={handleVerified}
          />
        </div>
      </>
    );
  }

  return (
    <>
      {!emailFirst && (
        <FormField
          id={fieldId('email')}
          label="Email Address"
          required
          type="email"
          placeholder="you@example.com"
          value={form.email}
          onChange={set('email')}
          onBlur={matchable ? tryMatch : undefined}
          onKeyDown={
            matchable
              ? (e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    tryMatch();
                  }
                }
              : undefined
          }
          status={emailStatus}
          message={
            emailStatus === 'error'
              ? errors.email
              : emailStatus === 'success'
                ? 'We’ll send your order confirmation here'
                : undefined
          }
        />
      )}

      <FormField
        id={fieldId('firstName')}
        label="First Name"
        required
        placeholder="First name"
        value={form.firstName}
        onChange={set('firstName')}
        status={showError('firstName') ? 'error' : 'default'}
        message={showError('firstName') ? errors.firstName : undefined}
      />
      <FormField
        id={fieldId('lastName')}
        label="Last Name"
        required
        placeholder="Last name"
        value={form.lastName}
        onChange={set('lastName')}
        status={showError('lastName') ? 'error' : 'default'}
        message={showError('lastName') ? errors.lastName : undefined}
      />

      {!customer.signedIn && (
        <FormField
          label="Password (Optional)"
          type="password"
          // Belongs to the field, not the page. As a hint it becomes the input's
          // `aria-describedby`, so the reason to bother filling in an optional
          // password is announced with it rather than stranded underneath.
          hint={<strong>Checkout Faster Next Time</strong>}
        />
      )}

      <div className="co-optin">
        <Checkbox label="Keep me updated with offers and new arrivals" onChange={() => {}} />
      </div>

      <Button
        variant="contained"
        color="primary"
        size="large"
        fullWidth
        loading={submitting}
        onClick={submit}
      >
        Continue
      </Button>
    </>
  );
}
