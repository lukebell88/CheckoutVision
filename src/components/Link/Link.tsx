import type { AnchorHTMLAttributes, ReactNode } from 'react';
import './Link.css';

/**
 * Link — mirrors the Fabric v2 `<Link>` (node 8974:62509). "The Link component
 * allows you to easily customize anchor elements with your theme colors and
 * typography styles." Used in the global app bar (Body 4, underline always).
 *
 * Figma props → props: Underline → `underline`, Style → `textStyle`,
 * Color=Inherit is the default (inherits the surrounding text colour).
 */
export type LinkTextStyle = 'body-1' | 'body-2' | 'body-3' | 'body-4';

export interface LinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  underline?: 'always' | 'hover' | 'none';
  textStyle?: LinkTextStyle;
  disabled?: boolean;
  children: ReactNode;
}

export function Link({
  underline = 'always',
  textStyle = 'body-4',
  disabled = false,
  className,
  href = '#',
  children,
  ...rest
}: LinkProps) {
  return (
    <a
      href={disabled ? undefined : href}
      aria-disabled={disabled || undefined}
      className={['fab-link', `fab-link--${underline}`, `fab-link--${textStyle}`, disabled && 'fab-link--disabled', className]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    >
      {children}
    </a>
  );
}
