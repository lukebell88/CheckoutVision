import { useProjectRuntime } from '../../studio/runtime';
import type { CheckoutPageId } from './screens';
import { useCheckoutConfig } from './checkoutConfig';
import { SignInScreen } from './ui/SignInScreen';
import { OtpScreen } from './ui/OtpScreen';
import { ApplePaySheet } from './ui/ApplePaySheet';
import { OnePageCheckout } from './ui/OnePageCheckout';
import { Confirmation } from './ui/Confirmation';

/**
 * Screen router.
 *
 * Four screens now, where there used to be nine: the checkout itself is a single
 * page whose sections open in turn, so "which step am I on" is state inside
 * `OnePageCheckout` rather than a route. See screens.ts.
 *
 * Each screen owns its own layout and actions — there is no shared form/summary
 * chrome any more, because the scamp gives the sign-in, the one-pager and the
 * confirmation genuinely different shapes.
 *
 * The Apple Pay sheet is not in this table: it's an overlay rendered ON TOP of
 * the current screen (which stays mounted behind its scrim), driven by the
 * `overlay.applePay` data flag rather than by navigation.
 */
const SCREENS: Record<CheckoutPageId, () => JSX.Element> = {
  signin: SignInScreen,
  otp: OtpScreen,
  checkout: OnePageCheckout,
  confirmation: Confirmation,
};

export function CheckoutPage() {
  const { screen } = useProjectRuntime();
  const { overlay } = useCheckoutConfig();
  const Body = SCREENS[screen as CheckoutPageId] ?? OnePageCheckout;
  return (
    <>
      <Body />
      {overlay.applePay && <ApplePaySheet />}
    </>
  );
}
