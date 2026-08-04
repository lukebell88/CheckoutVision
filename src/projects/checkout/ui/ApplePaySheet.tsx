import { useProjectRuntime } from '../../../studio/runtime';
import { cartTotals, money } from '../cart';
import { AppleMark } from './parts';
import './ApplePaySheet.css';

/**
 * Apple Pay sheet — the express-payment path.
 *
 * A mock of the native iOS Apple Pay sheet, opened by a "Buy with Apple Pay"
 * button. It is an OVERLAY, not a screen: it renders on top of whatever page
 * invoked it (sign-in or checkout), which stays mounted and dimmed behind the
 * scrim — closing returns there with nothing to re-render.
 *
 * Deliberately NOT brand-tokened: this is the operating system's own surface,
 * so it mirrors the real sheet's chrome — the "⍺ Pay" wordmark, a card row with
 * the artwork and masked number, the "Other Cards & Pay Later Options" row, the
 * "Pay <merchant>" total with an info affordance, and the "Confirm with Side
 * Button" prompt with the side-button glyph and the double-click rail on the
 * backdrop. Confirming places the order; the ✕ or backdrop dismisses the sheet.
 */
export function ApplePaySheet() {
  const { interactive, nav, brand } = useProjectRuntime();
  const { total } = cartTotals();

  // Closing just clears the overlay flag — the page underneath is still there.
  const cancel = interactive ? () => nav.patch('overlay', { applePay: false }) : undefined;
  const pay = interactive
    ? () => {
        nav.patch('overlay', { applePay: false });
        nav.goTo('confirmation');
      }
    : undefined;

  return (
    <div className="applepay">
      <button className="applepay__scrim" aria-label="Cancel" onClick={cancel} />

      {/* The iOS hint drawn on the backdrop next to the physical side button. */}
      <div className="applepay__rail" aria-hidden="true">
        <span className="applepay__rail-text">
          Double-Click
          <br />
          to Pay
        </span>
        <span className="applepay__rail-bar" />
      </div>

      <section className="applepay__sheet" role="dialog" aria-modal="true" aria-label="Apple Pay">
        <header className="applepay__head">
          <span className="applepay__wordmark">
            <AppleMark size={27} />
            Pay
          </span>
          <button className="applepay__close" aria-label="Cancel" onClick={cancel}>
            <svg width="15" height="15" viewBox="0 0 15 15" aria-hidden="true">
              <path
                d="M1 1l13 13M14 1L1 14"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </header>

        <button className="applepay__card" type="button">
          <span className="applepay__card-art">
            <span className="applepay__card-stripe" />
            <span className="applepay__card-visa">VISA</span>
          </span>
          <span className="applepay__card-name">Visa Debit</span>
          <span className="applepay__card-num">
            <span className="applepay__dots">••••</span> 4567
          </span>
        </button>

        <button className="applepay__more" type="button">
          <span>Other Cards &amp; Pay Later Options</span>
          <span className="applepay__chev" aria-hidden="true">›</span>
        </button>

        <div className="applepay__pay">
          <span className="applepay__pay-to">Pay {brand.name}</span>
          <span className="applepay__amount">{money(total)}</span>
          <span className="applepay__info" aria-hidden="true">i</span>
        </div>

        <button className="applepay__confirm" type="button" onClick={pay}>
          <span className="applepay__sidebtn" aria-hidden="true">
            <svg width="46" height="46" viewBox="0 0 46 46" fill="none">
              <circle cx="23" cy="23" r="21" stroke="#0a84ff" strokeWidth="1.4" />
              <rect x="30.5" y="15" width="4" height="16" rx="2" fill="#0a84ff" />
              <path
                d="M27.5 23H15.5M20 18l-5 5 5 5"
                stroke="#0a84ff"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <span className="applepay__confirm-text">Confirm with Side Button</span>
        </button>
      </section>
    </div>
  );
}
