import { useEffect, useId, useRef, useState, type ChangeEvent } from 'react';
import { useProjectRuntime } from '../../../../studio/runtime';
import { Button } from '../../../../components/Button';
import { Checkbox } from '../../../../components/Checkbox';
import { useCheckoutConfig } from '../../checkoutConfig';
import { FormField } from '../../components/FormField';
import { useSeededState } from '../useSeededState';

/** The Continue button holds a brief loading state before advancing, so the
 *  press registers and bridges into the section's landing transition. */
const CONTINUE_MS = 650;

/**
 * 1. Your Details — the guest name form.
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
 * A recognised shopper never reaches this form: the identity step (the sign-in
 * page, or the in-checkout email step) verifies them and fills their details
 * from the account first. This is only ever the guest's own typing — and where
 * the email step precedes it, this renders as the "not recognised" branch of
 * IdentityStep with the email already captured, so the email field is hidden and
 * only carried through on submit.
 */
export function DetailsSection({ onContinue }: { onContinue?: () => void }) {
  const { customer, flags } = useCheckoutConfig();
  const { interactive, nav } = useProjectRuntime();

  const seed = `${customer.email}|${customer.firstName}|${customer.lastName}`;
  const [form, setForm] = useSeededState(seed, () => ({
    email: customer.email ?? '',
    firstName: customer.firstName ?? '',
    lastName: customer.lastName ?? '',
    password: customer.password ?? '',
  }));
  const set = (key: keyof typeof form) => (e: ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  // Every required field must be filled before the section can close. Errors
  // stay hidden until the shopper tries to continue — flagging a name field as
  // wrong before they've reached it is nagging, not helping.
  const [tried, setTried] = useSeededState(seed, () => false);

  // Email-first (page or in-checkout) captures the address before this form, so
  // this section neither asks for it again nor validates it — it just carries the
  // value through on submit.
  const emailFirst = flags.emailFirstCheckout || flags.guestIdentityStep;
  const emailValid = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email);
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
          value={form.password}
          onChange={set('password')}
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
