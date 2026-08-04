import { Icon } from '../Icon';
import './Checkbox.css';

/**
 * Check — the 20px checkbox box, mirroring the Fabric v2 `Check` component set
 * in Figma (node 26119-7772). Presentational: it renders the box + checkmark or
 * indeterminate dash based on props. Interactive behaviour lives in `Checkbox`.
 *
 * Figma properties → props: checked, indeterminate, state(Enabled/Hovered/
 * Focused/Disabled) → `disabled` + optional forced `hovered`/`focused` (used by
 * the docs/preview to show states that are otherwise interaction-driven).
 * `colour`(Primary) and `size`(Default) are single-value in Figma, so fixed.
 *
 * Border is 1px when unselected, 2px when selected (checked or indeterminate).
 * The checkmark is the `check-s-default` icon; both it and the dash inherit the
 * checkmark colour token via currentColor.
 */
export interface CheckProps {
  checked?: boolean;
  indeterminate?: boolean;
  disabled?: boolean;
  /** Force the hover visual (docs/preview only). */
  hovered?: boolean;
  /** Force the focus ring (docs/preview only). */
  focused?: boolean;
  className?: string;
}

export function Check({ checked, indeterminate, disabled, hovered, focused, className }: CheckProps) {
  const selected = !!checked || !!indeterminate;
  const cls = [
    'fab-check',
    selected && 'fab-check--selected',
    disabled && 'fab-check--disabled',
    hovered && 'fab-check--hovered',
    focused && 'fab-check--focused',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <span className={cls} aria-hidden>
      {checked && !indeterminate && (
        <Icon className="fab-check__mark" name="check" category="ui" variant="s-default" size={22} />
      )}
      {indeterminate && <span className="fab-check__dash" />}
    </span>
  );
}
