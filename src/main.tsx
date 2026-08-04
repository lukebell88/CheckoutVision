import React, { Suspense, lazy } from 'react';
import ReactDOM from 'react-dom/client';
import { LiveApp } from './live/LiveApp';
import { ensureThemesInjected } from './theme/themes';
import { readLiveParams } from './live/liveUrl';
import { useStore } from './studio/store';
import { isProjectId } from './studio/registry';
import './base.css';

/**
 * The studio and the dev component playground are lazy: neither is part of what
 * a tester downloads. Live mode is the only eager path, so a phone opening a
 * live link gets the prototype and nothing else — no studio chrome, no MUI.
 */
const App = lazy(() => import('./app/App').then((m) => ({ default: m.App })));
const ComponentPreview = lazy(() =>
  import('./components/preview/ComponentPreview').then((m) => ({ default: m.ComponentPreview })),
);

ensureThemesInjected();

// A live link (?live=1&…) opens the bare prototype on the tester's real device;
// `?preview=1` opens the dev component playground; otherwise the studio loads.
const params = new URLSearchParams(window.location.search);
const isLive = readLiveParams().isLive;
const isPreview = params.get('preview') != null;

// `?project=<id>` also works on the studio itself, so a designer can bookmark or
// send "the Checkout studio". LiveApp handles the same param for live links.
if (!isLive && !isPreview) {
  const requested = params.get('project');
  if (requested && isProjectId(requested)) useStore.getState().setProject(requested);
}

// Apply the persisted studio theme up-front (persist rehydrates synchronously)
// so there is no light/dark flash on first paint.
document.documentElement.setAttribute('data-theme', useStore.getState().theme);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {isLive ? (
      <LiveApp />
    ) : (
      <Suspense fallback={null}>{isPreview ? <ComponentPreview /> : <App />}</Suspense>
    )}
  </React.StrictMode>,
);
