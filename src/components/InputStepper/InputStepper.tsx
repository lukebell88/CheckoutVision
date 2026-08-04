import { useState } from 'react';
import { Icon } from '../Icon';
import './InputStepper.css';

/**
 * InputStepper — mirrors the Fabric v2 `<InputStepper>` (node 31576-35621). A
 * quantity control: minus · value · plus in a rounded bordered pill.
 *
 * Figma variant properties → props:
 *   Size  → `size`  (Large · Medium)
 *   State → native/CSS; the per-button Hovered/Focused Plus/Minus states are
 *           the buttons' own :hover/:focus.
 *   Value → derived: minus disables at `min`, plus disables at `max`.
 *
 * Controlled via `value`+`onValueChange`, or uncontrolled via `defaultValue`.
 */
export type InputStepperSize = 'medium' | 'large';

export interface InputStepperProps {
  size?: InputStepperSize;
  min?: number;
  max?: number;
  value?: number;
  defaultValue?: number;
  onValueChange?: (value: number) => void;
  disabled?: boolean;
  className?: string;
  'aria-label'?: string;
}

export function InputStepper({
  size = 'large',
  min = 0,
  max = 99,
  value,
  defaultValue = 1,
  onValueChange,
  disabled = false,
  className,
  'aria-label': ariaLabel = 'Quantity',
}: InputStepperProps) {
  const [internal, setInternal] = useState(defaultValue);
  const val = value ?? internal;

  const set = (next: number) => {
    const clamped = Math.max(min, Math.min(max, next));
    if (value === undefined) setInternal(clamped);
    onValueChange?.(clamped);
  };

  const classes = ['fab-stepper', `fab-stepper--${size}`, disabled && 'fab-stepper--is-disabled', className]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes} role="group" aria-label={ariaLabel}>
      <button
        type="button"
        className="fab-stepper__btn"
        onClick={() => set(val - 1)}
        disabled={disabled || val <= min}
        aria-label="Decrease"
      >
        <Icon name="minus" category="ui" size={20} />
      </button>
      <span className="fab-stepper__value" aria-live="polite">{val}</span>
      <button
        type="button"
        className="fab-stepper__btn"
        onClick={() => set(val + 1)}
        disabled={disabled || val >= max}
        aria-label="Increase"
      >
        <Icon name="plus" category="ui" size={20} />
      </button>
    </div>
  );
}
