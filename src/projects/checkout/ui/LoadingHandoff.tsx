import { useEffect } from 'react';
import { useProjectRuntime } from '../../../studio/runtime';

/**
 * The login → checkout handoff.
 *
 * Once the shopper confirms their identity, the real journey passes from the
 * Auth0-hosted login to the Next-hosted checkout — a different domain, so it's a
 * genuine full-page redirect, not a smooth in-app step. The pages look identical,
 * so all the shopper sees is a blank page and a refresh.
 *
 * We reproduce that: a blank screen, then on a live link an actual
 * `window.location` reload into the signed-in checkout (the `signed-in` flow —
 * the authenticated, prefilled state). In the studio a real reload would reload
 * the whole studio, so there we just advance in-app.
 */
const HANDOFF_MS = 850;

export function LoadingHandoff() {
  const { interactive, nav } = useProjectRuntime();

  useEffect(() => {
    if (!interactive) return;
    const params = new URLSearchParams(window.location.search);
    const isLive = params.get('live') === '1' || params.get('mode') === 'live';

    const timer = setTimeout(() => {
      if (isLive) {
        const url = new URL(window.location.href);
        // Reload into the authenticated checkout. The signed-in flow is the
        // post-login state (details/address done, remembered card on Payment).
        url.searchParams.set('flow', 'signed-in');
        url.searchParams.delete('screen');
        window.location.assign(url.toString());
      } else {
        nav.goTo('checkout');
      }
    }, HANDOFF_MS);

    return () => clearTimeout(timer);
  }, [interactive, nav]);

  // A blank white page — the "nothing" a cross-domain redirect shows. Covers the
  // header too, so it reads as a real page load rather than an in-app screen.
  return <div className="co-handoff" aria-hidden="true" />;
}
