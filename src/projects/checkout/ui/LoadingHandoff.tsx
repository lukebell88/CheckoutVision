import { useEffect } from 'react';
import { useProjectRuntime } from '../../../studio/runtime';
import { useCheckoutConfig } from '../checkoutConfig';

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
  const { interactive, nav, flowId } = useProjectRuntime();
  const { customer, journey } = useCheckoutConfig();

  useEffect(() => {
    if (!interactive) return;
    const params = new URLSearchParams(window.location.search);
    const isLive = params.get('live') === '1' || params.get('mode') === 'live';

    const timer = setTimeout(() => {
      if (isLive) {
        const url = new URL(window.location.href);
        url.searchParams.delete('screen');
        url.searchParams.delete('guest');
        if (customer.signedIn) {
          // Account: reload into the authenticated checkout — the signed-in flow
          // (details/address done, remembered card on Payment) — carrying the
          // email so a gmail guest-match keeps the address they actually typed.
          url.searchParams.set('flow', 'signed-in');
          if (customer.email) url.searchParams.set('email', customer.email);
        } else if (journey.guestChosen) {
          // "Checkout As Guest": reload into the current flow's guest form (email
          // before name, domain-based match) — see LiveApp's `guest` handling.
          url.searchParams.set('flow', flowId);
          url.searchParams.set('guest', '1');
        } else {
          // Unknown guest: reload into the CURRENT flow, carrying the email so the
          // Next checkout reopens with it already captured (see LiveApp). Pin the
          // live flow id rather than trusting the URL's `flow`, which is stale
          // after a scenario-tray switch — otherwise the reload lands on whatever
          // flow the link was opened with, not the one the shopper is in.
          url.searchParams.set('flow', flowId);
          if (customer.email) url.searchParams.set('email', customer.email);
        }
        window.location.assign(url.toString());
      } else {
        nav.goTo('checkout');
      }
    }, HANDOFF_MS);

    return () => clearTimeout(timer);
  }, [interactive, nav, flowId, customer.signedIn, customer.email, journey.guestChosen]);

  // A blank white page — the "nothing" a cross-domain redirect shows. Covers the
  // header too, so it reads as a real page load rather than an in-app screen.
  return <div className="co-handoff" aria-hidden="true" />;
}
