import { useState, type ReactNode } from 'react';
import { useSeededState } from './useSeededState';
import { useProjectRuntime } from '../../../studio/runtime';
import { Button } from '../../../components/Button';
import { Link } from '../../../components/Link';
import { useCheckoutConfig, openSection, isDone } from '../checkoutConfig';
import { SECTIONS, SECTION_LABEL, nextSection, type SectionId } from '../screens';
import { cartTotals, money } from '../cart';
import { DetailsSection } from './sections/DetailsSection';
import { DeliverySection } from './sections/DeliverySection';
import { PaymentSection } from './sections/PaymentSection';
import { OrderPanel, OrderToggle } from './OrderPanel';
import { TitleBar } from '../components/TitleBar';
import { IdentityStep } from './IdentityStep';
import { useEmailFirst } from './useEmailFirst';

/**
 * The checkout — one page, three numbered sections.
 *
 * This is the shape the scamp is really proposing: not a sequence of pages but a
 * single page where "1. Your Details / 2. Delivery / 3. Payment" open one at a
 * time and collapse behind a Change link once done. There is no separate review
 * step, because the collapsed summaries ARE the review.
 *
 * Which section is open comes from the runtime (`progress.section`), so a flow,
 * a Pages variant and a live link can all drop a viewer straight into "delivery
 * open, details done" without any navigation happening. Inside an interactive
 * runtime the Continue buttons move it locally.
 *
 * At tablet and above the order panel stops being a VIEW ORDER disclosure and
 * becomes a permanent column — see checkout.css. The scamp is mobile-only, so
 * that's the one piece of layout it doesn't dictate.
 */
export function OnePageCheckout() {
  const { customer, progress, delivery } = useCheckoutConfig();
  const { interactive, nav } = useProjectRuntime();
  const { total, delivery: deliveryCost } = cartTotals(delivery.method);

  // Email-first: the sign-in page is gone, so the one-pager captures the email
  // (and verifies a recognised shopper) up top before revealing the sections.
  const ef = useEmailFirst();

  // The runtime seeds it; interactive walkthroughs then drive it locally so the
  // shopper isn't navigating between screens to fill in one page.
  const seed = `${progress.section}|${(progress.done ?? []).join(',')}`;
  const [section, setSection] = useSeededState<SectionId | 'complete'>(seed, () => openSection(progress));
  const [done, setDone] = useSeededState<SectionId[]>(seed, () =>
    SECTIONS.filter((s) => isDone(progress, s)),
  );
  const [orderOpen, setOrderOpen] = useState(false);

  const emailLocked = ef.phase === 'locked';

  const advance = (from: SectionId) => {
    if (!interactive) return undefined;
    return () => {
      setDone((d) => (d.includes(from) ? d : [...d, from]));
      setSection(nextSection(from) ?? 'complete');
    };
  };

  // A recognised account verifies inside section 1: sign them in and let the
  // account fill Details + Delivery, so the journey lands on Payment.
  const onAccountVerified = () => {
    if (!interactive) return;
    ef.onVerified();
    setDone(['details', 'delivery']);
    setSection('payment');
  };

  /**
   * Change means two different things depending on where a section's contents
   * came from.
   *
   * Typed by the shopper → reopen the section so they can edit it in place.
   *
   * Supplied by an account → the details aren't theirs to edit here; what they
   * actually want is "that isn't me". So Your Details sends them back to sign-in
   * to use a different address. Reopening it would offer to edit an account's
   * name inside a checkout, which isn't a thing this journey can do.
   */
  const detailsFromAccount = !!customer.signedIn;

  const change = (id: SectionId) => {
    if (!interactive) return undefined;
    if (id === 'details' && ef.active) {
      // Account: "that isn't me" — clear the email and reopen the email step.
      // Guest: just reopen Your Details to edit the name (email kept).
      if (detailsFromAccount) {
        return () => {
          ef.onChangeEmail();
          setDone([]);
          setSection('details');
        };
      }
      return () => setSection('details');
    }
    // No email-first, account details came from sign-in — send them back there.
    if (id === 'details' && detailsFromAccount) return () => nav.goTo('signin');
    return () => setSection(id);
  };

  // A shopper whose details came from their account sees "Checkout"; a guest
  // typing everything in sees "Guest Checkout". Under email-first a recognised
  // shopper counts as known even before the passcode step, so the title doesn't
  // read "Guest" while they're verifying an account we've already matched.
  const knownShopper = detailsFromAccount || (ef.active && !!customer.recognised);
  const title = knownShopper ? 'Checkout' : 'Guest Checkout';

  const BODIES: Record<SectionId, ReactNode> = {
    // Email-first: section 1 is the identity step (email → verify / guest name).
    details: ef.active ? (
      <IdentityStep ef={ef} onGuestContinue={advance('details')} onAccountVerified={onAccountVerified} />
    ) : (
      <DetailsSection onContinue={advance('details')} />
    ),
    delivery: <DeliverySection onContinue={advance('delivery')} />,
    payment: <PaymentSection onPay={interactive ? () => nav.goTo('confirmation') : undefined} />,
  };

  const sectionNodes = SECTIONS.map((id, i) => {
    const isOpen = section === id;
    const complete = done.includes(id) || section === 'complete';
    // The email-entry sub-state of section 1 carries a subtitle. "Required
    // Fields" only belongs to a form the shopper fills — so under email-first
    // it shows only on the guest name form, never on the email or verify steps.
    const emailStep = ef.active && id === 'details' && isOpen && !emailLocked;
    const detailsGuestForm =
      ef.active && id === 'details' && emailLocked && !ef.recognised && !ef.checking;
    const showRequired =
      isOpen && !complete && (!ef.active || id !== 'details' || detailsGuestForm);
    return (
      <section
        key={id}
        className={[
          'co-section',
          isOpen && 'co-section--open',
          complete && !isOpen && 'co-section--done',
        ]
          .filter(Boolean)
          .join(' ')}
        aria-current={isOpen ? 'step' : undefined}
      >
        <div className="co-section__head">
          <h2 className="co-section__title">
            <span className="co-section__num">{i + 1}.</span> {SECTION_LABEL[id]}
          </h2>
          {showRequired && (
            <span className="co-section__required">
              Required Fields<span className="co-req">*</span>
            </span>
          )}
          {complete && !isOpen && (
            <Link href="#" onClick={(e) => { e.preventDefault(); change(id)?.(); }}>
              Change
            </Link>
          )}
        </div>

        {emailStep && (
          <p className="co-section__sub">Enter your email address to continue</p>
        )}

        {isOpen ? (
          <div className="co-section__body">{BODIES[id]}</div>
        ) : complete ? (
          <div className="co-section__summary">
            <SectionSummary id={id} />
          </div>
        ) : null}
      </section>
    );
  });

  return (
    <main className="co-screen co-screen--checkout">
      <TitleBar title={title} onBack={interactive ? nav.back : undefined} />

      <div className="co-totalbar">
        <span className="co-totalbar__total">
          Total: <strong>{money(total)}</strong>{' '}
          {deliveryCost === 0 ? '(FREE delivery)' : `(inc ${money(deliveryCost)} delivery)`}
        </span>
        <OrderToggle open={orderOpen} onToggle={() => setOrderOpen((v) => !v)} />
      </div>

      <div className="co-onepage">
        <OrderPanel open={orderOpen} />

        {/* The three numbered stages are always present — the current one open,
            done ones collapsed with a Change link, and not-yet-reached ones
            collapsed in the disabled colour (see checkout.css). */}
        <div className="co-sections">{sectionNodes}</div>

        {section === 'complete' && (
          <div className="co-placeorder">
            <Button
              variant="contained"
              color="primary"
              size="large"
              fullWidth
              onClick={interactive ? () => nav.goTo('confirmation') : undefined}
            >
              Pay now
            </Button>
          </div>
        )}
      </div>
    </main>
  );
}

/**
 * The recap a completed section collapses to.
 *
 * Shows only what's actually known. No sample-data fallbacks: a guest who typed
 * their own name must see their own name here, and an empty field must read as
 * empty rather than as somebody else's address.
 */
function SectionSummary({ id }: { id: SectionId }) {
  const { customer, delivery, payment, flags } = useCheckoutConfig();
  const join = (parts: (string | undefined)[]) => parts.filter(Boolean).join(', ');

  if (id === 'details') {
    const name = [customer.firstName, customer.lastName].filter(Boolean).join(' ');
    return (
      <>
        {customer.email && <div>{customer.email}</div>}
        {name && <div>{name}</div>}
      </>
    );
  }

  if (id === 'delivery') {
    const collection = delivery.method === 'collection';
    const address = collection
      ? join([delivery.store])
      : join([delivery.line1, delivery.line2, delivery.city, delivery.postcode, customer.phone]);
    return (
      <>
        <div className="co-summary__label">{collection ? 'Collect from:' : 'Deliver to:'}</div>
        {address && <div>{address}</div>}
        {flags.deliveryDates && delivery.date && (
          <div className="co-summary__strong">Delivery Date: {delivery.date}</div>
        )}
      </>
    );
  }

  return <div>{payment.savedCard ?? 'Card ending 4567'}</div>;
}
