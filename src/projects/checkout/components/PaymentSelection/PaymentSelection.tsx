import type { ReactNode } from 'react';
import { Radio } from '../../../../components/Radio';
import './PaymentSelection.css';

/**
 * PaymentSelection — how the order gets paid for: a stacked list where the
 * chosen method expands in place to reveal its own form or handoff.
 *
 * Deliberately NOT shared with DeliverySelection. They rhyme today — both are
 * radio groups of cards — but the shapes are already diverging: this one is
 * full-width, stacks vertically, carries regulated small print, and has to open
 * to hold a card form. Delivery is a compact chip row. Merging them would mean
 * one component with a `layout` prop and two mutually-exclusive feature sets,
 * and every later change to either would have to reason about the other.
 *
 * Figma status: **candidate**. No Fabric equivalent, and the expand-in-place
 * behaviour is the part worth drawing — it's what replaces a separate credit
 * options screen.
 *
 * Presentation only: no runtime, no flags. Which methods are offered, their
 * small print and what each reveals are all the caller's decision.
 */
export interface PaymentOption {
  id: string;
  title: ReactNode;
  /** Small print under the title — APR lines, instalment terms. */
  meta?: string[];
  /** Right-aligned mark, e.g. a scheme or wallet logo. */
  mark?: ReactNode;
  /** Revealed beneath the row while this option is selected. */
  content?: ReactNode;
}

export interface PaymentSelectionProps {
  options: PaymentOption[];
  /** Selected option id. */
  value: string;
  onChange: (id: string) => void;
  /** Accessible name for the group. */
  label?: string;
  className?: string;
}

export function PaymentSelection({
  options,
  value,
  onChange,
  label = 'Payment method',
  className,
}: PaymentSelectionProps) {
  return (
    <div
      className={['co-payment', className].filter(Boolean).join(' ')}
      role="radiogroup"
      aria-label={label}
    >
      {options.map((o) => {
        const on = o.id === value;
        return (
          <div key={o.id} className={`co-payment__option ${on ? 'co-payment__option--on' : ''}`}>
            <button
              type="button"
              role="radio"
              aria-checked={on}
              className="co-payment__head"
              onClick={() => onChange(o.id)}
            >
              <Radio checked={on} />
              <span className="co-payment__body">
                <span className="co-payment__title">{o.title}</span>
                {o.meta?.map((line) => (
                  <span key={line} className="co-payment__meta">
                    {line}
                  </span>
                ))}
              </span>
              {o.mark && <span className="co-payment__mark">{o.mark}</span>}
            </button>

            {on && o.content && <div className="co-payment__content">{o.content}</div>}
          </div>
        );
      })}
    </div>
  );
}
