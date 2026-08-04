import { useState } from 'react';

/**
 * Local state seeded from runtime data, re-seeded when that data changes.
 *
 * Needed because the scenario arrives late: `LiveApp` applies the flow, flags and
 * screen from the URL in an effect AFTER the first render, and the studio can
 * swap flow or variant under a mounted tree. A plain `useState(() => data.x)`
 * snapshots whatever was there on mount and then ignores the real value forever —
 * which showed up as one flow's typed name surviving into another flow.
 *
 * Implemented with React's documented "adjust state when props change" pattern:
 * compare a seed key during render and reset immediately, rather than an effect
 * that would paint the stale value first. `seed` should be a primitive that
 * changes exactly when the data the state derives from changes.
 */
export function useSeededState<T>(seed: string, init: () => T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [value, setValue] = useState<T>(init);
  const [seen, setSeen] = useState(seed);

  if (seed !== seen) {
    setSeen(seed);
    setValue(init());
  }

  return [value, setValue];
}
