import { OrderSummary } from '../components/OrderSummary';
import { useCheckoutConfig } from '../checkoutConfig';
import { CART, cartTotals, deliveryLabel, money, productImage } from '../cart';

/**
 * The checkout's use of OrderSummary.
 *
 * This file is the adapter and nothing else: it knows about the cart module, the
 * flags and the currency, and hands the component plain formatted props. That
 * split is deliberate — `components/OrderSummary` stays promotable because all
 * the checkout-specific knowledge lives here.
 *
 * The toggle is separate because at desktop widths the two live in different
 * grid cells: the button sits in the sticky total bar, the summary in the page
 * column. `.co-orderslot` in checkout.css owns that placement and the mobile
 * show/hide.
 */
export function OrderToggle({ open, onToggle }: { open: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      className="co-orderlink co-orderslot__toggle"
      aria-expanded={open}
      onClick={onToggle}
    >
      {open ? 'Hide order' : 'View order'}
    </button>
  );
}

export function OrderPanel({ open }: { open: boolean }) {
  const { flags, delivery: deliveryInfo, payment } = useCheckoutConfig();
  const { subtotal, delivery, giftCard, total } = cartTotals(
    deliveryInfo.method,
    payment.giftCardApplied,
  );

  // On mobile the slot is a smooth height reveal (grid-template-rows 0fr→1fr, so
  // the summary animates to its natural height); the inner clips during the
  // transition. At desktop the slot becomes the permanent column — see
  // checkout.css.
  return (
    <div className={`co-orderslot ${open ? 'co-orderslot--open' : ''}`}>
      <div className="co-orderslot__inner">
        <OrderSummary
          className="co-orderslot__summary"
          // Size and Qty are labelled; colour deliberately isn't shown at all —
          // the basket already pictures the product, so the colour name is
          // redundant where the size isn't.
          lines={CART.map((l) => ({
            id: l.sku,
            name: l.name,
            price: money(l.price * l.qty),
            image: productImage(l.sku),
            fields: [
              { label: 'Size', value: l.size },
              { label: 'Qty', value: String(l.qty) },
            ],
          }))}
          totals={[
            { label: 'Subtotal', value: money(subtotal) },
            { label: 'Delivery', value: deliveryLabel(delivery) },
            // A redeemed gift card shows as a negative line below Delivery.
            ...(giftCard > 0
              ? [{ label: 'Gift Card / eVoucher', value: `-${money(giftCard)}` }]
              : []),
            { label: 'Total', value: money(total), grand: true },
          ]}
          showPromoCode={flags.promoCode}
        />
      </div>
    </div>
  );
}
