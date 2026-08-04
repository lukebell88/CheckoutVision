import './Divider.css';

/**
 * Divider — mirrors the Fabric v2 `<Divider>` (node 8899:60539). "A divider is
 * a thin line that groups content in lists and layouts." Token-driven colour so
 * it re-themes per client.
 */
export interface DividerProps {
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

export function Divider({ orientation = 'horizontal', className }: DividerProps) {
  return (
    <div
      className={['fab-divider', `fab-divider--${orientation}`, className].filter(Boolean).join(' ')}
      role="separator"
      aria-orientation={orientation}
    />
  );
}
