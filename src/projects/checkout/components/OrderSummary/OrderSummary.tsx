import { useState, type ReactNode } from 'react';
import { Button } from '../../../../components/Button';
import { TextField } from '../../../../components/TextField';
import './OrderSummary.css';

/** Product thumbnail that degrades to the grey placeholder if the image fails
 *  to load (a bad item code, or the CDN being unreachable). */
function Thumb({ src }: { src?: string }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) return <span className="co-ordersummary__thumb" aria-hidden="true" />;
  return <img className="co-ordersummary__thumb" src={src} alt="" onError={() => setFailed(true)} />;
}

/**
 * OrderSummary — what you're buying and what it costs: line items, an optional
 * promotional code, and a totals ledger.
 *
 * Figma status: **strong candidate**. Fabric v2b has no equivalent — the closest
 * things are `Subcomponents/MadeToMeasurePDPLedger` (a PDP price breakdown) and
 * `Subcomponents/PopoverBag` (the header mini-basket). A checkout-grade summary
 * is a real gap, and every transactional journey needs one. See ../README.md.
 *
 * Presentation only, per rule 2 in that README: no runtime, no cart module, no
 * flags. Everything arrives as props, which is what would let this move to
 * `src/components/` untouched.
 *
 * Money arrives **pre-formatted**. The component never sees numbers, so currency
 * and locale stay the application's problem — otherwise the first non-UK brand
 * would have to fork it.
 *
 * Placement and disclosure are the page's job, not this component's. On mobile
 * the checkout hides it behind VIEW ORDER; from 1024px it becomes a sticky
 * column. Both are done by passing `className` — see `.co-orderslot` in
 * checkout.css. Keeping layout out here is what makes it reusable in a context
 * that positions it differently.
 */
/**
 * A basket line: a headline row of title and price, then labelled attributes.
 *
 * Title and price get dedicated props because they're structurally different
 * from the rest — they're the row you scan, they're on every line whatever the
 * product, and they read as a pair rather than as label/value. `fields` stays a
 * generic list because that's where the actual variability is: which attributes
 * a line carries changes by product type (a made-to-measure item differs from a
 * pair of shoes) and by surface (this summary shows size but not colour).
 */
export interface OrderSummaryLine {
  id: string;
  /** Product title. Unlabelled, with the price opposite it. */
  name: string;
  /** Pre-formatted, e.g. "£28.00". Sits to the right of the title. */
  price: string;
  /** Rendered "Label: value" beneath the title — Size, Qty, and so on. */
  fields?: { label: string; value: string }[];
  /** Omit for the placeholder block. */
  image?: string;
}

export interface OrderSummaryTotal {
  label: string;
  /** Pre-formatted, e.g. "£117.99". */
  value: string;
  /** The grand total — rendered heavier and last. */
  grand?: boolean;
}

export interface OrderSummaryProps {
  lines: OrderSummaryLine[];
  totals: OrderSummaryTotal[];
  title?: ReactNode;
  /** Overrides the default "N items" count line. */
  caption?: ReactNode;
  showPromoCode?: boolean;
  promoCodeLabel?: string;
  onApplyPromoCode?: () => void;
  /** Placement and visibility come from the page. */
  className?: string;
  /** Show the loading skeleton (the order hasn't loaded from Next yet) — the
   *  title stays, the count, lines and totals become shimmer bars. */
  loading?: boolean;
}

export function OrderSummary({
  lines,
  totals,
  title = 'Your Order',
  caption,
  showPromoCode = false,
  promoCodeLabel = 'Promotional Code',
  onApplyPromoCode,
  className,
  loading = false,
}: OrderSummaryProps) {
  const count = lines.length;

  return (
    <aside
      className={['co-ordersummary', className].filter(Boolean).join(' ')}
      aria-label={typeof title === 'string' ? title : 'Order summary'}
      aria-busy={loading || undefined}
    >
      <div className="co-ordersummary__titlerow">
        <h2 className="co-ordersummary__title">{title}</h2>
        {loading ? (
          <span className="co-skel co-ordersummary__skel-count" aria-hidden="true" />
        ) : (
          <span className="co-ordersummary__count">
            {caption ?? `${count} ${count === 1 ? 'Item' : 'Items'}`}
          </span>
        )}
      </div>

      {loading ? <OrderSummarySkeleton /> : (
        <div className="co-fadein">
      <ul className="co-ordersummary__lines">
        {lines.map((l) => (
          <li key={l.id} className="co-ordersummary__line">
            <Thumb src={l.image} />
            <div className="co-ordersummary__body">
              <div className="co-ordersummary__head">
                <span className="co-ordersummary__name">{l.name}</span>
                <span className="co-ordersummary__price">{l.price}</span>
              </div>

              {/* A <dl>: these are label/value pairs, so the colon is punctuation
                  added by CSS rather than baked into every label string. */}
              {l.fields && l.fields.length > 0 && (
                <dl className="co-ordersummary__fields">
                  {l.fields.map((f) => (
                    <div key={f.label} className="co-ordersummary__field">
                      <dt>{f.label}</dt>
                      <dd>{f.value}</dd>
                    </div>
                  ))}
                </dl>
              )}
            </div>
          </li>
        ))}
      </ul>

      {showPromoCode && (
        <div className="co-ordersummary__promo">
          <TextField size="large" placeholder={promoCodeLabel} aria-label={promoCodeLabel} />
          <Button variant="outlined" color="primary" size="large" onClick={onApplyPromoCode}>
            Apply
          </Button>
        </div>
      )}

      <dl className="co-ordersummary__totals">
        {totals.map((t) => (
          <div key={t.label} className={t.grand ? 'co-ordersummary__grand' : undefined}>
            <dt>{t.label}</dt>
            <dd>{t.value}</dd>
          </div>
        ))}
      </dl>
        </div>
      )}
    </aside>
  );
}

/** The loading silhouette: three product lines and three totals rows, sized to
 *  the real card so nothing jumps when the order loads in. */
function OrderSummarySkeleton() {
  return (
    <div aria-hidden="true">
      <ul className="co-ordersummary__lines">
        {[0, 1, 2].map((i) => (
          <li key={i} className="co-ordersummary__line">
            <span className="co-skel co-ordersummary__skel-thumb" />
            <div className="co-ordersummary__body">
              <div className="co-ordersummary__head">
                <span className="co-skel co-ordersummary__skel-name" />
                <span className="co-skel co-ordersummary__skel-price" />
              </div>
              <div className="co-ordersummary__fields">
                <span className="co-skel co-ordersummary__skel-field" />
                <span className="co-skel co-ordersummary__skel-field" />
              </div>
            </div>
          </li>
        ))}
      </ul>

      <dl className="co-ordersummary__totals">
        {[0, 1, 2].map((i) => (
          <div key={i} className={i === 2 ? 'co-ordersummary__grand' : undefined}>
            <dt>
              <span className="co-skel co-ordersummary__skel-totlabel" />
            </dt>
            <dd>
              <span className="co-skel co-ordersummary__skel-totval" />
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
