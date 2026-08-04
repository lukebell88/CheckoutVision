import { forwardRef } from 'react';

import { useStore, selectProjectState } from '../studio/store';

/**
 * Router shim for the lifted nav-section.
 *
 * Minimal's nav is path-driven: `usePathname()` decides which item is active and
 * `RouterLink` handles the click. The studio has no router — navigation is store
 * state — so instead of rewriting nav-section's active/open logic (which is the
 * fiddly part), we give it a **synthetic path** derived from the store:
 *
 *     /projects · /flows · /flows/<flowId> · /pages/<variantId> · /components · /config
 *
 * `isActiveLink` then works untouched, and `NavLink` turns a click on a synthetic
 * href back into the right store action.
 */

/** The studio's current location, as a path nav-section can match against. */
export function usePathname(): string {
  const view = useStore((s) => s.view);
  const ps = useStore(selectProjectState);

  switch (view) {
    case 'flows':
      return ps.flowId ? `/flows/${ps.flowId}` : '/flows';
    case 'pages':
      return ps.variantId ? `/pages/${ps.variantId}` : '/pages';
    default:
      return `/${view}`;
  }
}

/** Apply a synthetic path to the store. */
export function navigateTo(href: string) {
  const [, section, id] = href.split('/');
  const s = useStore.getState();

  switch (section) {
    case 'projects':
      s.setView('projects');
      break;
    case 'flows':
      s.setView('flows');
      if (id) s.setFlow(id);
      break;
    case 'pages':
      s.setView('pages');
      if (id) s.setVariant(id);
      break;
    case 'components':
    case 'config':
      s.setView(section);
      break;
    default:
      break;
  }
}

/**
 * Stands in for Minimal's `RouterLink`.
 *
 * NavItem spreads `{...baseProps}` (which carries this component and `href`) and
 * then `{...other}` — which includes NavList's own `onClick` for expanding a
 * group. `other` wins, so this composes the two: run whatever handler was passed
 * down, then navigate. That keeps nav-list.tsx and nav-item.tsx unmodified.
 */
type NavLinkProps = React.ComponentProps<'div'> & { href?: string };

export const RouterLink = forwardRef<HTMLDivElement, NavLinkProps>(
  ({ href, onClick, ...other }, ref) => (
    <div
      ref={ref}
      role="button"
      tabIndex={0}
      onClick={(e) => {
        onClick?.(e);
        if (href) navigateTo(href);
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          (e.currentTarget as HTMLElement).click();
        }
      }}
      {...other}
    />
  ),
);

RouterLink.displayName = 'StudioNavLink';
