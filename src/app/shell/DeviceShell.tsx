import type { ReactNode } from 'react';
import { useStore } from '../../studio/store';
import { clientById } from '../../config/clients';
import type { DeviceDef, DeviceId } from '../../config/devices';

/**
 * DeviceShell — wraps the checkout in native-feeling device chrome so each
 * preset reads like the real thing:
 *   desktop → a browser window (address bar with the brand's URL)
 *   tablet  → a tablet body + browser bar
 *   mobile  → a phone body + status bar, Safari-style address bar, home bar
 *
 * All chrome is rendered at the device's own pixel scale (inside the viewport),
 * so it shrinks proportionally when the frame is scaled. The website content
 * area keeps the full device width, so the checkout's responsive breakpoints
 * respond to the real viewport width.
 */

interface ShellMetrics {
  bezel: number; // dark device body thickness around the screen (0 for desktop)
  radius: number; // screen corner radius
  statusBar: number; // top OS status bar height (0 = none)
  browserBar: number; // browser address-bar height
  home: number; // bottom home indicator height (0 = none)
}

const METRICS: Record<DeviceId, ShellMetrics> = {
  desktop: { bezel: 0, radius: 10, statusBar: 0, browserBar: 48, home: 0 },
  tablet: { bezel: 18, radius: 22, statusBar: 28, browserBar: 52, home: 0 },
  mobile: { bezel: 14, radius: 52, statusBar: 52, browserBar: 46, home: 24 },
};

/** Intrinsic outer size of the shell (device body included) for scale maths. */
export function deviceShellSize(device: DeviceDef) {
  const m = METRICS[device.id];
  return { outerW: device.width + m.bezel * 2, outerH: device.height + m.bezel * 2, metrics: m };
}

export function DeviceShell({ device, children }: { device: DeviceDef; children: ReactNode }) {
  const m = METRICS[device.id];
  const clientId = useStore((s) => s.clientId);
  const domain = clientById(clientId).domain;

  return (
    <div
      className={`shell shell--${device.id}`}
      style={{ width: device.width + m.bezel * 2, height: device.height + m.bezel * 2, padding: m.bezel }}
    >
      <div className="shell__screen" style={{ borderRadius: m.radius }}>
        {m.statusBar > 0 && <StatusBar device={device.id} height={m.statusBar} />}
        <BrowserBar device={device.id} domain={domain} height={m.browserBar} />
        <div className="shell__web">{children}</div>
        {m.home > 0 && (
          <div className="shell__home" style={{ height: m.home }}>
            <span className="shell__home-bar" />
          </div>
        )}
      </div>
    </div>
  );
}

function StatusBar({ device, height }: { device: DeviceId; height: number }) {
  return (
    <div className="shell__status" style={{ height }}>
      <span className="shell__time">9:41</span>
      {device === 'mobile' && <span className="shell__island" />}
      <span className="shell__status-icons">
        <SignalIcon />
        <WifiIcon />
        <BatteryIcon />
      </span>
    </div>
  );
}

function BrowserBar({ device, domain, height }: { device: DeviceId; domain: string; height: number }) {
  if (device === 'desktop') {
    return (
      <div className="shell__browser shell__browser--desktop" style={{ height }}>
        <span className="shell__dots" aria-hidden>
          <i /><i /><i />
        </span>
        <span className="shell__tab">
          <span className="shell__favicon" />
          Checkout
        </span>
        <span className="shell__omnibox">
          <LockIcon />
          <span className="shell__url"><span className="shell__url-scheme">https://www.</span>{domain}<span className="shell__url-scheme">/checkout</span></span>
        </span>
        <span className="shell__browser-actions" aria-hidden><i /><i /></span>
      </div>
    );
  }
  // mobile / tablet — Safari-style
  return (
    <div className="shell__browser shell__browser--mobile" style={{ height }}>
      <span className="shell__omnibox shell__omnibox--mobile">
        <LockIcon />
        <span className="shell__url">{domain}</span>
        <ReloadIcon />
      </span>
    </div>
  );
}

/* --- tiny status/omnibox glyphs (neutral OS chrome) --- */
const LockIcon = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
    <rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" />
  </svg>
);
const ReloadIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
    <path d="M21 12a9 9 0 1 1-2.64-6.36" /><path d="M21 3v6h-6" />
  </svg>
);
const SignalIcon = () => (
  <svg width="17" height="11" viewBox="0 0 17 11" fill="currentColor"><rect x="0" y="7" width="3" height="4" rx="1" /><rect x="4.5" y="5" width="3" height="6" rx="1" /><rect x="9" y="2.5" width="3" height="8.5" rx="1" /><rect x="13.5" y="0" width="3" height="11" rx="1" /></svg>
);
const WifiIcon = () => (
  <svg width="16" height="12" viewBox="0 0 16 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M1 3.5a11 11 0 0 1 14 0" /><path d="M3.5 6.2a7 7 0 0 1 9 0" /><path d="M6 8.8a3 3 0 0 1 4 0" /><circle cx="8" cy="11" r="0.6" fill="currentColor" /></svg>
);
const BatteryIcon = () => (
  <svg width="26" height="12" viewBox="0 0 26 12" fill="none"><rect x="0.5" y="0.5" width="22" height="11" rx="3" stroke="currentColor" opacity="0.4" /><rect x="2" y="2" width="18" height="8" rx="1.5" fill="currentColor" /><rect x="24" y="4" width="1.5" height="4" rx="0.75" fill="currentColor" opacity="0.4" /></svg>
);
