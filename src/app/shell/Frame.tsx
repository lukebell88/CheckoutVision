import type { ReactNode } from 'react';
import { useStore } from '../../studio/store';
import { RenderedProject, useProject } from '../../studio/runtime';
import { useStoreRuntime, useVariantRuntime } from '../../studio/useRuntime';
import { screenDef, type Variant } from '../../studio/project';
import type { DeviceDef } from '../../config/devices';
import { DeviceShell, deviceShellSize } from './DeviceShell';

/**
 * A captioned frame in a canvas: a scaled rendering of one project screen inside
 * device chrome.
 *
 * The frame knows nothing about what it renders — it builds a runtime, hands it
 * to `project.render()` and provides it via context for anything nested.
 */

/** Shared presentation: caption, device chrome, scale-to-fit, optional click target. */
function FrameShell({
  caption,
  optional,
  width,
  device,
  onOpen,
  children,
}: {
  caption: string;
  optional?: boolean;
  width: number;
  device: DeviceDef;
  onOpen?: () => void;
  children: ReactNode;
}) {
  const { outerW, outerH } = deviceShellSize(device);
  const scale = width / outerW;
  const height = outerH * scale;

  const scaled = (
    <div
      className="frame__scale"
      style={{ width: outerW, height: outerH, transform: `scale(${scale})`, transformOrigin: 'top left' }}
    >
      <DeviceShell device={device}>{children}</DeviceShell>
    </div>
  );

  return (
    <div className="frame" style={{ width }}>
      <div className="frame__caption">
        <span className="frame__label">{caption}</span>
        {optional && <span className="frame__badge">optional</span>}
      </div>

      {onOpen ? (
        <div
          className={`frame__device frame__device--${device.id}`}
          style={{ width, height }}
          role="button"
          tabIndex={0}
          onClick={onOpen}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onOpen();
            }
          }}
          title={`Open ${caption}`}
        >
          {scaled}
        </div>
      ) : (
        <div className={`frame__device frame__device--${device.id} frame__device--static`} style={{ width, height }}>
          {scaled}
        </div>
      )}
    </div>
  );
}

/** Flows view: one screen of the active flow, click → focus mode. */
export function Frame({
  screen,
  optional,
  width,
  device,
}: {
  screen: string;
  optional?: boolean;
  width: number;
  device: DeviceDef;
}) {
  const project = useProject();
  const openFocus = useStore((s) => s.openFocus);
  const runtime = useStoreRuntime(screen, false);

  return (
    <FrameShell
      caption={screenDef(project, screen).navLabel}
      optional={optional}
      width={width}
      device={device}
      onOpen={() => openFocus(screen)}
    >
      <RenderedProject runtime={runtime} />
    </FrameShell>
  );
}

/** Pages view: one variant of a screen, captioned with the variant label, static. */
export function VariantFrame({
  screen,
  variant,
  width,
  device,
}: {
  screen: string;
  variant: Variant;
  width: number;
  device: DeviceDef;
}) {
  const runtime = useVariantRuntime(screen, variant);

  return (
    <FrameShell caption={variant.label} width={width} device={device}>
      <RenderedProject runtime={runtime} />
    </FrameShell>
  );
}
