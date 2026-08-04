import type { ReactNode } from 'react';
import { Icon } from '../../../../components/Icon';
import './TitleBar.css';

/**
 * TitleBar — the bar under the site header: optional back control, centred page
 * title. Every checkout screen that isn't the confirmation wears one, so it is
 * the thing that makes the journey read as a single continuous flow.
 *
 * Named TitleBar rather than PageHeader to keep it clearly distinct from the
 * Fabric `<Header>` (the brand's site header), which sits above it.
 *
 * Figma status: **candidate**. There's no Fabric equivalent today, but a titled
 * back-bar is not checkout-specific — any linear flow (returns, account setup,
 * booking) wants one. Worth drawing once the copy and the back affordance have
 * settled. See ../README.md for the promotion steps.
 *
 * Takes `onBack` rather than reaching for the runtime itself: that's what keeps
 * it promotable, and it lets a screen decide that back means something other
 * than "one step in history".
 */
export interface TitleBarProps {
  /** The page title. Centred, and the screen's only <h1>. */
  title: ReactNode;
  /** Omit to render no back control — e.g. the first screen of a journey. */
  onBack?: () => void;
  /** Accessible name for the back control. */
  backLabel?: string;
  className?: string;
}

export function TitleBar({ title, onBack, backLabel = 'Back', className }: TitleBarProps) {
  return (
    <div className={['co-titlebar', className].filter(Boolean).join(' ')}>
      {onBack && (
        <button type="button" className="co-titlebar__back" aria-label={backLabel} onClick={onBack}>
          <Icon name="chevron-left" category="ui" size={20} />
        </button>
      )}
      <h1 className="co-titlebar__title">{title}</h1>
    </div>
  );
}
