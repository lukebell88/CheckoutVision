import { useEffect, useRef, useState, type ReactNode } from 'react';
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
  const { customer, progress, delivery, payment, choices } = useCheckoutConfig();
  const { interactive, nav } = useProjectRuntime();
  const { total, delivery: deliveryCost } = cartTotals(delivery.method);

  // A returning shopper's Payment section opens collapsed on their remembered
  // card, with a Change link in the section header (like Details/Delivery) that
  // expands the full method list. Kept here so the header owns the link. Driven
  // by the payment-presentation choice, matching PaymentSection.
  const hasPreferred = choices.paymentPresentation === 'preferred' && !!payment.card;
  const [payExpanded, setPayExpanded] = useSeededState<boolean>(
    `${choices.paymentPresentation}|${payment.card ?? ''}`,
    () => false,
  );

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

  // The "landing": on any advance (guest Continue, verify→Payment, …) the
  // resolved sections fade in and the newly-opened section scrolls into view, so
  // it reads as being moved to the next step rather than the tall form collapsing
  // and everything below jumping up. Reset after the beat so ordinary opens don't
  // inherit the fade.
  const [landing, setLanding] = useState(false);
  const sectionEls = useRef<Record<string, HTMLElement | null>>({});

  const emailLocked = ef.phase === 'locked';

  useEffect(() => {
    if (!landing) return;
    // 'complete' has no section to scroll to — the place-order button is inline.
    if (section !== 'complete') {
      sectionEls.current[section]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    const t = window.setTimeout(() => setLanding(false), 500);
    return () => window.clearTimeout(t);
  }, [landing, section]);

  const advance = (from: SectionId) => {
    if (!interactive) return undefined;
    return () => {
      setDone((d) => (d.includes(from) ? d : [...d, from]));
      setSection(nextSection(from) ?? 'complete');
      setLanding(true);
    };
  };

  // A recognised account verifies inside section 1: sign them in and let the
  // account fill Details + Delivery, so the journey lands on Payment.
  const onAccountVerified = () => {
    if (!interactive) return;
    ef.onVerified();
    setDone(['details', 'delivery']);
    setSection('payment');
    setLanding(true);
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

  // The page is always titled "Checkout" — it never switches to "Guest Checkout",
  // which read as a downgrade the moment a shopper started entering details.
  const title = 'Checkout';

  const BODIES: Record<SectionId, ReactNode> = {
    // Email-first: section 1 is the identity step (email → verify / guest name).
    details: ef.active ? (
      <IdentityStep ef={ef} onGuestContinue={advance('details')} onAccountVerified={onAccountVerified} />
    ) : (
      <DetailsSection onContinue={advance('details')} />
    ),
    delivery: <DeliverySection onContinue={advance('delivery')} />,
    payment: (
      <PaymentSection
        onPay={interactive ? () => nav.goTo('confirmation') : undefined}
        changing={payExpanded}
        onExpand={interactive ? () => setPayExpanded(true) : undefined}
      />
    ),
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
    // Payment carries its own per-method "Required Fields" inside the card form,
    // so the section header never repeats it.
    const showRequired =
      isOpen && !complete && id !== 'payment' && (!ef.active || id !== 'details' || detailsGuestForm);
    // Payment's collapsed preferred state gets a Change link in the header, in
    // line with the title like the done sections above it.
    const payChange = id === 'payment' && isOpen && hasPreferred && !payExpanded && interactive;
    // A signed-in account shopper can't edit their account's name/address inside
    // checkout, so Your Details shows no Change link — there's nothing for it to
    // do (the "that isn't me" route lived on the sign-in page they came from).
    const showChange = complete && !isOpen && !(id === 'details' && detailsFromAccount);
    return (
      <section
        key={id}
        ref={(el) => {
          sectionEls.current[id] = el;
        }}
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
          {showChange && (
            <Link href="#" textStyle="body-3" onClick={(e) => { e.preventDefault(); change(id)?.(); }}>
              Change
            </Link>
          )}
          {payChange && (
            <Link href="#" textStyle="body-3" onClick={(e) => { e.preventDefault(); setPayExpanded(true); }}>
              Change
            </Link>
          )}
        </div>

        {emailStep && (
          <p className="co-section__sub">Enter your email address to continue</p>
        )}

        {isOpen ? (
          <div className={`co-section__body${landing ? ' co-fadein' : ''}`}>{BODIES[id]}</div>
        ) : complete ? (
          <div className={`co-section__summary${landing ? ' co-fadein' : ''}`}>
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
          <span className="co-totalbar__amount">Total: {money(total)}</span>{' '}
          <span className="co-totalbar__delivery">
            {deliveryCost === 0 ? '(FREE delivery)' : `(inc ${money(deliveryCost)} delivery)`}
          </span>
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
  const { customer, delivery, payment } = useCheckoutConfig();
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
    // Collection and Parcel Shop both collect from a chosen point (delivery.store).
    const collect = delivery.method === 'collection' || delivery.method === 'parcel';
    const address = collect
      ? join([delivery.store])
      : join([delivery.line1, delivery.line2, delivery.city, delivery.postcode, customer.phone]);
    return (
      <>
        <div className="co-summary__label">{collect ? 'Collect from:' : 'Deliver to:'}</div>
        {address && <div>{address}</div>}
        {delivery.date && (
          <div className="co-summary__strong">
            {collect ? 'Collection Date' : 'Delivery Date'}: {delivery.date}
          </div>
        )}
      </>
    );
  }

  return <div>{payment.savedCard ?? 'Card ending 4567'}</div>;
}
