import type { ReactNode } from 'react';
import { Divider } from '../../../components/Divider';
import { Link } from '../../../components/Link';
import { Icon } from '../../../components/Icon';

/**
 * Small shared pieces of checkout chrome.
 *
 * Everything visual here composes a Fabric component or a theme token — nothing
 * invents its own colour or type scale. Where the design system has no
 * equivalent (a divider with a word in it, a screen title bar) the wrapper is
 * thin and the styling lives in checkout.css against `--global-*` tokens.
 */

/** A rule with a word in it. The design system's Divider has no label slot. */
export function OrRule({ children = 'OR' }: { children?: ReactNode }) {
  return (
    <div className="co-or">
      <Divider />
      <span className="co-or__word">{children}</span>
      <Divider />
    </div>
  );
}

/** The T&Cs paragraph under express payment. */
export function LegalNote() {
  return (
    <p className="co-legal">
      By proceeding with your payment, you agree to the <Link href="#">Terms &amp; Conditions</Link>. To
      find out how we process your personal data please see our <Link href="#">Privacy &amp; Cookie Policy</Link>
    </p>
  );
}

/**
 * The Apple mark, inline.
 *
 * Deliberately NOT `<Icon category="common" brand="payment">`: that folder is
 * ~750 KB (464 KB gzipped) and loads as one chunk, so referencing a single logo
 * would put it on the critical path for every tester on a phone. See the payload
 * note in CLAUDE.md — this is the exact trap it describes.
 */
export function AppleMark({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M16.4 12.8c0-2.3 1.9-3.4 2-3.5-1.1-1.6-2.8-1.8-3.4-1.8-1.4-.1-2.8.9-3.5.9s-1.8-.9-3-.8c-1.5 0-2.9.9-3.7 2.3-1.6 2.7-.4 6.8 1.1 9 .8 1.1 1.7 2.3 2.9 2.3 1.2 0 1.6-.7 3-.7s1.8.7 3 .7c1.2 0 2-1.1 2.8-2.2.9-1.3 1.2-2.5 1.3-2.6-.1 0-2.5-1-2.5-3.6zM14.2 5.9c.6-.8 1.1-1.9 1-3-.9 0-2.1.6-2.8 1.4-.6.7-1.1 1.8-1 2.9 1 .1 2.1-.5 2.8-1.3z" />
    </svg>
  );
}

/**
 * The Apple Pay CTA — the black "Buy with  Pay" button the wallet uses. Shown
 * as the pay button when Apple Pay is the chosen method (and as the express
 * option at the top of the email-first block).
 */
export function ApplePayButton({ onClick }: { onClick?: () => void }) {
  return (
    <button type="button" className="co-express" onClick={onClick}>
      Buy with <AppleMark /> Pay
    </button>
  );
}

/**
 * The PayPal CTA — the wallet's gold pill carrying only the PayPal logo, shown
 * as the pay button when PayPal is the chosen method. The logo lives in the
 * common/payment set, which the payment section already loads for its method
 * marks, so referencing it here adds nothing to the critical path.
 */
export function PayPalButton({ onClick }: { onClick?: () => void }) {
  return (
    <button type="button" className="co-paypalbtn" onClick={onClick} aria-label="Pay with PayPal">
      <Icon name="payment-paypal" category="common" brand="payment" className="co-paypalbtn__logo" />
    </button>
  );
}
