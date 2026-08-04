import { useProjectRuntime } from '../../../studio/runtime';
import { Link } from '../../../components/Link';
import { Button } from '../../../components/Button';
import { useCheckoutConfig } from '../checkoutConfig';
import { TitleBar } from '../components/TitleBar';
import { OtpBoxes } from './SignInScreen';

/**
 * One-time passcode entry.
 *
 * The scamp draws this with the push notification still on screen and the code
 * already filled — the point of the concept is that the shopper barely types.
 * Both are reproduced: the notification is a decorative overlay, and the boxes
 * come pre-filled so a walkthrough lands on the "it just worked" moment.
 */
export function OtpScreen() {
  const { customer } = useCheckoutConfig();
  const { interactive, nav } = useProjectRuntime();
  const phoneTail = (customer.phone ?? '07777771234').slice(-4);

  return (
    <main className="co-screen co-screen--narrow">
      {/* Decorative: the OS notification arriving as the shopper waits. */}
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

      <OtpBoxes code="123456" />

      <p className="co-help">
        Didn’t receive anything <Link href="#">Resend code</Link> or try{' '}
        <Link href="#">Forgotten password</Link>
      </p>

      <Button
        variant="contained"
        color="primary"
        size="large"
        fullWidth
        onClick={interactive ? () => nav.goTo('checkout') : undefined}
      >
        Continue
      </Button>

      {/* The keyboard's autofill strip — where the code actually comes from. */}
      <div className="co-keyboard" aria-hidden="true">
        <div className="co-keyboard__suggest">
          <span>from messages</span>
          <strong>123456</strong>
        </div>
      </div>
    </main>
  );
}
