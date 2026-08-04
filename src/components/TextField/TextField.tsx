import type { InputHTMLAttributes, ReactNode } from 'react';
import './TextField.css';

/**
 * TextField — mirrors the Fabric v2 `<TextField>` (node 8985-62449). "Text
 * fields let users enter and edit text."
 *
 * Figma variant properties → props:
 *   Variant       → `variant`  (Default · Strong · Block)
 *   Border Radius → `radius`   (Default · Rounded) — `pill` is an alias
 *   Size          → `size`     (Large · Medium)
 *   State         → `state`    (Enabled · Hovered · Focused · Disabled · Error · Success)
 *
 * `state` forces the visual state for specimens; omit it for live :hover /
 * :focus behaviour. Colours derive from the shared `action` + semantic tokens.
 */
export type TextFieldVariant = 'default' | 'strong' | 'block';
export type TextFieldSize = 'medium' | 'large';
export type TextFieldRadius = 'default' | 'rounded';
export type TextFieldState = 'enabled' | 'hovered' | 'focused' | 'disabled' | 'error' | 'success';

export interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  variant?: TextFieldVariant;
  size?: TextFieldSize;
  radius?: TextFieldRadius;
  /** Force a visual state (specimens). Omit for live :hover/:focus. */
  state?: TextFieldState;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  /** Alias for radius="rounded" (the app-bar search pill). */
  pill?: boolean;
}

export function TextField({
  variant = 'default',
  size = 'medium',
  radius,
  state,
  startIcon,
  endIcon,
  pill = false,
  className,
  disabled,
  ...rest
}: TextFieldProps) {
  const r = radius ?? (pill ? 'rounded' : 'default');
  const classes = [
    'fab-textfield',
    `fab-textfield--${variant}`,
    `fab-textfield--${size}`,
    `fab-textfield--radius-${r}`,
    state && `fab-textfield--${state}`,
    (disabled || state === 'disabled') && 'fab-textfield--is-disabled',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes}>
      {startIcon && <span className="fab-textfield__adorn" aria-hidden>{startIcon}</span>}
      <input className="fab-textfield__input" disabled={disabled || state === 'disabled'} {...rest} />
      {endIcon && <span className="fab-textfield__adorn" aria-hidden>{endIcon}</span>}
    </div>
  );
}
