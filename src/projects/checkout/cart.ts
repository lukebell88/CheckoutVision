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

export const cartTotals = () => {
  const subtotal = CART.reduce((s, l) => s + l.price * l.qty, 0);
  const delivery = 3.99;
  return { subtotal, delivery, total: subtotal + delivery };
};
