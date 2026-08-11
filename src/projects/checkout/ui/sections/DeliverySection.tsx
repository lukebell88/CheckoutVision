import { useEffect, useId, useRef, useState, type ChangeEvent } from 'react';
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

/** The single result an address lookup offers, so a guest can reach the dates
 *  step without typing four fields. Selecting it fills the whole address. */
const SAMPLE_ADDRESS = {
  line1: '2 Hickling Close',
  line2: 'Long Eaton',
  city: 'Nottingham',
  postcode: 'NG10 3TE',
};

/** Delivery dates depend on the address, so they can't be shown until it's
 *  entered — this is how long the "loading dates for your address" skeleton
 *  shows after the address is confirmed. */
const DATES_MS = 900;

export function DeliverySection({ onContinue }: { onContinue?: () => void }) {
  const { flags, delivery, customer } = useCheckoutConfig();
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

  // Two-step home delivery: dates depend on the address, so they can't show
  // until it's entered. Step A takes the address; Step B collapses it to a
  // "Deliver to" summary and reveals the dates (skeleton first). Only when the
  // date picker is in play — with it off, Delivery is one step, as before.
  const twoStep = flags.deliveryDates && !collection;
  const addrSeed = `${delivery.line1}|${delivery.city}|${delivery.postcode}`;
  // `editing` lets Change reopen the form without clearing the saved address;
  // seeded so it resets on a flow switch and after the address is committed.
  const [editing, setEditing] = useSeededState(addrSeed, () => false);
  const confirmed = !!delivery.line1 && !editing;

  // The dates skeleton runs only on the address→dates transition; an account
  // whose address is already known opens on the dates with none.
  const [datesLoading, setDatesLoading] = useState(false);
  const datesTimer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(datesTimer.current), []);

  // Address lookup: offer the sample result once a GUEST starts typing, so they
  // can fill the whole address in one tap. Gated on there being no address on
  // file (`!delivery.line1`) so it never offers the canned sample to an account
  // shopper editing their own saved address.
  const showSuggest =
    flags.addressLookup &&
    twoStep &&
    !confirmed &&
    !delivery.line1 &&
    form.line1.trim().length >= 2 &&
    form.line1 !== SAMPLE_ADDRESS.line1;
  const fillSample = () => setForm((f) => ({ ...f, ...SAMPLE_ADDRESS }));

  const ids = useId();

  // Store finder (Collection). `form.store` holds the chosen store's label (what
  // the summary shows); `storeQuery` is the search box; `selectedStore` keeps the
  // object so the dropdown can render and re-highlight it. Results come from
  // Next's real collect-in-store endpoint — see ../../stores.ts.
  const detailsFromAccount = !!customer.signedIn;
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

  // Step A → Step B: commit the address so it collapses to the "Deliver to"
  // summary, then hold the dates skeleton while they "load for the address".
  const confirmAddress = () => {
    if (!form.line1.trim()) {
      document.getElementById(`${ids}-line1`)?.focus();
      return;
    }
    if (interactive) {
      const { phone, ...address } = form;
      nav.patch('delivery', { ...address, method });
      nav.patch('customer', { phone });
    }
    setEditing(false);
    setDatesLoading(true);
    datesTimer.current = window.setTimeout(() => setDatesLoading(false), DATES_MS);
  };

  // Change on the "Deliver to" summary reopens the address form (the saved
  // address stays; the form is seeded from it).
  const changeAddress = () => setEditing(true);

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

  // Reusable pieces — the address form (Step A / single-step) and the phone.
  const addressFields = (
    <>
      <p className="co-section__lede">Tell us where you would like your orders to be delivered.</p>
      <div className="co-addrfield">
        <FormField
          id={`${ids}-line1`}
          label="Address Line 1"
          required
          placeholder="Start typing your address"
          value={form.line1}
          onChange={set('line1')}
          endIcon={flags.addressLookup ? <Icon name="search" category="feature" size={20} /> : undefined}
          hint={flags.addressLookup ? 'Start typing your address and select from the list' : undefined}
        />
        {showSuggest && (
          <ul className="co-addrsuggest" role="listbox" aria-label="Address suggestions">
            <li>
              <button type="button" className="co-addrsuggest__item" onClick={fillSample}>
                <Icon name="location" category="feature" size={18} className="co-addrsuggest__pin" />
                {SAMPLE_ADDRESS.line1}, {SAMPLE_ADDRESS.line2}, {SAMPLE_ADDRESS.city}, {SAMPLE_ADDRESS.postcode}
              </button>
            </li>
          </ul>
        )}
      </div>
      <FormField label="Address Line 2" required value={form.line2} onChange={set('line2')} />
      <div className="co-fieldrow">
        <FormField label="City" required value={form.city} onChange={set('city')} />
        <FormField label="Postcode" required value={form.postcode} onChange={set('postcode')} />
      </div>
    </>
  );

  const phoneField = (
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
  );

  const continueBtn = (onClick: () => void, disabled = false) => (
    <Button
      variant="contained"
      color="primary"
      size="large"
      fullWidth
      disabled={disabled}
      onClick={onClick}
    >
      Continue
    </Button>
  );

  // Collection: store finder, single step (no dates depend on an address here).
  if (collection) {
    return (
      <>
        <DeliverySelection options={methods} value={method} onChange={chooseMethod} />
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
        {phoneField}
        {continueBtn(submit)}
      </>
    );
  }

  // Home / Parcel, dates off: one step, as before.
  if (!twoStep) {
    return (
      <>
        <DeliverySelection options={methods} value={method} onChange={chooseMethod} />
        {addressFields}
        {phoneField}
        {continueBtn(submit)}
      </>
    );
  }

  // Step A — enter the address (dates can't be shown yet).
  if (!confirmed) {
    return (
      <>
        <DeliverySelection options={methods} value={method} onChange={chooseMethod} />
        {addressFields}
        {phoneField}
        {continueBtn(confirmAddress)}
      </>
    );
  }

  // Step B — address collapses to a "Deliver to" summary below the method cards,
  // and the dates load in (skeleton first). Continue waits for the dates.
  const address = [delivery.line1, delivery.line2, delivery.city, delivery.postcode]
    .filter(Boolean)
    .join(', ');
  return (
    <>
      <DeliverySelection options={methods} value={method} onChange={chooseMethod} />

      <div className="co-deliverto">
        <div className="co-deliverto__head">
          <span className="co-summary__label">Deliver to:</span>
          <Link href="#" onClick={(e) => { e.preventDefault(); changeAddress(); }}>
            Change
          </Link>
        </div>
        <div className="co-deliverto__addr">{address}</div>
      </div>

      <p className="co-strong-note">Select Your Delivery Date</p>
      {datesLoading ? (
        <div className="co-dates co-fadein" aria-hidden="true">
          {DATES.map((_, i) => (
            <span key={i} className="co-skel co-date--skel" />
          ))}
        </div>
      ) : (
        <>
          <div className="co-dates co-fadein" role="radiogroup" aria-label="Delivery date">
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

      {continueBtn(submit, datesLoading)}
    </>
  );
}
