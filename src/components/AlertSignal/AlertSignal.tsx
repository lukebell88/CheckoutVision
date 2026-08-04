import type { ReactNode } from 'react';
import { Link } from '../Link';
import './AlertSignal.css';

/**
 * AlertSignal — mirrors the Fabric v2 `<AlertSignal>` (node 43422-1103). A
 * softer "signal" banner: tinted background with top/bottom dividers (no accent
 * border), title (Subtitle 2), body (Body 1) and an optional inline Link.
 *
 * Figma variant properties → props:
 *   Style     → the "signal" token set, exposed here as `color` (Info · Warning)
 *   Alignment → `alignment` (Default · Right to Left)
 *   title/link booleans → presence of `title` / `link`.
 */
export type AlertSignalColor = 'info' | 'warning';

export interface AlertSignalProps {
  color?: AlertSignalColor;
  alignment?: 'default' | 'rtl';
  title?: ReactNode;
  children?: ReactNode;
  link?: { label: string; href?: string };
  className?: string;
}

export function AlertSignal({ color = 'warning', alignment = 'default', title, children, link, className }: AlertSignalProps) {
  return (
    <div
      className={['fab-alert-signal', `fab-alert-signal--${color}`, alignment === 'rtl' && 'fab-alert-signal--rtl', className].filter(Boolean).join(' ')}
      role="status"
    >
      <div className="fab-alert-signal__content">
        {title && <p className="fab-alert-signal__title">{title}</p>}
        {children && <div className="fab-alert-signal__body">{children}</div>}
        {link && <Link href={link.href} underline="always" textStyle="body-3">{link.label}</Link>}
      </div>
    </div>
  );
}
