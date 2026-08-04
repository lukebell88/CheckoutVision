import { useState } from 'react';
import { Tab } from '../Tab';
import './Tabs.css';

/**
 * Tabs — mirrors the Fabric v2 `<Tabs>` (node 37288-120972). A row of connected
 * "folder" tabs on a bottom track: the active tab lifts with a coloured top
 * highlight and breaks the track line beneath it.
 *
 * Composes `<Tab variant="default">` (the same way Figma models it), assigning
 * each tab its connected-border Position and Active/Enabled state.
 *
 * Controlled via `value`+`onChange`, or uncontrolled via `defaultValue`.
 */
export interface TabsProps {
  tabs: string[];
  value?: number;
  defaultValue?: number;
  onChange?: (index: number) => void;
  className?: string;
}

export function Tabs({ tabs, value, defaultValue = 0, onChange, className }: TabsProps) {
  const [internal, setInternal] = useState(defaultValue);
  const active = value ?? internal;

  const select = (i: number) => {
    if (value === undefined) setInternal(i);
    onChange?.(i);
  };

  return (
    <div className={['fab-tabs', className].filter(Boolean).join(' ')} role="tablist">
      <div className="fab-tabs__track" aria-hidden />
      {tabs.map((t, i) => (
        <Tab
          key={i}
          variant="default"
          position={i === 0 ? 'left' : i === tabs.length - 1 ? 'right' : 'inner'}
          state={i === active ? 'active' : 'enabled'}
          role="tab"
          aria-selected={i === active}
          onClick={() => select(i)}
        >
          {t}
        </Tab>
      ))}
    </div>
  );
}
