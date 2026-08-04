import { useProjectRuntime } from '../../../studio/runtime';
import { cartTotals, money } from '../cart';
import { AppleMark } from './parts';
import './ApplePaySheet.css';

/**
 * Apple Pay sheet — the express-payment path.
 *
 * A mock of the native iOS Apple Pay sheet, reached from the sign-in screen's
 * "Buy with Apple Pay" button. Deliberately NOT brand-tokened: this is the
 * operating system's own surface, so it uses its own system-style chrome and
 * sits over a dimmed backdrop. Confirming (the side-button double-click) places
 * the order; the ✕ or backdrop cancels back to sign-in.
 */
export function ApplePaySheet() {
  const { interactive, nav, brand } = useProjectRuntime();
  const { total } = cartTotals();

  const cancel = interactive ? () => nav.goTo('signin') : undefined;
  const pay = interactive ? () => nav.goTo('confirmation') : undefined;

  return (
    <div className="applepay">
      <button className="applepay__scrim" aria-label="Cancel" onClick={cancel} />

      <section className="applepay__sheet" role="dialog" aria-modal="true" aria-label="Apple Pay">
        <div className="applepay__grabber" aria-hidden="true" />

        <header className="applepay__head">
          <span className="applepay__wordmark">
            <AppleMark size={20} /> Pay
          </span>
          <button className="applepay__close" aria-label="Cancel" onClick={cancel}>
            ✕
          </button>
        </header>

        <button className="applepay__card" type="button">
          <span className="applepay__card-art">VISA</span>
          <span className="applepay__card-text">
            <span className="applepay__card-name">Visa Debit</span>
            <span className="applepay__card-num">•••• 4567</span>
          </span>
          <span className="applepay__chev" aria-hidden="true">›</span>
        </button>

        <dl className="applepay__rows">
          <div className="applepay__row">
            <dt>Pay to</dt>
            <dd>{brand.name}</dd>
          </div>
          <div className="applepay__row">
            <dt>Deliver to</dt>
            <dd>53 Carlton Road, Long Eaton, Nottingham, NG10 3LF</dd>
          </div>
          <div className="applepay__row">
            <dt>Contact</dt>
            <dd>luke_bell@next.co.uk</dd>
          </div>
        </dl>

        <div className="applepay__total">
          <span>Pay {brand.name}</span>
          <span className="applepay__amount">{money(total)}</span>
        </div>

        <button className="applepay__confirm" type="button" onClick={pay}>
          <span className="applepay__sidebtn" aria-hidden="true" />
          Double-Click to Pay
        </button>
      </section>
    </div>
  );
}
