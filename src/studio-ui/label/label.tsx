import type { LabelProps } from './types';

import { mergeClasses } from 'minimal-shared/utils';

/** Inlined from es-toolkit — the only thing Label used it for. */
const upperFirst = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

import { labelClasses } from './classes';
import { LabelRoot, LabelIcon } from './styles';

// ----------------------------------------------------------------------

export function Label({
  sx,
  endIcon,
  children,
  startIcon,
  className,
  disabled,
  variant = 'soft',
  color = 'default',
  ...other
}: LabelProps) {
  return (
    <LabelRoot
      color={color}
      variant={variant}
      disabled={disabled}
      className={mergeClasses([labelClasses.root, className])}
      sx={sx}
      {...other}
    >
      {startIcon && <LabelIcon className={labelClasses.icon}>{startIcon}</LabelIcon>}

      {typeof children === 'string' ? upperFirst(children) : children}

      {endIcon && <LabelIcon className={labelClasses.icon}>{endIcon}</LabelIcon>}
    </LabelRoot>
  );
}
