import { useId, type ChangeEvent } from 'react';
import { useProjectRuntime } from '../../../../studio/runtime';
import { Button } from '../../../../components/Button';
import { Checkbox } from '../../../../components/Checkbox';
import { Link } from '../../../../components/Link';
import { useCheckoutConfig } from '../../checkoutConfig';
import { OrRule } from '../parts';
import { FormField } from '../../components/FormField';
import { useSeededState } from '../useSeededState';

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
 * The other interesting state is `auth.treatment === 'inline'`: the shopper typed
 * an email we recognise, so sign-in is offered right here rather than bouncing
 * them to a sign-in page. That in-place upgrade is the whole point of the scamp's
 * "Account Matched" row — losing it to a redirect would lose the idea.
 */
export function DetailsSection({ onContinue }: { onContinue?: () => void }) {
  const { customer, auth, flags } = useCheckoutConfig();
  const { interactive, nav } = useProjectRuntime();
  const matched = auth.treatment === 'inline' && !customer.signedIn;

  const seed = `${customer.email}|${customer.firstName}|${customer.lastName}`;
  const [form, setForm] = useSeededState(
    seed,
    () => ({
      email: customer.email ?? '',
      firstName: customer.firstName ?? '',
      lastName: customer.lastName ?? '',
    }),
  );
  const set = (key: keyof typeof form) => (e: ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  // Every required field must be filled before the section can close. Errors
  // stay hidden until the shopper tries to continue — flagging a name field as
  // wrong before they've reached it is nagging, not helping.
  const [tried, setTried] = useSeededState(seed, () => false);

  const emailValid = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email);
  const errors: Partial<Record<keyof typeof form, string>> = {
    email: !form.email.trim()
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

  const submit = () => {
    if (firstInvalid) {
      setTried(true);
      // Send them to the first thing that needs fixing rather than leaving them
      // to find it — the same reason the sign-in screen focuses its email.
      document.getElementById(fieldId(firstInvalid))?.focus();
      return;
    }
    if (interactive) nav.patch('customer', form);
    onContinue?.();
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

      {matched && (
        <div className="co-matched">
          <p className="co-matched__lede">Looks like you already have an account with us</p>
          <Button
            variant="contained"
            color="primary"
            size="large"
            fullWidth
            onClick={interactive ? () => nav.goTo('otp') : undefined}
          >
            Sign in with one time passcode
          </Button>
          <p className="co-help">
            We’ll send you a one time passcode via text message and email that will allow you to sign in
          </p>

          <OrRule />

          <FormField label="Password" hideLabel type="password" placeholder="Enter your password" />
          <p className="co-help">
            <Link href="#">Forgotten password</Link>
          </p>
          <Button variant="contained" color="primary" size="large" fullWidth onClick={submit}>
            Sign in
          </Button>
        </div>
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

      <Button variant="contained" color="primary" size="large" fullWidth onClick={submit}>
        Continue
      </Button>
    </>
  );
}
