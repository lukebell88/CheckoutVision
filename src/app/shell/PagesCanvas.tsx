import { useLayoutEffect, useRef, useState } from 'react';

import { useStore, selectProjectState } from '../../studio/store';
import { useProject } from '../../studio/runtime';
import { variantGroupById } from '../../studio/project';
import { deviceById } from '../../config/devices';
import { VariantFrame } from './Frame';
import { CanvasRoot, CanvasGrid } from './CanvasChrome';
import { ViewHeading } from './ViewHeading';

const GAP = 22;

/** The Pages workspace: a grid of the selected screen's variants. Title and
 * tools are contributed to the layout header (see StudioHeader). */
export function PagesCanvas() {
  const project = useProject();
  const variantId = useStore(selectProjectState).variantId;
  const device = useStore((s) => s.device);
  const columns = useStore((s) => s.columns);

  const group = variantGroupById(project, variantId);
  const dev = deviceById(device);
  const gridRef = useRef<HTMLDivElement>(null);
  const [cellWidth, setCellWidth] = useState(360);

  useLayoutEffect(() => {
    const el = gridRef.current;
    if (!el) return;
    const compute = () =>
      setCellWidth(Math.max(120, (el.clientWidth - GAP * (columns - 1)) / columns));
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
        heading={
          <ViewHeading
            title={group?.name ?? 'Pages'}
            subtitle={
              group
                ? group.description ?? `${group.versions.length} versions`
                : 'This project has no page variants.'
            }
          />
        }
      >
        {group?.versions.map((v) => (
          <VariantFrame
            key={v.id}
            screen={group.screen}
            variant={v}
            width={cellWidth}
            device={dev}
          />
        ))}
      </CanvasGrid>
    </CanvasRoot>
  );
}
