import { useId, useState } from 'react';
import { Button } from '../../../components/Button';
import { Link } from '../../../components/Link';
import { Radio } from '../../../components/Radio';
import { FormField } from '../components/FormField';

/**
 * Gift Card / eVoucher entry — revealed when Gift Card is the chosen payment
 * method. The shopper enters the card number and PIN, checks the balance, then
 * chooses to redeem the full value or a specific amount. A "can't find these?"
 * disclosure shows where the number and PIN live on each artefact.
 *
 * Presentation only for now — Check Balance, the redeem amount and validation
 * are wired to mock data in a later pass. The two help images are Next's own
 * artwork, loaded straight from their CDN (an <img> loads cross-origin without
 * CORS, like the product thumbnails).
 */
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

export function GiftCardForm() {
  const [amount, setAmount] = useState<'full' | 'other'>('full');
  const [helpOpen, setHelpOpen] = useState(false);
  const groupId = useId();

  return (
    <div className="co-giftcard">
      <FormField label="Card Number" required placeholder="1234 5678 9012 3456" inputMode="numeric" />
      <FormField label="PIN" required placeholder="1234" inputMode="numeric" />

      <Button variant="outlined" color="primary" size="large" fullWidth>
        Check Balance
      </Button>

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
            startIcon={<span className="co-giftcard__prefix">£</span>}
          />
        )}
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
          {HELP_IMAGES.map((img) => (
            <img key={img.src} className="co-giftcard__helpimg" src={img.src} alt={img.alt} />
          ))}
        </div>
      )}
    </div>
  );
}
