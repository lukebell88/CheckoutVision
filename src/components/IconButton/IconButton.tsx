import type { ButtonHTMLAttributes, ReactNode } from 'react';
import './IconButton.css';

/**
 * IconButton — mirrors the Fabric v2 `IconButton` component set in Figma
 * (file components-fabric-v2b, node 9028-69880). "Icon buttons are commonly
 * found in app bars and toolbars."
 *
 * Figma variant properties → props:
 *   Variant → `variant` (Contained | Outlined | Unstyled)
 *   Color   → `color`   (Primary | Secondary | Action)
 *   Size    → `size`    (Medium | Large)   — no Small for icon buttons
 *   State   → native/CSS + `loading`
 *   Icon    → `children` (the icon element)
 *
 * Colour is token-driven: Contained/Outlined Primary·Secondary use the shared
 * button colour tokens; the Action colour uses the `--action-default-*` tokens
 * (the neutral bordered icon button). The button is a fixed square whose radius
 * (`--global-icon-button-{size}-border-radius`) makes it a circle.
 */
export type IconButtonVariant = 'contained' | 'outlined' | 'unstyled';
export type IconButtonColor = 'primary' | 'secondary' | 'action';
export type IconButtonSize = 'medium' | 'large';

export interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'color'> {
  variant?: IconButtonVariant;
  color?: IconButtonColor;
  size?: IconButtonSize;
  /** Figma State=Loading — shows a spinner in place of the icon. */
  loading?: boolean;
  /** The icon (inline SVG inherits the token icon colour via currentColor). */
  children: ReactNode;
  /** Icon-only control — an accessible label is required. */
  'aria-label': string;
}

export function IconButton({
  variant = 'contained',
  color = 'primary',
  size = 'large',
  loading = false,
  disabled,
  className,
  children,
  type = 'button',
  ...rest
}: IconButtonProps) {
  const classes = [
    'fab-iconbtn',
    `fab-iconbtn--${variant}`,
    `fab-iconbtn--${color}`,
    `fab-iconbtn--${size}`,
    loading && 'fab-iconbtn--loading',
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
      {loading && <span className="fab-iconbtn__spinner" aria-hidden />}
      <span className="fab-iconbtn__icon" aria-hidden>{children}</span>
    </button>
  );
}
