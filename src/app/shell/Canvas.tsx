import { useLayoutEffect, useRef, useState } from 'react';

import { useStore, selectProjectState } from '../../studio/store';
import { useProject } from '../../studio/runtime';
import { flowById } from '../../studio/project';
import { deviceById } from '../../config/devices';
import { Frame } from './Frame';
import { CanvasRoot, CanvasGrid } from './CanvasChrome';
import { ViewHeading } from './ViewHeading';

const GAP = 22; // px gap between frames

/** The main workspace: a grid of the active flow's screens. Title and tools
 * are contributed to the layout header (see StudioHeader). */
export function Canvas() {
  const project = useProject();
  const flow = flowById(project, useStore(selectProjectState).flowId);
  const device = useStore((s) => s.device);
  const columns = useStore((s) => s.columns);

  const dev = deviceById(device);
  const gridRef = useRef<HTMLDivElement>(null);
  const [cellWidth, setCellWidth] = useState(360);

  useLayoutEffect(() => {
    const el = gridRef.current;
    if (!el) return;
    const compute = () => {
      const w = el.clientWidth;
      setCellWidth(Math.max(120, (w - GAP * (columns - 1)) / columns));
    };
    compute();
    const ro = new ResizeObserver(compute);
    ro.observe(el);
    return () => ro.disconnect();
  }, [columns]);

  return (
    <CanvasRoot>
      <CanvasGrid
        gap={GAP}
        gridRef={gridRef}
        heading={<ViewHeading title={flow.name} subtitle={flow.description} />}
      >
        {flow.screens.map((s) => (
          <Frame key={s.id} screen={s.id} optional={s.optional} width={cellWidth} device={dev} />
        ))}
      </CanvasGrid>
    </CanvasRoot>
  );
}
