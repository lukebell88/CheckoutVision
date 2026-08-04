import { useId, type InputHTMLAttributes, type ReactNode } from 'react';
import './Radio.css';

/**
 * RadioButton — mirrors the Fabric v2 `RadioButton` component set in Figma
 * (node 9064-68701): a `Radio` circle plus a label.
 *
 * Figma properties → props:
 *   checked → same
 *   state (Enabled/Hovered/Focused/Disabled) → native/CSS + `disabled`
 *   label (True) → `label` (omit to hide)
 *
 * A real (visually-hidden) <input type="radio"> drives semantics, keyboard
 * focus and single-select grouping (via `name`); the visual reflects `:checked`
 * purely in CSS, so it works uncontrolled (name + defaultChecked) or controlled.
 */
export interface RadioButtonProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  /** The label content; omit for a bare radio. */
  label?: ReactNode;
}

export function RadioButton({ label, className, id, disabled, ...rest }: RadioButtonProps) {
  const reactId = useId();
  const inputId = id ?? reactId;
  const cls = ['fab-radiobtn', disabled && 'fab-radiobtn--disabled', className].filter(Boolean).join(' ');

  return (
    <label className={cls} htmlFor={inputId}>
      <input id={inputId} type="radio" className="fab-radiobtn__input" disabled={disabled} {...rest} />
      <span className="fab-radio">
        <span className="fab-radio__dot" />
      </span>
      {label != null && <span className="fab-radiobtn__label">{label}</span>}
    </label>
  );
}
