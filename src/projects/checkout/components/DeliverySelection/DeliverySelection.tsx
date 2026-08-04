import { Radio } from '../../../../components/Radio';
import './DeliverySelection.css';

/**
 * DeliverySelection — how the order gets to the shopper, as a row of chips.
 *
 * Deliberately NOT shared with PaymentSelection. The two look similar today —
 * both are radio groups of cards — but they're heading in different directions:
 * delivery gains store finders, maps, slot availability and cut-off times, while
 * payment gains expanding forms, APR small print and provider handoffs. A shared
 * "SelectableOption" would have both callers passing flags to switch off each
 * other's features within a sprint. Two honest components cost one duplicated
 * border rule; the wrong abstraction costs every future change.
 *
 * Figma status: **candidate**, and a strong one — a compact delivery-method
 * chooser has no Fabric equivalent and every transactional journey needs it.
 *
 * Presentation only: no runtime, no flags. Which options exist and what they
 * cost is the caller's decision — see ../README.md rule 2.
 */
export interface DeliveryOption {
  id: string;
  title: string;
  /** Pre-formatted — "£4.95", "FREE". The component never sees a number. */
  price: string;
  /** Reason it can't be picked, e.g. "Unavailable for your postcode". */
  disabledReason?: string;
}

export interface DeliverySelectionProps {
  options: DeliveryOption[];
  /** Selected option id. */
  value: string;
  onChange: (id: string) => void;
  /** Accessible name for the group. */
  label?: string;
  className?: string;
}

export function DeliverySelection({
  options,
  value,
  onChange,
  label = 'Delivery method',
  className,
}: DeliverySelectionProps) {
  return (
    <div
      className={['co-delivery', className].filter(Boolean).join(' ')}
      role="radiogroup"
      aria-label={label}
    >
      {options.map((o) => {
        const on = o.id === value;
        return (
          <button
            key={o.id}
            type="button"
            role="radio"
            aria-checked={on}
            disabled={!!o.disabledReason}
            title={o.disabledReason}
            className={`co-delivery__option ${on ? 'co-delivery__option--on' : ''}`}
            onClick={() => onChange(o.id)}
          >
            <Radio checked={on} disabled={!!o.disabledReason} />
            <span className="co-delivery__body">
              <span className="co-delivery__title">{o.title}</span>
              <span className="co-delivery__price">{o.price}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
