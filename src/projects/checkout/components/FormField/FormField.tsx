import { useId, useState, type InputHTMLAttributes, type ReactNode } from 'react';
import { TextField, type TextFieldSize } from '../../../../components/TextField';
import { Icon } from '../../../../components/Icon';
import './FormField.css';

/**
 * FormField — a labelled input with validation state and messaging.
 *
 * Fabric's `<TextField>` is the control only: it already styles `error` and
 * `success` borders, but it has no label, no required marker, no hint and no
 * message. Every checkout field was re-inventing that arrangement, and none of
 * them wired the pieces together for assistive tech. This composes them once.
 *
 * What it does beyond stacking markup — and the reason a wrapper is worth
 * having at all:
 *
 *   · label ↔ input associated by a generated id, so tapping the label focuses
 *     the field and screen readers announce it
 *   · `aria-describedby` points at the message or hint, so the reason a field
 *     is wrong is read out, not just seen
 *   · `aria-invalid` and `aria-required` reflect the visual state
 *   · errors carry `role="alert"` so they're announced when they appear
 *
 * Figma status: **strong candidate**. This is a genuine gap — the design system
 * has the input but not the field, so every product rebuilds the label/error
 * arrangement slightly differently. Draw the control states from `<TextField>`
 * and the surrounding parts from here. See ../README.md.
 *
 * Presentation only: no runtime, no flags. Whether a field is in error, and what
 * it says, is the caller's decision.
 */
export type FieldStatus = 'default' | 'error' | 'success' | 'warning';

const STATUS_ICON: Record<Exclude<FieldStatus, 'default'>, string> = {
  error: 'warning',
  success: 'check',
  warning: 'warning',
};

export interface FormFieldProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'value'> {
  label: string;
  /** Keep the label for assistive tech but don't draw it. */
  hideLabel?: boolean;
  required?: boolean;
  /** Drives the border, the message colour and `aria-invalid`. */
  status?: FieldStatus;
  /** Validation message. Takes the place of `hint` when present. */
  message?: ReactNode;
  /** Neutral help text, shown when there's no message. */
  hint?: ReactNode;
  value?: string;
  size?: TextFieldSize;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  /**
   * Show a reveal toggle. Defaults on for `type="password"` — a shopper who
   * can't see what they typed is the most common reason a password is entered
   * wrong twice. Pass `false` where the value must never be shown.
   */
  revealable?: boolean;
  className?: string;
}

export function FormField({
  label,
  hideLabel,
  required,
  status = 'default',
  message,
  hint,
  value,
  size = 'large',
  startIcon,
  endIcon,
  revealable,
  className,
  id,
  type,
  ...rest
}: FormFieldProps) {
  const autoId = useId();
  const inputId = id ?? `ff-${autoId}`;
  const noteId = `${inputId}-note`;

  const note = message ?? hint;
  const isError = status === 'error';
  const controlled = rest.onChange !== undefined;

  // Reveal is on by default for passwords and off for everything else.
  const isPassword = type === 'password';
  const canReveal = revealable ?? isPassword;
  const [revealed, setRevealed] = useState(false);
  const showing = isPassword && revealed;

  return (
    <div className={['co-formfield', className].filter(Boolean).join(' ')}>
      <label className={hideLabel ? 'co-sr-only' : 'co-formfield__label'} htmlFor={inputId}>
        {label}
        {required && (
          <span className="co-formfield__req" aria-hidden="true">
            *
          </span>
        )}
      </label>

      <TextField
        id={inputId}
        size={size}
        type={showing ? 'text' : type}
        // Only force the state when it means something. Passing 'enabled' would
        // pin the control open and kill its live :hover / :focus styling.
        state={status === 'default' ? undefined : status === 'warning' ? 'error' : status}
        startIcon={startIcon}
        endIcon={
          canReveal ? (
            <button
              type="button"
              className="co-formfield__reveal"
              // The label states what pressing it DOES, which is what a screen
              // reader user needs; `aria-pressed` carries the current state.
              aria-label={showing ? 'Hide password' : 'Show password'}
              aria-pressed={showing}
              aria-controls={inputId}
              onClick={() => setRevealed((v) => !v)}
            >
              <Icon name={showing ? 'hide' : 'show'} category="ui" size={20} />
            </button>
          ) : (
            endIcon
          )
        }
        aria-invalid={isError || undefined}
        aria-required={required || undefined}
        aria-describedby={note ? noteId : undefined}
        {...(controlled ? { value: value ?? '' } : { defaultValue: value })}
        {...rest}
      />

      {note && (
        <p
          id={noteId}
          className={`co-formfield__note co-formfield__note--${message ? status : 'default'}`}
          // Announce validation results as they appear; a static hint shouldn't
          // interrupt, so only messages get the live treatment.
          role={message && isError ? 'alert' : undefined}
        >
          {message && status !== 'default' && (
            <Icon
              name={STATUS_ICON[status]}
              category="ui"
              variant="s-default"
              size={16}
              className="co-formfield__note-icon"
            />
          )}
          {/* Wrapped so the note is ONE flex item. Without this, a hint holding
              an inline <Link> has each text node become its own flex item and
              the sentence breaks into columns instead of wrapping. */}
          <span className="co-formfield__note-text">{note}</span>
        </p>
      )}
    </div>
  );
}
