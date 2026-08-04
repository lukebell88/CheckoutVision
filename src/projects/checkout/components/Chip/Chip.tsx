import type { ReactNode } from 'react';
import './Chip.css';

/**
 * A committed value shown as a pill, with an optional trailing action.
 *
 * Built for the email-first checkout's locked email — once the address is
 * accepted it stops being an editable field and becomes a chip the shopper can
 * only replace via its action (Change). Kept generic and prop-driven (no
 * checkout imports) so it can promote to Fabric: pass a label, an optional
 * leading icon, and an optional action.
 *
 * Theme tokens only.
 */
export interface ChipProps {
  label: string;
  /** Optional leading glyph (e.g. an envelope). */
  icon?: ReactNode;
  /** Trailing action; omit for a static chip. */
  onAction?: () => void;
  /** Visible text for the action button — also its accessible name. */
  actionLabel?: string;
}

export function Chip({ label, icon, onAction, actionLabel = 'Change' }: ChipProps) {
  return (
    <span className="co-chip">
      {icon && <span className="co-chip__icon" aria-hidden="true">{icon}</span>}
      <span className="co-chip__label">{label}</span>
      {onAction && (
        <button type="button" className="co-chip__action" onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </span>
  );
}
