/** Believable sample basket used by the order summary. Replaced with real
 * product data when the checkout UI is built out.
 *
 * Colour and size are separate fields rather than one "Blue · M" string: which
 * attributes a surface shows is a display decision, and the order summary
 * deliberately shows size but not colour. Merging them into one string would
 * make that undecidable without parsing. */
export interface CartLine {
  name: string;
  colour: string;
  size: string;
  price: number;
  qty: number;
}

export const CART: CartLine[] = [
  { name: 'Cotton Rich Oxford Shirt', colour: 'Blue', size: 'M', price: 28.0, qty: 1 },
  { name: 'Slim Fit Chino Trousers', colour: 'Stone', size: '32R', price: 34.0, qty: 1 },
  { name: 'Leather Trainers', colour: 'White', size: '9', price: 52.0, qty: 1 },
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

export const cartTotals = (method?: string) => {
  const subtotal = CART.reduce((s, l) => s + l.price * l.qty, 0);
  const delivery = deliveryPrice(method);
  return { subtotal, delivery, total: subtotal + delivery };
};
