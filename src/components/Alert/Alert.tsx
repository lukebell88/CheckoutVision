import type { ReactNode } from 'react';
import { IconButton } from '../IconButton';
import { Icon } from '../Icon';
import './Alert.css';

/**
 * Alert — mirrors the Fabric v2 `<Alert>` (node 9951-66221). A tinted banner
 * with a left accent border, title (Subtitle 2), body (Body 1) and an optional
 * close button.
 *
 * Figma variant properties → props:
 *   Style     → `style`     (Error · Warning · Info · Success)
 *   Alignment → `alignment` (Default · Right to Left)
 *   title/body/close booleans → presence of `title` / `children` / `onClose`.
 */
export type AlertStyle = 'error' | 'warning' | 'info' | 'success';

export interface AlertProps {
  style?: AlertStyle;
  alignment?: 'default' | 'rtl';
  title?: ReactNode;
  children?: ReactNode;
  onClose?: () => void;
  className?: string;
}

export function Alert({ style = 'info', alignment = 'default', title, children, onClose, className }: AlertProps) {
  return (
    <div
      className={['fab-alert', `fab-alert--${style}`, alignment === 'rtl' && 'fab-alert--rtl', className].filter(Boolean).join(' ')}
      role="alert"
    >
      <div className="fab-alert__content">
        {title && <p className="fab-alert__title">{title}</p>}
        {children && <div className="fab-alert__body">{children}</div>}
      </div>
      {onClose && (
        <IconButton variant="unstyled" color="action" size="large" aria-label="Dismiss" onClick={onClose} className="fab-alert__close">
          <Icon name="cross" category="ui" size={20} />
        </IconButton>
      )}
    </div>
  );
}
