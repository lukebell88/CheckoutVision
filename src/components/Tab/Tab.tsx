import type { ButtonHTMLAttributes, ReactNode } from 'react';
import './Tab.css';

/**
 * Tab — mirrors the Fabric v2 `<Tab>` set (node 9065-68654) in full.
 *
 * Figma variant properties → props:
 *   Variant      → `variant`  (Nav · Global Bar · Default)
 *   State        → `state`    (Enabled · Hovered · Focused · Active · Disabled)
 *   Logotype     → `logotype` (render a logo instead of text)
 *   Sale         → `tone="sale"`      (Nav — red text)
 *   Clearance    → `tone="clearance"` (Nav — amber text)
 *   Extra Gutter → `extraGutter`      (Nav — wider tab)
 *   Position     → `position` (Left · Inner · Right — Default variant borders)
 *   Active indicators (Nav) → `indicator` (bar · round · arrow)
 *
 * `Nav` is the app-bar nav tab (44px); `Global Bar` is the slim 36px form;
 * `Default` is the connected "folder" tab used by `<Tabs>`.
 */
export type TabVariant = 'nav' | 'global-bar' | 'default';
export type TabState = 'enabled' | 'hovered' | 'focused' | 'active' | 'disabled';
export type TabPosition = 'left' | 'inner' | 'right';
export type TabTone = 'default' | 'sale' | 'clearance';
export type TabIndicator = 'none' | 'bar' | 'round' | 'arrow';

export interface TabProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  variant?: TabVariant;
  /** Force a visual state (specimens). Otherwise derived from `active`/`disabled`. */
  state?: TabState;
  /** Convenience for `state="active"`. */
  active?: boolean;
  /** Nav text tone: sale (red) / clearance (amber). */
  tone?: TabTone;
  /** Render a logo (or any node) instead of the text label. */
  logotype?: ReactNode;
  /** Nav — wider tab (Extra Gutter). */
  extraGutter?: boolean;
  /** Default variant — connected-border position. */
  position?: TabPosition;
  /** Nav active-underline style. */
  indicator?: TabIndicator;
  children?: ReactNode;
}

export function Tab({
  variant = 'nav',
  state,
  active = false,
  tone = 'default',
  logotype,
  extraGutter = false,
  position = 'inner',
  indicator = 'none',
  className,
  children,
  disabled,
  type = 'button',
  ...rest
}: TabProps) {
  const s: TabState = disabled ? 'disabled' : state ?? (active ? 'active' : 'enabled');
  const isDefault = variant === 'default';

  const classes = [
    'fab-tab',
    `fab-tab--${variant}`,
    `fab-tab--${s}`,
    !isDefault && tone !== 'default' && `fab-tab--${tone}`,
    isDefault && `fab-tab--pos-${position}`,
    extraGutter && 'fab-tab--gutter',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button type={type} className={classes} disabled={disabled || s === 'disabled'} {...rest}>
      {isDefault && s === 'active' && <span className="fab-tab__highlight" aria-hidden />}
      <span className="fab-tab__label">{logotype ?? children}</span>
      {!isDefault && s === 'active' && indicator !== 'none' && (
        indicator === 'arrow'
          ? <span className="fab-tab__arrow" aria-hidden />
          : <span className={`fab-tab__bar ${indicator === 'round' ? 'fab-tab__bar--round' : ''}`} aria-hidden />
      )}
      {isDefault && s === 'focused' && <span className="fab-tab__focus" aria-hidden />}
      {isDefault && s === 'disabled' && <span className="fab-tab__strike" aria-hidden />}
    </button>
  );
}
