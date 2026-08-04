import type { ButtonHTMLAttributes, ReactNode } from 'react';
import flagGb from '../../../iconography/common/flag/flag-gb.png';
import { Icon } from '../Icon';
import './Select.css';

/**
 * Select — mirrors the Fabric v2 `<Select>` (node 6570-41424). "Select
 * components are used for collecting user provided information from a list of
 * options." This is the trigger: value/placeholder + chevron.
 *
 * Figma properties → props:
 *   Size     → `size`   (Large · Medium)
 *   State    → `state`  (Enabled · Hovered · Focused · Disabled · Error)
 *   Active   → `active` (dropdown open — chevron flips up)
 *   showChip → `showChip` (leading image chip)
 *   showFlag → `showFlag` (leading flag)
 *   placeholder → pass no `value` (the placeholder text shows instead)
 *
 * Radius is theme-driven via the exported `--global-select-{size}-border-radius`
 * token (Next 4px rounded · Joules 0 square · Reiss 2px …) — NOT the Figma board's
 * 22px pill, which comes from a non-exported Structure variable. `startAdornment`
 * remains for a custom leading slot.
 */
export type SelectSize = 'medium' | 'large';
export type SelectState = 'enabled' | 'hovered' | 'focused' | 'disabled' | 'error';

export interface SelectProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'value'> {
  size?: SelectSize;
  state?: SelectState;
  /** Dropdown open — chevron points up. */
  active?: boolean;
  value?: ReactNode;
  placeholder?: string;
  /** Leading 20px image chip. */
  showChip?: boolean;
  /** Leading region flag. */
  showFlag?: boolean;
  /** Custom leading slot (overrides chip/flag). */
  startAdornment?: ReactNode;
}

export function Select({
  size = 'large',
  state,
  active = false,
  value,
  placeholder = 'Placeholder',
  showChip = false,
  showFlag = false,
  startAdornment,
  className,
  disabled,
  type = 'button',
  ...rest
}: SelectProps) {
  const classes = [
    'fab-select',
    `fab-select--${size}`,
    state && `fab-select--${state}`,
    active && 'fab-select--active',
    (disabled || state === 'disabled') && 'fab-select--is-disabled',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const hasLeading = startAdornment || showChip || showFlag;

  return (
    <button type={type} className={classes} disabled={disabled || state === 'disabled'} aria-haspopup="listbox" aria-expanded={active} {...rest}>
      {hasLeading && (
        <span className="fab-select__adorn">
          {startAdornment ?? (
            <>
              {showChip && <span className="fab-select__chip" aria-hidden />}
              {showFlag && <img src={flagGb} alt="" className="fab-select__flag" />}
            </>
          )}
        </span>
      )}
      <span className={`fab-select__value ${value == null ? 'fab-select__value--placeholder' : ''}`}>
        {value ?? placeholder}
      </span>
      <Icon name={active ? 'chevron-up' : 'chevron-down'} category="ui" size={24} className="fab-select__chevron" />
    </button>
  );
}
