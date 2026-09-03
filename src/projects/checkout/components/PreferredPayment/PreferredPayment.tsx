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
        className="co-preferred__choose"
        onClick={onChooseAnother}
      >
        <span className="co-preferred__chooselabel">Choose Another Payment Method</span>
        {others.length > 0 && (
          <span className="co-preferred__chooselogos" aria-hidden="true">
            {others.map((o) => (
              <span key={o.id} className="co-preferred__othermark">{o.mark}</span>
            ))}
          </span>
        )}
      </Button>

      {banner}
    </div>
  );
}
