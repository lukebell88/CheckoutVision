import type { ReactNode } from 'react';
import { Button } from '../../../../components/Button';
import { Link } from '../../../../components/Link';
import './PreferredPayment.css';

/**
 * PreferredPayment — the collapsed entry to the payment step for a returning
 * shopper whose card is remembered.
 *
 * The saved card leads: its scheme logo (boxed) beside the masked number, with
 * an "Add New Card" link beneath it, then the Pay now button. Below the fold sit
 * the quieter alternatives — an OR rule, a "Choose Another Payment Method" button
 * (which reveals the full method list, exactly like the header Change link), and
 * a centred row of the other wallet logos that opens the list on that method.
 *
 * Presentation only — the labels, marks and the pay button are the caller's.
 */
export interface PreferredOther {
  id: string;
  mark: ReactNode;
  /** Optional caption beside the mark (Gift Card has no wordmark logo). */
  label?: string;
}

export interface PreferredPaymentProps {
  /** The remembered card, e.g. "Monzo •••• 1234". */
  cardLabel: string;
  /** The scheme logo shown to the left of the card. */
  cardMark: ReactNode;
  /** The other wallet methods, shown as a row of marks. */
  others: PreferredOther[];
  /** Open the full list on the card form to add a new card. */
  onAddCard?: () => void;
  /** Reveal the full method list (same as the header Change link). */
  onChooseAnother?: () => void;
  /** Open the full list already selected on this method. */
  onSelectOther?: (id: string) => void;
  /** The pay button for the remembered method. */
  pay: ReactNode;
  /** Optional slim promo banner shown below the Choose Another button. */
  banner?: ReactNode;
}

export function PreferredPayment({
  cardLabel,
  cardMark,
  others,
  onAddCard,
  onChooseAnother,
  onSelectOther,
  pay,
  banner,
}: PreferredPaymentProps) {
  return (
    <div className="co-preferred">
      <div className="co-preferred__card">
        <span className="co-preferred__cardmark">{cardMark}</span>
        <div className="co-preferred__cardbody">
          <span className="co-preferred__cardnum">{cardLabel}</span>
          {onAddCard && (
            <Link
              href="#"
              textStyle="body-3"
              className="co-preferred__addcard"
              onClick={(e) => {
                e.preventDefault();
                onAddCard();
              }}
            >
              Add New Card
            </Link>
          )}
        </div>
      </div>

      {pay}

      <div className="co-preferred__or" aria-hidden="true">
        <span className="co-preferred__rule" />
        <span className="co-preferred__word">OR</span>
        <span className="co-preferred__rule" />
      </div>

      <Button
        variant="outlined"
        color="primary"
        size="large"
        fullWidth
        onClick={onChooseAnother}
      >
        Choose Another Payment Method
      </Button>

      {banner}

      <div className="co-preferred__others">
        <div className="co-preferred__othersrow">
          {others.map((o) => (
            <button
              key={o.id}
              type="button"
              className="co-preferred__other"
              aria-label={`Pay with ${o.label ?? o.id}`}
              onClick={() => onSelectOther?.(o.id)}
            >
              <span className="co-preferred__othermark">{o.mark}</span>
              {o.label && <span className="co-preferred__otherlabel">{o.label}</span>}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
