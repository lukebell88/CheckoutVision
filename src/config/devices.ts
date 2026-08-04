/**
 * Device presets for the responsive preview.
 *
 * `width`/`height` are the CSS-pixel dimensions of the emulated viewport. The
 * preview frame is set to exactly these dimensions and then scaled-to-fit the
 * workspace — so the checkout's container-query breakpoints react to `width`,
 * never to the real browser window.
 */
export interface DeviceDef {
  id: DeviceId;
  name: string;
  width: number;
  height: number;
  /** Sensible default number of frames-per-row for this device in the canvas. */
  defaultColumns: number;
}

export type DeviceId = 'desktop' | 'tablet' | 'mobile';

export const DEVICES: DeviceDef[] = [
  { id: 'desktop', name: 'Desktop', width: 1280, height: 832, defaultColumns: 2 },
  { id: 'tablet', name: 'Tablet', width: 768, height: 1024, defaultColumns: 3 },
  { id: 'mobile', name: 'Mobile', width: 390, height: 844, defaultColumns: 4 },
];

/** Column-count choices offered in the canvas toolbar. */
export const COLUMN_CHOICES = [1, 2, 3, 4, 5, 6];

export const DEFAULT_DEVICE_ID: DeviceId = 'desktop';

export const deviceById = (id: DeviceId): DeviceDef =>
  DEVICES.find((d) => d.id === id) ?? DEVICES[0];
