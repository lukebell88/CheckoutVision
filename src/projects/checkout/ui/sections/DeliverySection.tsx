import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { Button } from '../../../../components/Button';
import { Icon } from '../../../../components/Icon';
import { Link } from '../../../../components/Link';
import { useProjectRuntime } from '../../../../studio/runtime';
import { useCheckoutConfig } from '../../checkoutConfig';
import { FormField } from '../../components/FormField';
import { DeliverySelection } from '../../components/DeliverySelection';
import { StorePicker } from '../../components/StorePicker';
import { searchStores, storeLabel, type Store } from '../../stores';
import { useSeededState } from '../useSeededState';

/**
 * 2. Delivery.
 *
 * Three methods as selectable cards; the form beneath swaps between an address
 * finder and a store finder, which is how the scamp folds the old separate
 * "delivery address" and "collection" screens into one section.
 *
 * The phone field's hint is doing real work in this concept — it's where the
 * one-time passcode gets its number from — so the wording is kept verbatim.
 *
 * Like Your Details, the address starts with only what the runtime knows: blank
 * for a guest, pre-filled for a returning shopper. What's typed is written to the
 * `delivery` bucket on Continue so the collapsed summary shows the real address.
 */
const METHODS = [
  { id: 'home', title: 'Home', price: '£4.95' },
  { id: 'collection', title: 'Collection', price: 'FREE' },
  { id: 'parcel', title: 'Parcel Shop', price: '£3.50' },
];

const DATES = [
  { day: 'Wed', date: '12th', label: 'Weds 12th July' },
  { day: 'Thu', date: '13th', label: 'Thurs 13th July' },
  { day: 'Fri', date: '14th', label: 'Fri 14th July' },
  { day: 'Mon', date: '17th', label: 'Mon 17th July' },
];

export function DeliverySection({ onContinue }: { onContinue?: () => void }) {
  const { flags, delivery, customer, auth } = useCheckoutConfig();
  const { interactive, nav } = useProjectRuntime();
  const [method, setMethod] = useSeededState(String(delivery.method), () => delivery.method ?? 'home');
  // Patch the method as soon as it's picked (not just on Continue) so the order
  // summary's Delivery line and the total bar update live while this section is
  // still open — Home £4.95 / Collection FREE / Parcel Shop £3.50.
  const chooseMethod = (id: string) => {
    setMethod(id);
    if (interactive) nav.patch('delivery', { method: id });
  };
  const [date, setDate] = useSeededState(String(delivery.date), () => 0);

  const [form, setForm] = useSeededState(
    `${delivery.line1}|${delivery.city}|${delivery.postcode}|${delivery.store}|${customer.phone}`,
    () => ({
      line1: delivery.line1 ?? '',
      line2: delivery.line2 ?? '',
      city: delivery.city ?? '',
      postcode: delivery.postcode ?? '',
      store: delivery.store ?? '',
      phone: customer.phone ?? '',
    }),
  );
  const set = (key: keyof typeof form) => (e: ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const methods = flags.collectionOptions ? METHODS : METHODS.filter((m) => m.id === 'home');
  const collection = method === 'collection';

  // Store finder (Collection). `form.store` holds the chosen store's label (what
  // the summary shows); `storeQuery` is the search box; `selectedStore` keeps the
  // object so the dropdown can render and re-highlight it. Results come from
  // Next's real collect-in-store endpoint — see ../../stores.ts.
  const detailsFromAccount = !!customer.signedIn || (auth.treatment ?? 'none') !== 'none';
  const accountPostcode = detailsFromAccount ? (delivery.postcode ?? '') : '';

  const [storeQuery, setStoreQuery] = useState(accountPostcode);
  const [stores, setStores] = useState<Store[]>([]);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [searchState, setSearchState] = useState<'idle' | 'loading' | 'error'>('idle');

  const selectStore = (s: Store) => {
    setSelectedStore(s);
    setForm((f) => ({ ...f, store: storeLabel(s) }));
  };

  const doSearch = async (query: string, autoSelectNearest = false) => {
    if (!query.trim()) return;
    setSearchState('loading');
    try {
      const results = await searchStores(query);
      setStores(results);
      setSearchState('idle');
      if (autoSelectNearest && results[0]) selectStore(results[0]);
    } catch {
      setStores([]);
      setSearchState('error');
    }
  };

  const runSearch = () => void doSearch(storeQuery);

  // Account-matched: use the saved postcode to find the nearest store up front
  // and default the selection to it. Runs once, when Collection is first chosen.
  const autoSearched = useRef(false);
  useEffect(() => {
    if (collection && accountPostcode && !autoSearched.current) {
      autoSearched.current = true;
      void doSearch(accountPostcode, true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collection, accountPostcode]);

  const submit = () => {
    if (interactive) {
      const { phone, ...address } = form;
      // The date picker only appears for home delivery, so only home delivery
      // records one — otherwise a collection order would carry a delivery date
      // the shopper was never shown, and the summary would print it.
      nav.patch('delivery', {
        ...address,
        method,
        date: collection || !flags.deliveryDates ? '' : DATES[date].label,
      });
      nav.patch('customer', { phone });
    }
    onContinue?.();
  };

  return (
    <>
      <DeliverySelection options={methods} value={method} onChange={chooseMethod} />

      {collection ? (
        <>
          <p className="co-section__lede">Tell us where you would like to collect your order.</p>
          <StorePicker
            label="Find a Store"
            stores={stores}
            selected={selectedStore}
            loading={searchState === 'loading'}
            error={searchState === 'error'}
            query={storeQuery}
            onQueryChange={setStoreQuery}
            onSearch={runSearch}
            onSelect={selectStore}
          />
        </>
      ) : (
        <>
          <p className="co-section__lede">Tell us where you would like your orders to be delivered.</p>
          <FormField
            label="Address Line 1"
            required
            placeholder="Start typing your address"
            value={form.line1}
            onChange={set('line1')}
            endIcon={flags.addressLookup ? <Icon name="search" category="feature" size={20} /> : undefined}
            hint={flags.addressLookup ? 'Start typing your address and select from the list' : undefined}
          />
          <FormField label="Address Line 2" required value={form.line2} onChange={set('line2')} />
          <div className="co-fieldrow">
            <FormField label="City" required value={form.city} onChange={set('city')} />
            <FormField label="Postcode" required value={form.postcode} onChange={set('postcode')} />
          </div>
        </>
      )}

      <FormField
        label="Phone Number"
        required
        type="tel"
        placeholder="07000 000000"
        value={form.phone}
        onChange={set('phone')}
        hint={
          <>
            Incase we need to contact you about your order. Also this will enable{' '}
            <Link href="#">One Time Passcode</Link> for easy login next time
          </>
        }
      />

      {flags.deliveryDates && !collection && (
        <>
          <p className="co-strong-note">Select Your Delivery Date</p>
          <div className="co-dates" role="radiogroup" aria-label="Delivery date">
            {DATES.map((d, i) => (
              <button
                type="button"
                key={d.date}
                role="radio"
                aria-checked={date === i}
                className={`co-date ${date === i ? 'co-date--on' : ''}`}
                onClick={() => setDate(i)}
              >
                <span className="co-date__day">{d.day}</span>
                <span className="co-date__num">{d.date}</span>
              </button>
            ))}
          </div>
          <p className="co-help">
            Delivered anytime between 7am and 7pm. We’ll confirm to you on the morning of delivery.
          </p>
        </>
      )}

      <Button variant="contained" color="primary" size="large" fullWidth onClick={submit}>
        Continue
      </Button>
    </>
  );
}
