import { Tab } from '../Tab';
import './AppBarNav.css';

/**
 * AppBarNav — mirrors the Fabric v2 `<AppBarNav>` (node 9065:69103). "Tabs make
 * it easy to explore and switch between different views." A horizontally
 * scrolling row of nav Tabs with a right-edge gradient fade.
 */
export interface AppBarNavProps {
  tabs?: string[];
  activeIndex?: number;
}

export function AppBarNav({ tabs = Array.from({ length: 14 }, () => 'Tab'), activeIndex }: AppBarNavProps) {
  return (
    <div className="fab-appbar-nav">
      <div className="fab-appbar-nav__scroll">
        {tabs.map((t, i) => (
          <Tab key={i} active={i === activeIndex}>
            {t}
          </Tab>
        ))}
      </div>
      <div className="fab-appbar-nav__fade" aria-hidden />
    </div>
  );
}
