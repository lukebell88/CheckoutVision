import { useEffect, useId, useRef, useState, type ChangeEvent } from 'react';
import { Button } from '../../../../components/Button';
import { Icon } from '../../../../components/Icon';
import { Link } from '../../../../components/Link';
import { useProjectRuntime } from '../../../../studio/runtime';
import { useCheckoutConfig } from '../../checkoutConfig';
import { FormField } from '../../components/FormField';
import { DeliverySelection } from '../../components/DeliverySelection';
import { StorePicker } from '../../components/StorePicker';
import {
  nearestParcelShops,
  nearestStores,
  searchParcelShops,
  searchStores,
  storeLabel,
  type Store,
} from '../../stores';
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
  { day: 'Tue', date: '18th', label: 'Tues 18th July' },
  { day: 'Wed', date: '19th', label: 'Weds 19th July' },
  { day: 'Thu', date: '20th', label: 'Thurs 20th July' },
];

/** Delivery dates depend on the address, so they can't be shown until it's
 *  entered — this is how long the "loading dates for your address" skeleton
 *  shows after the address is confirmed. */
const DATES_MS = 900;

/** Parcel Shop has no date choice — it's a fixed availability. */
const PARCEL_DATE = 'Tomorrow 13th August After 5pm';

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
    // Repopulate the collect-point list in the SAME update as the method change,
    // so switching never flashes the empty search box. For a signed-in shopper
    // whose postcode we know, that's the nearest points shown immediately; a
    // guest gets a fresh, empty search to type into.
    const isCollect = id === 'collection' || id === 'parcel';
    if (isCollect && accountPostcode) {
      const near = (id === 'parcel' ? nearestParcelShops : nearestStores)(accountPostcode);
      setStores(near);
      setSelectedStore(near[0] ?? null);
      if (near[0]) setForm((f) => ({ ...f, store: storeLabel(near[0]) }));
    } else {
      setStores([]);
      setSelectedStore(null);
      setStoreQuery(accountPostcode);
    }
    setSearchState('idle');
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
  const parcel = method === 'parcel';
  // Collection and Parcel Shop both pick a collection point from a searchable
  // list rather than typing an address.
  const collectPoint = collection || parcel;

  // Two-step home delivery: dates depend on the address, so they can't show
  // until it's entered. Step A takes the address; Step B collapses it to a
  // "Deliver to" summary and reveals the dates (skeleton first). Only home
  // delivery does this — with the date picker off, Delivery is one step.
  const twoStep = flags.deliveryDates && !collectPoint;
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

  const ids = useId();

  // Store finder (Collection / Parcel Shop). `form.store` holds the chosen
  // point's label (what the summary shows); `storeQuery` is the search box;
  // `selectedStore` keeps the object so the dropdown can render and re-highlight
  // it. See ../../stores.ts for the (static) data.
  const detailsFromAccount = !!customer.signedIn;
  const accountPostcode = detailsFromAccount ? (delivery.postcode ?? '') : '';

  // A signed-in shopper's postcode is known, so if we land on a collect method
  // the nearest points are populated up front — no search, no loading flash.
  const knownCollect = collectPoint && accountPostcode
    ? (parcel ? nearestParcelShops : nearestStores)(accountPostcode)
    : [];

  const [storeQuery, setStoreQuery] = useState(accountPostcode);
  const [stores, setStores] = useState<Store[]>(knownCollect);
  const [selectedStore, setSelectedStore] = useState<Store | null>(knownCollect[0] ?? null);
  const [searchState, setSearchState] = useState<'idle' | 'loading' | 'error'>('idle');

  const selectStore = (s: Store) => {
    setSelectedStore(s);
    setForm((f) => ({ ...f, store: storeLabel(s) }));
    // Collection dates depend on the chosen store, so — like the address→dates
    // step on Home — show a brief skeleton after a store is picked.
    if (collection && flags.deliveryDates) {
      setDatesLoading(true);
      window.clearTimeout(datesTimer.current);
      datesTimer.current = window.setTimeout(() => setDatesLoading(false), DATES_MS);
    }
  };

  // A guest's typed search — async, so its loading state shows. (A signed-in
  // shopper never reaches this: their list is populated synchronously above and
  // in chooseMethod.) Collection searches branches; Parcel Shop searches points.
  const lookup = parcel ? searchParcelShops : searchStores;
  const doSearch = async (query: string) => {
    if (!query.trim()) return;
    setSearchState('loading');
    try {
      setStores(await lookup(query));
      setSearchState('idle');
    } catch {
      setStores([]);
      setSearchState('error');
    }
  };

  const runSearch = () => void doSearch(storeQuery);

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
      // Home and Collection show a date picker (gated on deliveryDates); Parcel
      // Shop has a fixed availability instead of a choice.
      const chosenDate = parcel ? PARCEL_DATE : flags.deliveryDates ? DATES[date].label : '';
      nav.patch('delivery', {
        ...address,
        method,
        date: chosenDate,
      });
      nav.patch('customer', { phone });
    }
    onContinue?.();
  };

  // Reusable pieces — the address form (Step A / single-step) and the phone.
  const addressFields = (
    <>
      <p className="co-section__lede">Tell us where you would like your orders to be delivered.</p>
      <FormField
        id={`${ids}-line1`}
        label="Address Line 1"
        required
        placeholder="Start typing your address"
        value={form.line1}
        onChange={set('line1')}
        endIcon={flags.addressLookup ? <Icon name="search" category="feature" size={20} /> : undefined}
      />
      <FormField label="Address Line 2" required value={form.line2} onChange={set('line2')} />
      <div className="co-fieldrow">
        <FormField label="City" required value={form.city} onChange={set('city')} />
        <FormField label="Postcode" required value={form.postcode} onChange={set('postcode')} />
      </div>
    </>
  );

  // A signed-in shopper's phone is already on the account (it's how they got
  // their passcode), so Delivery doesn't ask for it again — only a guest does.
  const phoneField = detailsFromAccount ? null : (
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

        {/* Collection dates only appear once a store is chosen — the store is the
            prerequisite here, the way the address is on Home. */}
        {flags.deliveryDates && selectedStore && (
          <>
            <p className="co-strong-note">Collection Date</p>
            {datesLoading ? (
              <div className="co-dates co-fadein" aria-hidden="true">
                {DATES.map((_, i) => (
                  <span key={i} className="co-skel co-date--skel" />
                ))}
              </div>
            ) : (
              <div className="co-dates co-fadein" role="radiogroup" aria-label="Collection date">
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
            )}
            <p className="co-help">
              These items are available for collection after 1pm on your collection date and up to 10
              days after delivery. Find out more in our <Link href="#">Terms and Conditions</Link>.
            </p>
          </>
        )}

        {phoneField}
        {continueBtn(submit, datesLoading)}
      </>
    );
  }

  // Parcel Shop: a searchable shop picker like Collection, but no date choice —
  // a fixed availability instead.
  if (parcel) {
    return (
      <>
        <DeliverySelection options={methods} value={method} onChange={chooseMethod} />
        <p className="co-section__lede">Tell us which parcel shop you would like to collect from.</p>
        <StorePicker
          label="Find a Parcel Shop"
          noun="Shop"
          placeholder="Select a shop"
          stores={stores}
          selected={selectedStore}
          loading={searchState === 'loading'}
          error={searchState === 'error'}
          query={storeQuery}
          onQueryChange={setStoreQuery}
          onSearch={runSearch}
          onSelect={selectStore}
        />

        {/* Collection availability only appears once a shop is chosen. */}
        {selectedStore && (
          <>
            <p className="co-strong-note">Collection Date</p>
            <p className="co-parceldate">{PARCEL_DATE}</p>
            <p className="co-help">
              These items are available for collection after 1pm on your collection date and up to 10
              days after delivery. Find out more in our <Link href="#">Terms and Conditions</Link>.
            </p>
          </>
        )}

        {phoneField}
        {continueBtn(submit)}
      </>
    );
  }

  // Home, dates off: one step, as before.
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
          <Link href="#" textStyle="body-3" onClick={(e) => { e.preventDefault(); changeAddress(); }}>
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
