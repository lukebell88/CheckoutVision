import { Button } from '../../../components/Button';
import { OrderSummary } from '../components/OrderSummary';
import { useCheckoutConfig } from '../checkoutConfig';
import { CART, cartTotals, money } from '../cart';

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
    <Button
      className="co-orderslot__toggle"
      variant="outlined"
      color="secondary"
      size="medium"
      aria-expanded={open}
      onClick={onToggle}
    >
      {open ? 'Hide order' : 'View order'}
    </Button>
  );
}

export function OrderPanel({ open }: { open: boolean }) {
  const { flags } = useCheckoutConfig();
  const { subtotal, delivery, total } = cartTotals();

  return (
    <OrderSummary
      className={`co-orderslot ${open ? 'co-orderslot--open' : ''}`}
      // Size and Qty are labelled; colour deliberately isn't shown at all — the
      // basket already pictures the product, so the colour name is redundant
      // where the size isn't.
      lines={CART.map((l) => ({
        id: l.name,
        name: l.name,
        price: money(l.price * l.qty),
        fields: [
          { label: 'Size', value: l.size },
          { label: 'Qty', value: String(l.qty) },
        ],
      }))}
      totals={[
        { label: 'Subtotal', value: money(subtotal) },
        { label: 'Delivery', value: money(delivery) },
        { label: 'Total', value: money(total), grand: true },
      ]}
      showPromoCode={flags.promoCode}
    />
  );
}
