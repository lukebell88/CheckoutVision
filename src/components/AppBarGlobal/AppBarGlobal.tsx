import { Fragment } from 'react';
import { Link } from '../Link';
import { Divider } from '../Divider';
import './AppBarGlobal.css';

/**
 * AppBarGlobal — mirrors the Fabric v2 `<AppBarGlobal>` (node 9192:74176). "The
 * App Bar displays information and actions relating to the current screen."
 * Centred promo message with right-aligned links separated by a divider.
 */
export interface AppBarGlobalLink {
  label: string;
  href?: string;
}

export interface AppBarGlobalProps {
  message?: string;
  links?: AppBarGlobalLink[];
}

export function AppBarGlobal({
  message = 'Next day delivery to home or free to store*',
  links = [{ label: 'Link' }, { label: 'Link' }],
}: AppBarGlobalProps) {
  return (
    <div className="fab-appbar-global">
      {message && <p className="fab-appbar-global__message">{message}</p>}
      <div className="fab-appbar-global__links">
        {links.map((l, i) => (
          <Fragment key={i}>
            {i > 0 && <Divider orientation="vertical" className="fab-appbar-global__divider" />}
            <Link href={l.href} underline="always" textStyle="body-4">
              {l.label}
            </Link>
          </Fragment>
        ))}
      </div>
    </div>
  );
}
