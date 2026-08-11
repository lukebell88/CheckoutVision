import type { ReactNode } from 'react';
import { Link } from '../../../../components/Link';
import './PreferredPayment.css';

/**
 * PreferredPayment — the collapsed entry to the payment step for a returning
 * shopper whose method is remembered.
 *
 * It reads like the Details / Delivery summaries: the chosen method sits
 * selected with a Change link, and the rest of the wallet is offered as a quiet
 * row of "other payment methods". Change hands back to the full method list;
 * tapping an other method opens that list already on that method.
 *
 * Presentation only — the labels, marks and the pay button are the caller's.
 */
export interface PreferredOther {
  id: string;
  mark: ReactNode;
  /** Optional caption under the mark (Gift Card has no wordmark logo). */
  label?: string;
}

export interface PreferredPaymentProps {
  /** The method's name, e.g. "Debit / Credit Card". */
  label: string;
  /** The remembered card, e.g. "Monzo •••• 1234". */
  cardLabel: string;
  /** The scheme logo shown beside the card. */
  cardMark: ReactNode;
  /** The other wallet methods, shown as a row of marks. */
  others: PreferredOther[];
  /** Reveal the full method list. */
  onChange?: () => void;
  /** Open the full list already selected on this method. */
  onSelectOther?: (id: string) => void;
  /** The pay button for the remembered method. */
  pay: ReactNode;
}

export function PreferredPayment({
  label,
  cardLabel,
  cardMark,
  others,
  onChange,
  onSelectOther,
  pay,
}: PreferredPaymentProps) {
  return (
    <div className="co-preferred">
      <div className="co-preferred__card">
        <div className="co-preferred__cardbody">
          <span className="co-preferred__label">{label}</span>
          <span className="co-preferred__cardline">
            <span className="co-preferred__cardnum">{cardLabel}</span>
            <span className="co-preferred__cardmark">{cardMark}</span>
          </span>
        </div>
        <Link
          href="#"
          onClick={(e) => {
            e.preventDefault();
            onChange?.();
          }}
        >
          Change
        </Link>
      </div>

      <div className="co-preferred__others">
        <p className="co-preferred__otherslabel">Other payment methods</p>
        <div className="co-preferred__othersrow">
          {others.map((o) => (
            <button
              key={o.id}
              type="button"
              className="co-preferred__other"
              aria-label={`Pay with ${o.label ?? o.id}`}
              onClick={() => onSelectOther?.(o.id)}
            >
              {o.label && <span className="co-preferred__otherlabel">{o.label}</span>}
              <span className="co-preferred__othermark">{o.mark}</span>
            </button>
          ))}
        </div>
      </div>

      {pay}
    </div>
  );
}
