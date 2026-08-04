import './Radio.css';

/**
 * Radio — the 20px radio circle, mirroring the Fabric v2 `Radio` component set
 * in Figma (node 26119-7819). Presentational: renders the circle + centre dot.
 * Interactive behaviour lives in `RadioButton`.
 *
 * Figma properties → props: checked, state(Enabled/Hovered/Focused/Disabled) →
 * `disabled` + optional forced `hovered`/`focused` (docs/preview). `colour`
 * (Primary) is single-value, so fixed. No indeterminate (unlike Checkbox).
 * 1px border unselected, 2px + centre dot when selected.
 */
export interface RadioProps {
  checked?: boolean;
  disabled?: boolean;
  hovered?: boolean;
  focused?: boolean;
  className?: string;
}

export function Radio({ checked, disabled, hovered, focused, className }: RadioProps) {
  const cls = [
    'fab-radio',
    checked && 'fab-radio--selected',
    disabled && 'fab-radio--disabled',
    hovered && 'fab-radio--hovered',
    focused && 'fab-radio--focused',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <span className={cls} aria-hidden>
      <span className="fab-radio__dot" />
    </span>
  );
}
