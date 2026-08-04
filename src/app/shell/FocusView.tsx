import { useLayoutEffect, useRef, useState, useEffect } from 'react';
import { useStore, selectProjectState } from '../../studio/store';
import { RenderedProject, useProject } from '../../studio/runtime';
import { useStoreRuntime } from '../../studio/useRuntime';
import { flowById, screenDef } from '../../studio/project';
import { deviceById } from '../../config/devices';
import { clientById } from '../../config/clients';
import { buildLiveUrl } from '../../live/liveUrl';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

import { DeviceShell, deviceShellSize } from './DeviceShell';
import { IcClose, IcChevronLeft, IcChevronRight, IcExternal } from './icons';

/**
 * Full-screen focus mode: one interactive frame the presenter can walk through
 * using the project's own actions (or the prev/next controls). Escape or the
 * close button returns to the canvas.
 */
export function FocusView() {
  const project = useProject();
  const ps = useStore(selectProjectState);
  const flow = flowById(project, ps.flowId);
  const device = useStore((s) => s.device);
  const clientId = useStore((s) => s.clientId);
  const closeFocus = useStore((s) => s.closeFocus);
  const next = useStore((s) => s.next);
  const back = useStore((s) => s.back);

  const runtime = useStoreRuntime(ps.screen, true);

  const openInBrowser = () => {
    const url = buildLiveUrl({
      project: project.id,
      client: clientId,
      flow: ps.flowId,
      flags: ps.flags,
      screen: ps.screen,
    });
    window.open(url, '_blank', 'noopener');
  };

  const dev = deviceById(device);
  const client = clientById(clientId);
  const { outerW, outerH } = deviceShellSize(dev);
  const stageRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  const idx = flow.screens.findIndex((s) => s.id === ps.screen);
  const atStart = idx <= 0;
  const atEnd = idx >= flow.screens.length - 1;

  useLayoutEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const compute = () => {
      const pad = 48;
      const s = Math.min((stage.clientWidth - pad) / outerW, (stage.clientHeight - pad) / outerH, 1);
      setScale(s > 0 ? s : 1);
    };
    compute();
    const ro = new ResizeObserver(compute);
    ro.observe(stage);
    return () => ro.disconnect();
  }, [outerW, outerH]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeFocus();
      else if (e.key === 'ArrowRight' && !atEnd) next();
      else if (e.key === 'ArrowLeft' && !atStart) back();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [atEnd, atStart, next, back, closeFocus]);

  return (
    <div className="focus">
      {/* Toolbar on the theme; the stage below keeps its own geometry CSS. */}
      <Stack
        direction="row"
        sx={{
          alignItems: 'center',
          gap: 1,
          px: 1.5,
          py: 1,
          flex: 'none',
          bgcolor: 'background.paper',
          borderBottom: (t) => `1px solid ${t.vars.palette.divider}`,
        }}
      >
        <IconButton size="small" onClick={closeFocus} aria-label="Close (Esc)">
          <IcClose />
        </IconButton>

        <Stack direction="row" sx={{ alignItems: 'center', gap: 0.75, minWidth: 0 }}>
          <Typography variant="subtitle2" noWrap>
            {client.name}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.disabled' }}>
            ·
          </Typography>
          <Typography variant="body2" noWrap sx={{ color: 'text.secondary' }}>
            {flow.name}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.disabled' }}>
            ·
          </Typography>
          <Typography variant="body2" noWrap sx={{ color: 'text.secondary' }}>
            {screenDef(project, ps.screen).navLabel}
          </Typography>
        </Stack>

        <Stack direction="row" sx={{ alignItems: 'center', gap: 1, ml: 'auto' }}>
          <IconButton size="small" onClick={back} disabled={atStart} aria-label="Previous (←)">
            <IcChevronLeft />
          </IconButton>
          <Typography
            variant="caption"
            sx={{ color: 'text.secondary', fontVariantNumeric: 'tabular-nums' }}
          >
            {idx + 1} / {flow.screens.length}
          </Typography>
          <IconButton size="small" onClick={next} disabled={atEnd} aria-label="Next (→)">
            <IcChevronRight />
          </IconButton>
          <Divider orientation="vertical" flexItem sx={{ my: 0.5 }} />
          <Button
            size="small"
            variant="contained"
            onClick={openInBrowser}
            startIcon={<IcExternal size={16} />}
            title="Open this screen full-screen in a new browser tab"
          >
            Open in browser
          </Button>
        </Stack>
      </Stack>

      <div className="focus__stage" ref={stageRef}>
        <div className="focus__wrap" style={{ width: outerW * scale, height: outerH * scale }}>
          <div
            className="focus__scale"
            style={{ width: outerW, height: outerH, transform: `scale(${scale})`, transformOrigin: 'top left' }}
          >
            <DeviceShell device={dev}>
              <RenderedProject runtime={runtime} />
            </DeviceShell>
          </div>
        </div>
      </div>
    </div>
  );
}
