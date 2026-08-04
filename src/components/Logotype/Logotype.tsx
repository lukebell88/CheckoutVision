import { useContext } from 'react';
import { IconBrandContext } from '../Icon/Icon';
import { logo } from '../../theme/icons';
import './Logotype.css';

/**
 * Logotype — mirrors the Fabric v2 `<Logotype>` (node 8989:65272), the brand
 * wordmark shown in the app bar. Resolves the current brand's logo from
 * /iconography/logotype via `logo()`, falling back through -default → -wide →
 * -narrow → the generic "logo". Brand defaults to the active IconBrandContext
 * so it tracks the previewed / checked-out client.
 */
export interface LogotypeProps {
  /** Brand id (e.g. "next"). Defaults to the active IconBrandContext. */
  brand?: string;
  /** Explicit src override — wins over brand resolution. */
  src?: string;
  /** Rendered height in px (brand bar ~20, secure/inline ~12). */
  height?: number;
  className?: string;
}

export function Logotype({ brand, src, height = 20, className }: LogotypeProps) {
  const ctx = useContext(IconBrandContext);
  const b = brand ?? ctx;
  const url =
    src ??
    logo(`${b}-default`) ??
    logo(`${b}-wide`) ??
    logo(`${b}-narrow`) ??
    logo('logo-default');

  return (
    <span className={['fab-logotype', className].filter(Boolean).join(' ')} style={{ height }}>
      {url ? <img src={url} alt={b} style={{ height }} /> : <strong>{b}</strong>}
    </span>
  );
}
