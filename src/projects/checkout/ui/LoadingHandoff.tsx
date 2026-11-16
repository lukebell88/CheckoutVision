import { useEffect } from 'react';
import { useProjectRuntime } from '../../../studio/runtime';

/**
 * The login → checkout handoff.
 *
 * In the real journey the login page is hosted by Auth0 and the delivery/payment
 * pages by Next — different domains — so finishing login triggers a genuine
 * full-page redirect, not a smooth in-app step. The pages are styled to look
 * identical, so all the shopper sees is a blank page and a refresh.
 *
 * We reproduce that: a blank screen, then on a live link an actual
 * `window.location` reload to the checkout URL (the prototype's state lives in
 * the query string, so it re-initialises straight into the checkout). In the
 * studio a real reload would reload the whole studio, so there we just advance.
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
        url.searchParams.set('screen', 'checkout');
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
