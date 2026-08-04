import type { ButtonHTMLAttributes, ReactNode } from 'react';
import './Button.css';

/**
 * Button — mirrors the Fabric v2 `Button` component set in Figma
 * (file components-fabric-v2b, node 6543-36744).
 *
 * Figma variant properties map to props 1:1:
 *   Variant → `variant`  (Contained | Outlined | Unstyled)
 *   Color   → `color`    (Primary | Secondary)
 *   Size    → `size`     (Small | Medium | Large)
 *   State   → native/CSS: Enabled (default), Hovered (:hover),
 *             Focused (:focus-visible), Disabled (`disabled`),
 *             Loading (`loading`).
 *
 * Styling is entirely token-driven (the `--components-button-*`,
 * `--component-button-*`, `--global-button-*-border-radius` and
 * `--interactive-focus-default-outline-color` CSS variables), so a single
 * Button re-themes across every client. Structural values Figma keeps outside
 * the themed set (padding / gap / height) are constants in Button.css.
 */
export type ButtonVariant = 'contained' | 'outlined' | 'unstyled';
export type ButtonColor = 'primary' | 'secondary';
export type ButtonSize = 'small' | 'medium' | 'large';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  color?: ButtonColor;
  size?: ButtonSize;
  /** Figma State=Loading — shows a spinner and blocks interaction. */
  loading?: boolean;
  /** Icon before the label (inherits the button's text colour). */
  startIcon?: ReactNode;
  /** Icon after the label. */
  endIcon?: ReactNode;
  /** Stretch to the container width (layout convenience, not a Figma prop). */
  fullWidth?: boolean;
}

export function Button({
  variant = 'contained',
  color = 'primary',
  size = 'medium',
  loading = false,
  startIcon,
  endIcon,
  fullWidth = false,
  disabled,
  children,
  className,
  type = 'button',
  ...rest
}: ButtonProps) {
  const classes = [
    'fab-btn',
    `fab-btn--${variant}`,
    `fab-btn--${color}`,
    `fab-btn--${size}`,
    fullWidth && 'fab-btn--full',
    loading && 'fab-btn--loading',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading && <span className="fab-btn__spinner" aria-hidden />}
      <span className="fab-btn__content">
        {startIcon && <span className="fab-btn__icon">{startIcon}</span>}
        {children != null && <span className="fab-btn__label">{children}</span>}
        {endIcon && <span className="fab-btn__icon">{endIcon}</span>}
      </span>
    </button>
  );
}
