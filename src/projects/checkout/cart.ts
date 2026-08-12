/** The order-summary basket — real Next products.
 *
 * Colour and size are separate fields rather than one "Blue · M" string: which
 * attributes a surface shows is a display decision, and the order summary
 * deliberately shows size but not colour. Merging them into one string would
 * make that undecidable without parsing.
 *
 * `sku` is the item code (e.g. "W11-776"); the product image is built from it
 * via `productImage` and loaded straight from Next's CDN. */
export interface CartLine {
  name: string;
  colour: string;
  size: string;
  price: number;
  qty: number;
  /** Item code, e.g. "W11-776". */
  sku: string;
}

/**
 * Next product image (3:4 bag/summary thumbnail) from an item code. The CDN
 * filename is the code without its dash — "W11-776" → "W11776". An `<img>` loads
 * cross-origin without CORS, so this works from the static build.
 */
export const productImage = (sku: string) =>
  `https://xcdn.next.co.uk/Common/Items/Default/Default/ItemImages/3_4Ratio/Product_SIP/Lge/${sku.replace(/-/g, '')}.jpg`;

export const CART: CartLine[] = [
  {
    name: 'Washed Blue Denim Seersucker Jersey Midi Dress',
    colour: 'Washed Blue',
    size: '10',
    price: 42.0,
    qty: 1,
    sku: 'W11-776',
  },
  {
    name: 'Black Textured Short Sleeve Shirt with Linen',
    colour: 'Black',
    size: '10',
    price: 26.0,
    qty: 1,
    sku: 'H99-026',
  },
  {
    name: 'Chocolate Brown Elastic Back Wide Leg Trousers',
    colour: 'Chocolate',
    size: '10',
    price: 38.0,
    qty: 1,
    sku: 'G69-754',
  },
];

export const money = (n: number) => `£${n.toFixed(2)}`;

/**
 * What each delivery method costs. Keyed by the method ids used in
 * DeliverySection's METHODS ('home' | 'collection' | 'parcel'); the order
 * summary and total bar read this so the Delivery line and Total track whatever
 * the shopper has selected. Kept here beside the basket so cost lives in one
 * place — DeliverySection shows these same figures as its card prices.
 */
export const DELIVERY_PRICES: Record<string, number> = {
  home: 4.95,
  collection: 0,
  parcel: 3.5,
};

export const deliveryPrice = (method?: string) =>
  DELIVERY_PRICES[method ?? 'home'] ?? DELIVERY_PRICES.home;

/** A delivery cost as shown to the shopper — free delivery reads "FREE". */
export const deliveryLabel = (cost: number) => (cost === 0 ? 'FREE' : money(cost));

export const cartTotals = (method?: string, giftCard = 0) => {
  const subtotal = CART.reduce((s, l) => s + l.price * l.qty, 0);
  const delivery = deliveryPrice(method);
  const gross = subtotal + delivery;
  // A redeemed gift card can't take the order below zero.
  const applied = Math.max(0, Math.min(giftCard, gross));
  return { subtotal, delivery, giftCard: applied, total: gross - applied };
};
