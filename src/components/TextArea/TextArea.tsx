import type { TextareaHTMLAttributes } from 'react';
import './TextArea.css';

/**
 * TextArea — mirrors the Fabric v2 `<TextArea>` (node 42568-6551). Multi-line
 * text input.
 *
 * Figma variant properties → props:
 *   Size  → `size`  (Large · Medium)
 *   State → `state` (Enabled · Hovered · Focused · Disabled · Error)
 *
 * `state` forces the visual state for specimens; omit it for live interaction.
 * Shares the TextField token model.
 */
export type TextAreaSize = 'medium' | 'large';
export type TextAreaState = 'enabled' | 'hovered' | 'focused' | 'disabled' | 'error';

export interface TextAreaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'> {
  size?: TextAreaSize;
  state?: TextAreaState;
}

export function TextArea({ size = 'large', state, className, disabled, ...rest }: TextAreaProps) {
  const classes = [
    'fab-textarea',
    `fab-textarea--${size}`,
    state && `fab-textarea--${state}`,
    (disabled || state === 'disabled') && 'fab-textarea--is-disabled',
    className,
  ]
    .filter(Boolean)
    .join(' ');
  return <textarea className={classes} disabled={disabled || state === 'disabled'} {...rest} />;
}
