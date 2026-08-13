import { Button } from '../../../components/Button';
import { Link } from '../../../components/Link';
import { Icon } from '../../../components/Icon';
import { useCheckoutConfig } from '../checkoutConfig';
import { FormField } from '../components/FormField';
import { DeliveryCountdown } from './DeliveryCountdown';

/**
 * Order Complete.
 *
 * The one screen that leaves the secure shell — CheckoutRoot swaps the Secure
 * header for the brand's full site header here, because the job has changed from
 * "finish paying" to "keep shopping".
 *
 * The conversion block below the countdown differs by who just bought: a guest
 * is offered an account, a signed-in shopper is offered a passkey. Both are
 * flagged, so either can be turned off to see the page without an ask.
 */
const CDN = 'https://xcdn.next.co.uk/common/items/default/default/itemimages/3_4Ratio/product/lge';
const recImage = (code: string) => `${CDN}/${code}.jpg?im=Resize,width=750`;

const RECOMMENDED = [
  { name: 'Rose Pink Jersey Woven Mix Midi Dress', price: 42, code: 'G25979s' },
  { name: 'Green Stripe Shirred Body Tie Maxi Dress', price: 51, code: 'G80286s' },
  { name: 'Blue/Brown Polka Dot Plisse Long Sleeve Shirt', price: 25, code: 'V65686s' },
  { name: 'Friends Like These Tan Brown Print Short Sleeve Button Detail Collared Blouse', price: 32, code: 'G31030s' },
  { name: 'Wine Jersey Bandeau Balloon Leg Jumpsuit', price: 38, code: 'V75416s' },
  { name: 'Pink/Red Stripe Belted Summer Playsuit', price: 36, code: 'W63498s' },
  { name: 'Dark Blue Bandeau Shirred Denim Jumpsuit', price: 52, code: 'G54546s' },
  { name: 'Blue/White Stripe Soft Relaxed Long Sleeve Shirt', price: 28, code: 'H60424s' },
  { name: 'Pink Stripe Flutter Sleeve Button Front Top With Linen', price: 22, code: 'W13884s' },
];

/**
 * Next Ads — 9x16 shoppable teasers from the CMS `p{page}_c{cat}_s` slots,
 * shown side by side above the recommendations ribbon. The CMS serves these
 * assets from the public CDN (xcdn); the raw response's cms.platform.next host
 * is the internal authoring one and won't load.
 */
const ADS = [
  {
    src: 'https://res.cloudinary.com/djptevtpl/image/upload/v1786596218/01_ziz6xb.jpg',
    alt: 'Home decorative accessories',
    href: 'https://www.next.co.uk/home/home-accessories/decorative-accessories',
  },
  {
    src: 'https://res.cloudinary.com/djptevtpl/image/upload/v1786596218/02_zzc9jp.jpg',
    alt: 'Women’s lingerie',
    href: 'https://www.next.co.uk/shop/womens/lingerie',
  },
];

export function Confirmation() {
  const { flags, customer } = useCheckoutConfig();
  const email = customer.email ?? 'alex_smith@next.co.uk';

  return (
    <main className="co-screen co-screen--wide">
      <div className="co-complete__head">
        <h1 className="co-complete__title">
          <Icon name="check" category="ui" size={22} />
          Order Complete
        </h1>
        <Link href="#">View Details</Link>
      </div>
      <p className="co-complete__sub">Confirmation has been sent to {email}</p>

      {flags.freeDeliveryCountdown && <DeliveryCountdown minutes={30} />}

      {flags.guestRegistration && !customer.signedIn && (
        <section className="co-upsell">
          <h2 className="co-upsell__title">Want to track your orders?</h2>
          <p className="co-upsell__sub">Enter a password to set up an account</p>
          <FormField label="Password" hideLabel type="password" value="Summer2026!" />
          <p className="co-help">Password must be 6–12 characters and include letters and numbers</p>
          <p className="co-help">
            By clicking “Great, Sign me Up” you agree to the <Link href="#">Terms &amp; Conditions</Link>{' '}
            and <Link href="#">Privacy and Cookie Notice</Link>
          </p>
          <Button variant="contained" color="primary" size="large" fullWidth>
            Great, sign me up
          </Button>
        </section>
      )}

      {flags.passkeyUpsell && customer.signedIn && (
        <section className="co-upsell">
          <h2 className="co-upsell__title">Use a passkey for stronger security</h2>
          <p className="co-upsell__sub">
            Passkeys are faster, easier and safer than passwords. They can’t be guessed, stolen or leaked.
          </p>
          <p className="co-upsell__sub">Upgrading to a passkey just takes a moment</p>
          <Button variant="contained" color="primary" size="large" fullWidth>
            Use passkeys
          </Button>
        </section>
      )}

      <section className="co-ads" aria-label="Advertisements">
        {ADS.map((ad) => (
          <a key={ad.src} className="co-ad" href={ad.href} target="_blank" rel="noreferrer">
            <img className="co-ad__img" src={ad.src} alt={ad.alt} loading="lazy" />
          </a>
        ))}
      </section>

      <section className="co-recs">
        <h2 className="co-recs__title">You May Also Like</h2>
        <div className="co-recs__grid">
          {RECOMMENDED.map((rec) => (
            <article key={rec.code} className="co-rec">
              <img className="co-rec__img" src={recImage(rec.code)} alt={rec.name} loading="lazy" />
              <span className="co-rec__name">{rec.name}</span>
              <span className="co-rec__price">£{rec.price.toFixed(2)}</span>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
