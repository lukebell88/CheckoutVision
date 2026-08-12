import { Button } from '../../../../components/Button';
import { Checkbox } from '../../../../components/Checkbox';
import { Icon } from '../../../../components/Icon';
import { useProjectRuntime } from '../../../../studio/runtime';
import { useCheckoutConfig } from '../../checkoutConfig';
import { FormField } from '../../components/FormField';
import { PaymentSelection, type PaymentOption } from '../../components/PaymentSelection';
import { PreferredPayment, type PreferredOther } from '../../components/PreferredPayment';
import { ApplePayButton, PayPalButton, PaymentLegal } from '../parts';
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
  const { flags, payment, choices } = useCheckoutConfig();
  const { interactive, nav } = useProjectRuntime();
  const methods = METHODS.filter((m) => !m.flag || flags[m.flag]);

  // The choice drives how Payment presents itself; the payment DATA supplies the
  // specifics (which card, its scheme). A single-CTA presentation short-circuits
  // the whole list — see the early return below.
  const presentation = choices.paymentPresentation;
  const single = presentation === 'nextpay' || presentation === 'payin3' ? presentation : undefined;

  // "Preferred" needs a remembered card to show; without one it falls back to the
  // list. "None" opens the list with nothing selected (an unknown shopper).
  const hasPreferred = presentation === 'preferred' && !!payment.card;
  const noneSelected = presentation === 'none';

  // When a card is remembered the list opens on that saved-card row
  // (`PREFERRED_ID`); otherwise on the seeded method, or the saved/new-card default.
  const defaultMethod = hasPreferred
    ? PREFERRED_ID
    : noneSelected
      ? ''
      : payment.method || (flags.savedPayment ? 'saved' : 'card');
  const [sel, setSel] = useSeededState<string>(defaultMethod, () => defaultMethod);

  const openApplePay = interactive ? () => nav.patch('overlay', { applePay: true }) : undefined;

  const payButton = (
    <Button variant="contained" color="primary" size="large" fullWidth onClick={onPay}>
      Pay now
    </Button>
  );

  // One pay button sits at the bottom of the method list and follows the
  // selection: PayPal and Apple Pay swap in their own wallet buttons, every
  // other method keeps "Pay now" (more method states to follow). Nothing
  // selected (guest, before they choose) shows no button.
  const bottomPay =
    sel === '' ? null
    : sel === 'paypal' ? <PayPalButton onClick={onPay} />
    : sel === 'apple' ? <ApplePayButton onClick={openApplePay} />
    : payButton;

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

  const giftCardForm = (
    <>
      <FormField label="Gift Card Number" required placeholder="1234 5678 9012 3456" inputMode="numeric" />
      <FormField label="PIN" required placeholder="1234" inputMode="numeric" />
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

  // Only card and gift card open (they carry a form). Handoff methods — saved,
  // nextpay, pay in 3, Apple Pay, PayPal — are plain radio rows; the bottom
  // button pays for whichever is selected. When a card is remembered, these sit
  // under an "Other payment methods" heading below the saved-card row.
  const methodOptions: PaymentOption[] = methods.map((m, i) => ({
    id: m.id,
    title: m.id === 'saved' ? (payment.savedCard || 'Saved card') : m.title,
    meta: m.meta,
    mark: <PaymentMark method={m.id} />,
    content: m.id === 'card' ? cardForm : m.id === 'giftcard' ? giftCardForm : undefined,
    sectionLabel: hasPreferred && i === 0 ? 'Other payment methods' : undefined,
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
  };

  const options: PaymentOption[] = hasPreferred
    ? [preferredOption, ...methodOptions]
    : methodOptions;

  // Collapsed: the remembered method as a summary, the rest of the wallet as a
  // quiet row, and the pay button. Change (or tapping another method) reveals
  // the full list already selected on that method.
  if (hasPreferred && !changing) {
    // The logos below the fold are the remaining wallets — nextpay, pay in 3,
    // Apple Pay, PayPal. Card and gift card are excluded: card is the remembered
    // method (Add New Card handles a fresh one) and gift card has its own
    // "Pay by Giftcard or eVoucher" link.
    const others: PreferredOther[] = methods
      .filter((m) => !['saved', 'card', 'giftcard'].includes(m.id) && m.id !== payment.preferred)
      .map((m) => ({
        id: m.id,
        mark: <PaymentMark method={m.id} />,
      }));

    const openList = (id?: string) => {
      if (!interactive) return;
      if (id) setSel(id);
      onExpand?.();
    };

    return (
      <>
        <PreferredPayment
          label="Debit / Credit Card"
          cardLabel={payment.card || 'Card'}
          cardMark={<SchemeMark scheme={payment.scheme} />}
          others={others}
          onAddCard={interactive ? () => openList('card') : undefined}
          onGiftcard={interactive ? () => openList('giftcard') : undefined}
          onChooseAnother={interactive ? () => openList() : undefined}
          onSelectOther={interactive ? (id) => openList(id) : undefined}
          pay={payButton}
        />
        <PaymentLegal />
      </>
    );
  }

  return (
    <>
      <PaymentSelection options={options} value={sel} onChange={setSel} />
      {bottomPay && (
        <>
          <div className="co-payment__pay">{bottomPay}</div>
          <PaymentLegal />
        </>
      )}
    </>
  );
}
