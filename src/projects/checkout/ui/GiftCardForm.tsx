import { useEffect, useId, useRef, useState } from 'react';
import { Button } from '../../../components/Button';
import { Link } from '../../../components/Link';
import { Radio } from '../../../components/Radio';
import { FormField } from '../components/FormField';
import { money } from '../cart';

/**
 * Gift Card / eVoucher entry — revealed when Gift Card is the chosen payment
 * method. The shopper enters the card number and PIN, checks the balance, then
 * chooses to redeem the full value or a specific amount. A "can't find these?"
 * disclosure shows where the number and PIN live on each artefact.
 *
 * The balance is mock data (£50). Redeeming (Pay now) hands the amount back to
 * the caller, which applies it to the order total — capped so a card never takes
 * the order below zero. The two help images are Next's own artwork, loaded
 * straight from their CDN (an <img> loads cross-origin without CORS, like the
 * product thumbnails).
 */
const MOCK_BALANCE = 50;
/** The Pay now button holds a spinner for this long before the discount lands. */
const REDEEM_MS = 800;

const HELP_IMAGES = [
  {
    src: 'https://www.next.co.uk/static-content/ux-fabric/iconography-graphics/legacy/next_revision/giftcard-number-default.png',
    alt: 'Where to find the card number and PIN on a gift card',
  },
  {
    src: 'https://www.next.co.uk/static-content/ux-fabric/iconography-graphics/legacy/next_revision/evoucher-number-default.png',
    alt: 'Where to find the card number and PIN on an eVoucher',
  },
];

export function GiftCardForm({ onRedeem }: { onRedeem?: (amount: number) => void }) {
  const [checked, setChecked] = useState(false);
  const [amount, setAmount] = useState<'full' | 'other'>('full');
  const [other, setOther] = useState('');
  const [helpOpen, setHelpOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  const groupId = useId();

  const redeemAmount =
    amount === 'full' ? MOCK_BALANCE : Math.min(parseFloat(other) || 0, MOCK_BALANCE);

  // Pay now holds a spinner, then applies the discount and returns the form to
  // its default state — the redeem block collapses and the summary shows the
  // gift card.
  const redeem = () => {
    if (submitting) return;
    setSubmitting(true);
    timer.current = window.setTimeout(() => {
      onRedeem?.(redeemAmount);
      setSubmitting(false);
      setChecked(false);
      setAmount('full');
      setOther('');
    }, REDEEM_MS);
  };

  return (
    <div className="co-giftcard">
      <div className="co-giftcard__fields">
        <FormField label="Card Number" required placeholder="1234 5678 9012 3456" inputMode="numeric" />
        <FormField label="PIN" required placeholder="1234" inputMode="numeric" />
      </div>

      <Link
        href="#"
        textStyle="body-3"
        className="co-giftcard__helplink"
        aria-expanded={helpOpen}
        onClick={(e) => {
          e.preventDefault();
          setHelpOpen((v) => !v);
        }}
      >
        Can't find Card Number or PIN?
      </Link>

      {helpOpen && (
        <div className="co-giftcard__help co-fadein">
          <p className="co-giftcard__helptext">
            Enter the first 16 digits of the Card Number followed by the PIN. On a Gift Card, scratch
            off the panel to reveal the PIN.
          </p>
          <div className="co-giftcard__helpimgs">
            {HELP_IMAGES.map((img) => (
              <img key={img.src} className="co-giftcard__helpimg" src={img.src} alt={img.alt} />
            ))}
          </div>
        </div>
      )}

      <Button variant="outlined" color="primary" size="large" fullWidth onClick={() => setChecked(true)}>
        Check Balance
      </Button>

      {checked && (
        <div className="co-giftcard__redeem co-fadein">
          <p className="co-giftcard__balance">
            Gift card balance <strong>{money(MOCK_BALANCE)}</strong>
          </p>

          <div className="co-giftcard__amounts" role="radiogroup" aria-label="Amount to redeem">
            <button
              type="button"
              role="radio"
              aria-checked={amount === 'full'}
              className="co-giftcard__radio"
              onClick={() => setAmount('full')}
            >
              <Radio checked={amount === 'full'} />
              <span className="co-giftcard__radiolabel">Redeem Full Value Of This Card</span>
            </button>

            <button
              type="button"
              role="radio"
              aria-checked={amount === 'other'}
              className="co-giftcard__radio"
              onClick={() => setAmount('other')}
            >
              <Radio checked={amount === 'other'} />
              <span className="co-giftcard__radiolabel">Other Amount (£)</span>
            </button>

            {amount === 'other' && (
              <FormField
                id={`${groupId}-other`}
                label="Other amount"
                hideLabel
                inputMode="decimal"
                placeholder="0.00"
                value={other}
                onChange={(e) => setOther(e.target.value)}
                startIcon={<span className="co-giftcard__prefix">£</span>}
              />
            )}
          </div>

          <div className="co-payment__pay">
            <Button
              variant="contained"
              color="primary"
              size="large"
              fullWidth
              loading={submitting}
              onClick={redeem}
            >
              Pay now
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
