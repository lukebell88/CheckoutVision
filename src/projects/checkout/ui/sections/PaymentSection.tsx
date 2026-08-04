import { Button } from '../../../../components/Button';
import { Checkbox } from '../../../../components/Checkbox';
import { Icon } from '../../../../components/Icon';
import { useCheckoutConfig } from '../../checkoutConfig';
import { FormField } from '../../components/FormField';
import { PaymentSelection, type PaymentOption } from '../../components/PaymentSelection';
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

export function PaymentSection({ onPay }: { onPay?: () => void }) {
  const { flags, payment } = useCheckoutConfig();
  const methods = METHODS.filter((m) => !m.flag || flags[m.flag]);

  const defaultMethod = flags.savedPayment ? 'saved' : 'card';
  const [sel, setSel] = useSeededState<string>(defaultMethod, () => defaultMethod);

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
      {payButton}
      <p className="co-help">
        We only accept payments from cards that are registered at your billing address
      </p>
    </>
  );

  const giftCardForm = (
    <>
      <FormField label="Gift Card Number" required placeholder="1234 5678 9012 3456" inputMode="numeric" />
      <FormField label="PIN" required placeholder="1234" inputMode="numeric" />
      {payButton}
    </>
  );

  const options: PaymentOption[] = methods.map((m) => ({
    id: m.id,
    title: m.id === 'saved' ? (payment.savedCard || 'Saved card') : m.title,
    meta: m.meta,
    mark: <PaymentMark method={m.id} />,
    content: m.id === 'card' ? cardForm : m.id === 'giftcard' ? giftCardForm : payButton,
  }));

  return <PaymentSelection options={options} value={sel} onChange={setSel} />;
}
