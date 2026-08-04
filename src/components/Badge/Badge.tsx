import type { ReactNode } from 'react';
import './Badge.css';

/**
 * Badge — mirrors the Fabric v2 `<Badge>` (node 9121-76379). "Badge generates a
 * small badge to the top-right of its child(ren)."
 *
 * Figma variant properties → props:
 *   Variant → `variant` (Default = number/label · Icon · Dot)
 *   Color   → `color`   (Unstyled · Primary · Secondary · Notification · Action)
 *   Size    → `size`    (Medium · Large · Small — Dot is Small only)
 *
 * Standalone it renders just the chip. Pass `children` (e.g. an app-bar icon) to
 * overlay the chip at the top-right — this is the `<Badge+Instance>` usage
 * (node 17312-83540).
 */
export type BadgeVariant = 'default' | 'icon' | 'dot';
export type BadgeColor = 'unstyled' | 'primary' | 'secondary' | 'notification' | 'action';
export type BadgeSize = 'small' | 'medium' | 'large';

export interface BadgeProps {
  variant?: BadgeVariant;
  color?: BadgeColor;
  size?: BadgeSize;
  /** Number/label for the Default variant. */
  content?: ReactNode;
  /** Icon element for the Icon variant. */
  icon?: ReactNode;
  /** Render the Default badge even when content is 0 (app-bar bag shows "0"). */
  showZero?: boolean;
  /** When present, the chip overlays the top-right of these children. */
  children?: ReactNode;
  className?: string;
}

function Chip({ variant, color, size, content, icon }: Required<Pick<BadgeProps, 'variant' | 'color' | 'size'>> & Pick<BadgeProps, 'content' | 'icon'>) {
  const cls = `fab-badge__chip fab-badge__chip--${variant} fab-badge__chip--${color} fab-badge__chip--${size}`;
  return (
    <span className={cls}>
      {variant === 'default' && content}
      {variant === 'icon' && <span className="fab-badge__icon" aria-hidden>{icon}</span>}
    </span>
  );
}

export function Badge({
  variant = 'default',
  color = 'primary',
  size = 'medium',
  content,
  icon,
  showZero = true,
  children,
  className,
}: BadgeProps) {
  const suppressed = variant === 'default' && content === 0 && !showZero;
  const chip = suppressed ? null : <Chip variant={variant} color={color} size={variant === 'dot' ? 'small' : size} content={content} icon={icon} />;

  if (children) {
    return (
      <span className={['fab-badge', className].filter(Boolean).join(' ')}>
        {children}
        {chip && <span className="fab-badge__anchor">{chip}</span>}
      </span>
    );
  }
  return chip && <span className={['fab-badge-standalone', className].filter(Boolean).join(' ')}>{chip}</span>;
}
