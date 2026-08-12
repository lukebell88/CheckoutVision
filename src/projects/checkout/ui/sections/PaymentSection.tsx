import { useEffect, useRef } from 'react';
import { Button } from '../../../../components/Button';
import { Checkbox } from '../../../../components/Checkbox';
import { Icon } from '../../../../components/Icon';
import { useProjectRuntime } from '../../../../studio/runtime';
import { useCheckoutConfig } from '../../checkoutConfig';
import { cartTotals } from '../../cart';
import { FormField } from '../../components/FormField';
import { PaymentSelection, type PaymentOption } from '../../components/PaymentSelection';
import { PreferredPayment, type PreferredOther } from '../../components/PreferredPayment';
import { ApplePayButton, PayPalButton, PaymentLegal } from '../parts';
import { GiftCardForm } from '../GiftCardForm';
import { useSeededState } from '../useSeededState';

/**
 * The scheme / wallet logo shown on the right of each payment row. The wallet
 * logos live in the shared common/payment set; card and gift card are brand
 * feature icons so they follow the active brand. All are sized to one height
 * (auto width) by .co-payment__logo so the column reads evenly — see
 * PaymentSelection.css.
 */
function PaymentMark({ method }: { method: string }) {
  switch (method) {
    case 'nextpay':
      return <Icon name="payment-next-pay-v2-contained" category="common" brand="payment" className="co-payment__logo" />;
    case 'payin3':
      return <Icon name="payment-pay-in-3-contained" category="common" brand="payment" className="co-payment__logo" />;
    case 'apple':
      return <Icon name="payment-apple-pay" category="common" brand="payment" className="co-payment__logo" />;
    case 'paypal':
      return <Icon name="payment-paypal-m-ident" category="common" brand="payment" className="co-payment__logo" />;
    case 'giftcard':
      return <Icon name="giftcard" category="feature" className="co-payment__logo" />;
    case 'card':
    case 'saved':
      return <Icon name="card" category="feature" className="co-payment__logo" />;
    default:
      return null;
  }
}

/** The scheme logo for a remembered card (e.g. "mastercard" → payment-mastercard). */
function SchemeMark({ scheme }: { scheme?: string }) {
  if (!scheme) return null;
  return <Icon name={`payment-${scheme}`} category="common" brand="payment" className="co-payment__logo" />;
}

/**
 * 3. Payment.
 *
 * The chosen method expands in place — which is how the scamp absorbs what used
 * to be a separate "credit options" screen. Card is the only method with a form
 * behind it; the rest hand off, so they only reveal a pay button.
 *
 * This file is the adapter: it decides which methods a brand offers (from the
 * flags), writes their small print, and builds what card reveals. The list
 * chrome and the expand behaviour live in `components/PaymentSelection`.
 */
interface Method {
  id: string;
  title: string;
  meta?: string[];
  flag?: 'creditOptions' | 'savedPayment';
}

const METHODS: Method[] = [
  { id: 'saved', title: 'Saved card', flag: 'savedPayment' },
  { id: 'nextpay', title: 'nextpay', meta: ['Shop Now Pay Later*', '24.9% APR Representative Variable'], flag: 'creditOptions' },
  { id: 'payin3', title: 'pay in 3', meta: ['3 payments, 3 months*', '29.9% APR Representative Variable'], flag: 'creditOptions' },
  { id: 'apple', title: 'Apple Pay' },
  { id: 'card', title: 'Credit / Debit Card' },
  { id: 'paypal', title: 'PayPal' },
  { id: 'giftcard', title: 'Gift Card' },
];

/** The single-CTA button reads "Complete With <logo>" — name for a11y, logo shown. */
const COMPLETE_LABEL: Record<string, string> = {
  nextpay: 'Nextpay',
  payin3: 'Pay In 3',
};
const COMPLETE_LOGO: Record<string, string> = {
  nextpay: 'payment-next-pay-v2-contained',
  payin3: 'payment-pay-in-3-contained',
};

/** The remembered-card row at the top of a returning shopper's expanded list. */
const PREFERRED_ID = 'preferred';

export function PaymentSection({
  onPay,
  changing = false,
  onExpand,
}: {
  onPay?: () => void;
  /** A remembered-card shopper has tapped Change — show the full method list. */
  changing?: boolean;
  /** Expand from the collapsed preferred view to the list (owned by the header). */
  onExpand?: () => void;
}) {
  const { flags, payment, choices, delivery } = useCheckoutConfig();
  const { interactive, nav } = useProjectRuntime();
  const methods = METHODS.filter((m) => !m.flag || flags[m.flag]);

  // Redeem a gift card: record the amount (the order summary discounts the
  // total). If it clears the whole balance owed, complete; otherwise stay on
  // Payment so the shopper can settle the remainder with another method.
  const redeemGiftCard = (amount: number) => {
    if (!interactive) return;
    nav.patch('payment', { giftCardApplied: amount });
    if (cartTotals(delivery.method, amount).total <= 0) onPay?.();
  };

  // The choice drives how Payment presents itself; the payment DATA supplies the
  // specifics (which card, its scheme). A single-CTA presentation short-circuits
  // the whole list — see the early return below.
  const presentation = choices.paymentPresentation;
  const single = presentation === 'nextpay' || presentation === 'payin3' ? presentation : undefined;

  // A remembered method collapses to a summary with a Change link. "Preferred"
  // is a saved card (needs one in the data); Apple Pay / PayPal are remembered
  // wallets that stand alone. "None" opens the list with nothing selected.
  const walletPreferred =
    presentation === 'applepay' ? 'apple' : presentation === 'paypal' ? 'paypal' : undefined;
  const cardPreferred = presentation === 'preferred' && !!payment.card;
  const hasPreferred = cardPreferred || !!walletPreferred;
  const noneSelected = presentation === 'none';

  // When a card is remembered the list opens on that saved-card row
  // (`PREFERRED_ID`); a wallet opens on its own method row; otherwise on the
  // seeded method, or the saved/new-card default.
  const defaultMethod = cardPreferred
    ? PREFERRED_ID
    : walletPreferred
      ? walletPreferred
      : noneSelected
        ? ''
        : payment.method || (flags.savedPayment ? 'saved' : 'card');
  const [sel, setSel] = useSeededState<string>(defaultMethod, () => defaultMethod);

  // Expanding from the collapsed preferred view (Add New Card, Pay by Giftcard,
  // a wallet logo) reveals the full list — scroll the method they picked into
  // view once it's rendered, so it isn't left off-screen below the fold.
  const scrollReq = useRef(false);
  useEffect(() => {
    if (!changing || !scrollReq.current) return;
    scrollReq.current = false;
    document
      .querySelector('.co-payment__option--on')
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [changing]);

  const openApplePay = interactive ? () => nav.patch('overlay', { applePay: true }) : undefined;

  const payButton = (
    <Button variant="contained" color="primary" size="large" fullWidth onClick={onPay}>
      Pay now
    </Button>
  );

  const cardForm = (
    <>
      <div className="co-optin">
        <Checkbox label="Use Delivery Address as Billing Address" checked onChange={() => {}} />
      </div>
      <p className="co-section__required">
        Required Fields<span className="co-req">*</span>
      </p>
      <FormField label="Card Number" required placeholder="1234 5678 9123 4567" inputMode="numeric" />
      <FormField label="Cardholders Name" required placeholder="Name on card" />
      <div className="co-fieldrow">
        <FormField label="Expiry Date" required placeholder="MM/YY" />
        <FormField label="Security Code" required placeholder="123" />
      </div>
      {flags.saveCardPrompt && (
        <div className="co-optin">
          <Checkbox
            label="Checkout Faster. Securely save your card details for next time"
            checked
            onChange={() => {}}
          />
        </div>
      )}
      <p className="co-help">
        We only accept payments from cards that are registered at your billing address
      </p>
    </>
  );

  // nextpay reveals its marketing block: the pitch, the perks, the APR, then a
  // "Continue With nextpay" CTA and the soft-search reassurance.
  const nextpayForm = (
    <div className="co-nextpay">
      <p className="co-nextpay__intro">
        Our most flexible way of spreading the cost: pay as little as the Minimum Monthly Payment
        each month, up to your Full Balance^.
      </p>
      <ul className="co-nextpay__perks">
        <li>Pay nothing today**</li>
        <li>Priority VIP Sale Access*^</li>
        <li>10% off welcome offer‡</li>
      </ul>
      <p className="co-nextpay__apr">24.9% APR Representative variable</p>
      <Button
        variant="contained"
        color="primary"
        size="large"
        fullWidth
        onClick={onPay}
        aria-label="Continue With Nextpay"
        endIcon={
          <Icon name="payment-next-pay-v2-contained" category="common" brand="payment" className="co-paylogo" />
        }
      >
        Continue With
      </Button>
      <p className="co-nextpay__credit">Proceed without impacting your credit score±</p>
    </div>
  );

  // The pay button lives inside the selected method's reveal, not once at the
  // bottom — so it's right under the row the shopper just chose and can't be
  // missed. PayPal and Apple Pay carry their own wallet buttons; everything else
  // pays with "Pay now".
  const payFor = (id: string) =>
    id === 'paypal' ? <PayPalButton onClick={onPay} />
    : id === 'apple' ? <ApplePayButton onClick={openApplePay} />
    : payButton;

  const contentFor = (id: string) =>
    // Gift card and nextpay own their whole reveal (their own CTA); the rest show
    // a form (card) or nothing, then the shared pay button.
    id === 'giftcard' ? (
      <GiftCardForm onRedeem={redeemGiftCard} />
    ) : id === 'nextpay' ? (
      nextpayForm
    ) : (
      <>
        {id === 'card' ? cardForm : null}
        <div className="co-payment__pay">{payFor(id)}</div>
      </>
    );

  // Single-CTA presentation (nextpay / pay in 3): no method list, just one button
  // that completes the order, carrying the scheme's own logo.
  if (single) {
    return (
      <>
        <Button
          variant="contained"
          color="primary"
          size="large"
          fullWidth
          onClick={onPay}
          aria-label={`Complete With ${COMPLETE_LABEL[single]}`}
          endIcon={
            <Icon name={COMPLETE_LOGO[single]} category="common" brand="payment" className="co-paylogo" />
          }
        >
          Complete With
        </Button>
        <PaymentLegal />
      </>
    );
  }

  // Each method reveals its own pay button when selected (card and gift card
  // reveal a form above it). When a card is remembered, these sit under an
  // "Other payment methods" heading below the saved-card row.
  const methodOptions: PaymentOption[] = methods.map((m, i) => ({
    id: m.id,
    title: m.id === 'saved' ? (payment.savedCard || 'Saved card') : m.title,
    meta: m.meta,
    mark: <PaymentMark method={m.id} />,
    content: contentFor(m.id),
    // The "Other payment methods" heading only belongs above the list when a
    // saved-card row sits above it — wallets have no such row.
    sectionLabel: cardPreferred && i === 0 ? 'Other payment methods' : undefined,
  }));

  // The remembered card as its own preselected row: a "Debit/Credit card" label
  // over the card number, with the scheme logo on the right like every other row.
  const preferredOption: PaymentOption = {
    id: PREFERRED_ID,
    title: (
      <span className="co-payment__saved">
        <span className="co-payment__savedlabel">Debit/Credit card</span>
        <span className="co-payment__savednum">{payment.card || 'Card'}</span>
      </span>
    ),
    mark: <SchemeMark scheme={payment.scheme} />,
    content: contentFor(PREFERRED_ID),
  };

  // Only a saved card gets its own preselected row above the list; a remembered
  // wallet is just one of the list rows, selected.
  const options: PaymentOption[] = cardPreferred
    ? [preferredOption, ...methodOptions]
    : methodOptions;

  // Collapsed: the remembered method as a summary, the rest of the wallet as a
  // quiet row, and the pay button. Change (or tapping another method) reveals
  // the full list already selected on that method.
  if (hasPreferred && !changing) {
    const kind = cardPreferred ? 'card' : walletPreferred!; // 'card' | 'apple' | 'paypal'

    // Logos below the fold. For a saved card, exclude card + saved + gift card
    // (Add New Card / the gift-card link cover those). For a wallet, keep card as
    // an option and just drop the chosen wallet, saved and gift card.
    const excluded = kind === 'card' ? ['saved', 'card', 'giftcard'] : ['saved', 'giftcard'];
    const preferredMethodId = kind === 'card' ? payment.preferred : kind;
    const others: PreferredOther[] = methods
      .filter((m) => !excluded.includes(m.id) && m.id !== preferredMethodId)
      .map((m) => ({ id: m.id, mark: <PaymentMark method={m.id} /> }));

    const openList = (id?: string) => {
      if (!interactive) return;
      if (id) {
        setSel(id);
        // Scroll to the chosen method once the list is exposed.
        scrollReq.current = true;
      }
      onExpand?.();
    };

    // The remembered method leads: its label, its boxed mark and its own pay
    // button. A wallet has no "Add New Card".
    const label = kind === 'card' ? (payment.card || 'Card') : kind === 'apple' ? 'Apple Pay' : 'PayPal';
    const mark = kind === 'card' ? <SchemeMark scheme={payment.scheme} /> : <PaymentMark method={kind} />;
    const pay =
      kind === 'apple' ? <ApplePayButton onClick={openApplePay} />
      : kind === 'paypal' ? <PayPalButton onClick={onPay} />
      : payButton;

    return (
      <>
        <PreferredPayment
          cardLabel={label}
          cardMark={mark}
          others={others}
          onAddCard={kind === 'card' && interactive ? () => openList('card') : undefined}
          onGiftcard={interactive ? () => openList('giftcard') : undefined}
          onChooseAnother={interactive ? () => openList() : undefined}
          onSelectOther={interactive ? (id) => openList(id) : undefined}
          pay={pay}
        />
        <PaymentLegal />
      </>
    );
  }

  return (
    <>
      <PaymentSelection options={options} value={sel} onChange={setSel} />
      {/* The pay button now lives in the selected row; the legal fine print
          follows the list once a method is chosen. */}
      {sel !== '' && <PaymentLegal />}
    </>
  );
}
