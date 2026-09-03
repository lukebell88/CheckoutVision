import type { ReactNode } from 'react';
import { Divider } from '../../../components/Divider';
import { Link } from '../../../components/Link';

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
 * The legal fine print under the pay button. Body 2 copy with the policy links
 * as Body 4 (the design-system Link's default text style), a company line, and
 * the payment-consent note below a divider.
 */
export function PaymentLegal() {
  return (
    <div className="co-paylegal">
      <p className="co-paylegal__p">
        We will request payment for the full amount on completion of your order. By selecting a
        payment option you confirm that you have read, understood and accept our{' '}
        <Link href="#">Terms &amp; Conditions</Link>, <Link href="#">Returns Policy</Link> and{' '}
        <Link href="#">Privacy Policy</Link>.
      </p>
      <p className="co-paylegal__p">
        Next Online is a trading name of Next Retail Ltd, Leicester LE19 4AT
      </p>
      <Divider className="co-paylegal__divider" />
      <p className="co-paylegal__p">
        * By proceeding with your payment, you agree to the{' '}
        <Link href="#">Terms and Conditions</Link>. To find out how we process your personal data
        please see our <Link href="#">Privacy and Cookie Policy</Link>.
      </p>
    </div>
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
export function ApplePayButton({ onClick, outline }: { onClick?: () => void; outline?: boolean }) {
  return (
    <button
      type="button"
      className={`co-express${outline ? ' co-express--outline' : ''}`}
      onClick={onClick}
    >
      Buy with <AppleMark /> Pay
    </button>
  );
}

/**
 * The PayPal wordmark, inline.
 *
 * Deliberately NOT `<Icon name="payment-paypal">`: that file clips its artwork
 * with `clip-path="url(#a)"`, and the other payment logos inlined on the page
 * define their own `clipPath id="a"`. The browser resolves `url(#a)` to the
 * FIRST match in the document, so the wordmark gets clipped to a narrower
 * logo's bounds. Inlined here without the clip (which only bounded the full
 * viewBox), it renders in full — the same reason AppleMark is inlined.
 */
export function PayPalMark({ height = 20 }: { height?: number }) {
  return (
    <svg height={height} viewBox="0 0 50 12" fill="none" aria-hidden="true" style={{ width: 'auto' }}>
      <path fill="#2790C3" fillRule="evenodd" d="M38.447 5.23c-.149.976-.893.976-1.615.976h-.41l.289-1.823a.227.227 0 0 1 .224-.192h.187c.49 0 .954 0 1.194.28.143.168.186.416.133.759h-.002Zm-.314-2.548h-2.72a.377.377 0 0 0-.374.319l-1.1 6.974a.227.227 0 0 0 .225.262h1.395a.265.265 0 0 0 .263-.223l.312-1.977a.377.377 0 0 1 .373-.319h.861c1.791 0 2.826-.867 3.096-2.585.121-.752.004-1.341-.347-1.755-.387-.454-1.073-.694-1.982-.694l-.002-.002Z" clipRule="evenodd" />
      <path fill="#27346A" fillRule="evenodd" d="M19.05 5.23c-.15.976-.894.976-1.616.976h-.41l.29-1.823a.227.227 0 0 1 .223-.192h.188c.49 0 .954 0 1.194.28.143.168.185.416.133.759h-.002Zm-.315-2.548h-2.72a.377.377 0 0 0-.374.319l-1.099 6.974a.227.227 0 0 0 .224.262h1.299a.377.377 0 0 0 .373-.318l.296-1.882a.377.377 0 0 1 .373-.319h.862c1.79 0 2.825-.867 3.095-2.585.122-.752.005-1.341-.346-1.755-.388-.454-1.073-.694-1.983-.694v-.002Zm6.315 5.052a1.452 1.452 0 0 1-1.47 1.245c-.378 0-.68-.121-.876-.351-.193-.228-.264-.553-.204-.916a1.457 1.457 0 0 1 1.46-1.252c.37 0 .67.123.87.355.2.234.278.56.22.921v-.002ZM26.865 5.2h-1.303a.228.228 0 0 0-.224.192l-.056.365-.091-.131c-.282-.41-.91-.547-1.539-.547-1.438 0-2.668 1.091-2.906 2.62-.125.763.052 1.493.484 2 .397.469.964.662 1.64.662 1.16 0 1.803-.744 1.803-.744l-.059.361a.227.227 0 0 0 .224.262h1.174a.377.377 0 0 0 .373-.318l.704-4.457a.227.227 0 0 0-.224-.263V5.2Z" clipRule="evenodd" />
      <path fill="#2790C3" fillRule="evenodd" d="M44.447 7.734a1.452 1.452 0 0 1-1.47 1.245c-.377 0-.68-.121-.875-.351-.194-.228-.264-.553-.204-.916a1.457 1.457 0 0 1 1.46-1.252c.37 0 .67.123.867.355.2.234.279.56.22.921l.002-.002ZM46.263 5.2H44.96a.228.228 0 0 0-.224.192l-.057.365-.09-.131c-.283-.41-.912-.547-1.54-.547-1.437 0-2.667 1.091-2.905 2.62-.125.763.052 1.493.483 2 .398.469.965.662 1.64.662 1.16 0 1.803-.744 1.803-.744l-.058.361a.227.227 0 0 0 .224.262h1.171a.377.377 0 0 0 .374-.318l.703-4.457a.227.227 0 0 0-.224-.263l.003-.002Z" clipRule="evenodd" />
      <path fill="#27346A" fillRule="evenodd" d="M33.8 5.2h-1.308a.38.38 0 0 0-.313.165l-1.805 2.66-.764-2.555a.38.38 0 0 0-.361-.27h-1.287a.227.227 0 0 0-.214.3l1.442 4.23-1.355 1.912c-.107.15 0 .357.185.357h1.307c.123 0 .24-.06.311-.163l4.352-6.283a.226.226 0 0 0-.185-.355" clipRule="evenodd" />
      <path fill="#2790C3" fillRule="evenodd" d="m47.797 2.876-1.115 7.101a.227.227 0 0 0 .224.262h1.123a.377.377 0 0 0 .373-.318l1.102-6.974a.227.227 0 0 0-.224-.263h-1.257a.228.228 0 0 0-.224.192" clipRule="evenodd" />
      <path fill="#27346A" fillRule="evenodd" d="m5.196 11.506.365-2.317.025-.13a.484.484 0 0 1 .16-.288.472.472 0 0 1 .31-.115h.29a5.34 5.34 0 0 0 1.32-.153c.42-.109.793-.278 1.11-.502.335-.238.617-.547.837-.916.232-.39.404-.86.506-1.394.093-.471.11-.895.053-1.258a1.886 1.886 0 0 0-.438-.97 1.88 1.88 0 0 0-.528-.408h-.004v-.008c.074-.472.07-.865-.008-1.204A2.14 2.14 0 0 0 8.697.91c-.526-.597-1.482-.9-2.84-.9h-3.73a.526.526 0 0 0-.519.442L.058 10.3a.31.31 0 0 0 .306.359h2.313v.01l-.161 1.008a.272.272 0 0 0 .268.313h1.94a.456.456 0 0 0 .452-.385l.018-.1" clipRule="evenodd" />
      <path fill="#27346A" fillRule="evenodd" d="M3.865 3.062a.468.468 0 0 1 .462-.396h2.924c.347 0 .67.022.964.07a4.433 4.433 0 0 1 .478.106c.039.01.075.022.111.034.146.048.28.105.404.171.147-.933 0-1.569-.507-2.143-.556-.634-1.56-.906-2.845-.906h-3.73a.533.533 0 0 0-.526.45L.047 10.3a.32.32 0 0 0 .317.369h2.301l1.2-7.607Z" clipRule="evenodd" />
      <path fill="#2790C3" fillRule="evenodd" d="M9.208 3.05c-.012.07-.024.143-.039.217-.492 2.525-2.174 3.399-4.324 3.399H3.75a.531.531 0 0 0-.524.45l-.72 4.56a.28.28 0 0 0 .276.322h1.94c.23 0 .426-.167.462-.393l.018-.1.365-2.318.025-.13a.466.466 0 0 1 .461-.393h.29c1.88 0 3.353-.764 3.784-2.973.18-.923.087-1.694-.389-2.234a1.863 1.863 0 0 0-.53-.41" clipRule="evenodd" />
      <path fill="#1F264F" fillRule="evenodd" d="M8.693 2.844a2.78 2.78 0 0 0-.232-.059 3.123 3.123 0 0 0-.246-.046 5.997 5.997 0 0 0-.964-.07H4.327a.469.469 0 0 0-.462.395l-.621 3.94-.018.115a.53.53 0 0 1 .524-.45h1.095c2.15 0 3.832-.873 4.324-3.398.015-.074.027-.147.039-.218a2.608 2.608 0 0 0-.515-.205" clipRule="evenodd" />
    </svg>
  );
}

/**
 * The PayPal CTA — the wallet's gold pill carrying only the PayPal logo, shown
 * as the pay button when PayPal is the chosen method.
 */
export function PayPalButton({ onClick }: { onClick?: () => void }) {
  return (
    <button type="button" className="co-paypalbtn" onClick={onClick} aria-label="Pay with PayPal">
      <PayPalMark />
    </button>
  );
}
