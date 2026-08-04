import { useEffect, useId, useRef, useState, type ChangeEvent, type InputHTMLAttributes, type ReactNode } from 'react';
import { Check } from './Check';
import './Checkbox.css';

/**
 * Checkbox — mirrors the Fabric v2 `Checkbox` component set in Figma
 * (node 19784-119461): a `Check` box plus a label and optional count,
 * e.g. "Label (123)".
 *
 * Figma properties → props:
 *   checked / indeterminate → same
 *   state (Enabled/Hovered/Focused/Disabled) → native/CSS + `disabled`
 *   label / labelValue → `label` (omit to hide)
 *   count / countValue  → `count` (omit to hide)
 *
 * A real (visually-hidden) <input type="checkbox"> drives semantics and
 * keyboard focus; the `Check` visual reflects state. Works uncontrolled
 * (defaultChecked) or controlled (checked).
 */
export interface CheckboxProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size' | 'checked' | 'defaultChecked'> {
  checked?: boolean;
  defaultChecked?: boolean;
  indeterminate?: boolean;
  /** The label text/content; omit for a bare checkbox. */
  label?: ReactNode;
  /** The trailing count, e.g. "(123)"; omit to hide. */
  count?: ReactNode;
}

export function Checkbox({
  checked,
  defaultChecked,
  indeterminate = false,
  disabled,
  label,
  count,
  className,
  id,
  onChange,
  ...rest
}: CheckboxProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const reactId = useId();
  const inputId = id ?? reactId;

  const isControlled = checked !== undefined;
  const [internal, setInternal] = useState(!!defaultChecked);
  const isChecked = isControlled ? !!checked : internal;

  // Indeterminate is only settable on the DOM node, not via attribute.
  useEffect(() => {
    if (inputRef.current) inputRef.current.indeterminate = !!indeterminate;
  }, [indeterminate, isChecked]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!isControlled) setInternal(e.target.checked);
    onChange?.(e);
  };

  const cls = ['fab-checkbox', disabled && 'fab-checkbox--disabled', className].filter(Boolean).join(' ');

  return (
    <label className={cls} htmlFor={inputId}>
      <input
        ref={inputRef}
        id={inputId}
        type="checkbox"
        className="fab-checkbox__input"
        checked={isControlled ? checked : undefined}
        defaultChecked={isControlled ? undefined : defaultChecked}
        disabled={disabled}
        onChange={handleChange}
        {...rest}
      />
      <Check checked={isChecked && !indeterminate} indeterminate={indeterminate} disabled={disabled} />
      {(label != null || count != null) && (
        <span className="fab-checkbox__text">
          {label != null && <span className="fab-checkbox__label">{label}</span>}
          {count != null && <span className="fab-checkbox__count">{count}</span>}
        </span>
      )}
    </label>
  );
}
