import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { Icon } from '../../../../components/Icon';
import { Radio } from '../../../../components/Radio';
import { Select } from '../../../../components/Select';
import { storeAddress, storeName, storePostcode, type Store } from '../../stores';
import { StoreDrawer } from './StoreDrawer';
import './StorePicker.css';
import './StoreDrawer.css';

/**
 * StorePicker — the Collection store chooser.
 *
 * Two states depending on what's known:
 *   · nothing found yet (a guest with no saved address) → a search bar, icon on
 *     the right, to look a store up.
 *   · results present (a guest who's searched, or account-matched, whose saved
 *     postcode we look up on their behalf) → a dropdown of enriched options.
 *
 * A plain <Select> can't render the options — each is title-cased name + address
 * + uppercase postcode — so the panel is custom; the <Select> is reused as the
 * trigger only, for its brand border/radius/chevron tokens. "Find Another Store"
 * hands off to the drawer. Fetching/formatting live in the parent / ../../stores.ts.
 */
export interface StorePickerProps {
  label: string;
  placeholder?: string;
  stores: Store[];
  selected: Store | null;
  loading?: boolean;
  error?: boolean;
  query: string;
  onQueryChange: (q: string) => void;
  onSearch: () => void;
  onSelect: (store: Store) => void;
  /** Most options to list before offering "Find Another Store". */
  maxOptions?: number;
}

export function StorePicker({
  label,
  placeholder = 'Select a store',
  stores,
  selected,
  loading = false,
  error = false,
  query,
  onQueryChange,
  onSearch,
  onSelect,
  maxOptions = 5,
}: StorePickerProps) {
  const [open, setOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [attempted, setAttempted] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  // Close on outside click / Escape, like any menu.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const hasResults = stores.length > 0;
  const visible = stores.slice(0, maxOptions);

  // When a guest's search returns results, open the dropdown so they're visible
  // without a second tap. Account-matched arrives with a selection already, so
  // it stays closed until tapped.
  const autoOpened = useRef(false);
  useEffect(() => {
    if (!hasResults) {
      autoOpened.current = false;
      return;
    }
    if (!selected && !autoOpened.current) {
      autoOpened.current = true;
      setOpen(true);
    }
  }, [hasResults, selected]);

  const runSearch = () => {
    setAttempted(true);
    onSearch();
  };
  const changeQuery = (q: string) => {
    setAttempted(false);
    onQueryChange(q);
  };
  const onInputKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      runSearch();
    }
  };

  // "Find Another Store" hands off to the fuller drawer (change postcode, more
  // results, longer list).
  const findAnother = () => {
    setOpen(false);
    setDrawerOpen(true);
  };

  const triggerValue = selected ? `${storeName(selected)} · ${storePostcode(selected)}` : undefined;

  return (
    <div className="co-storepicker" ref={rootRef}>
      <span className="co-storepicker__label" id={`${label}-label`}>
        {label}
        <span className="co-storepicker__req" aria-hidden="true">
          *
        </span>
      </span>

      {hasResults ? (
        <>
          <Select
            size="large"
            active={open}
            state={error ? 'error' : undefined}
            value={triggerValue}
            placeholder={placeholder}
            aria-labelledby={`${label}-label`}
            onClick={() => setOpen((o) => !o)}
          />

          {open && (
            <div className="co-storepicker__panel">
              <ul className="co-storepicker__list" role="listbox" aria-label="Nearby stores">
                {visible.map((s) => {
                  const on = selected?.branchNumber === s.branchNumber;
                  return (
                    <li key={s.branchNumber} role="option" aria-selected={on}>
                      <button
                        type="button"
                        className={`co-storeoption ${on ? 'co-storeoption--on' : ''}`}
                        onClick={() => {
                          onSelect(s);
                          setOpen(false);
                        }}
                      >
                        <Radio checked={on} />
                        <span className="co-storeoption__body">
                          <span className="co-storeoption__name">{storeName(s)}</span>
                          <span className="co-storeoption__addr">
                            {storeAddress(s)}, <span className="co-storeoption__pc">{storePostcode(s)}</span>
                          </span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>

              <button type="button" className="co-storepicker__another" onClick={findAnother}>
                <Icon name="search" category="feature" size={18} />
                Find Another Store
              </button>
            </div>
          )}
        </>
      ) : (
        // Guest, nothing known yet: a search bar with the icon on the right —
        // the same shape as the drawer's search.
        <>
          <div className="co-storepicker__searchbar">
            <input
              className="co-storepicker__searchinput"
              placeholder="Type town, city or postcode"
              value={query}
              onChange={(e) => changeQuery(e.target.value)}
              onKeyDown={onInputKey}
              aria-labelledby={`${label}-label`}
            />
            <button
              type="button"
              className="co-storepicker__searchbtn"
              aria-label="Search"
              onClick={runSearch}
              disabled={loading || !query.trim()}
            >
              <Icon name="search" category="feature" size={20} />
            </button>
          </div>

          {loading && <p className="co-storepicker__status">Searching…</p>}
          {error && (
            <p className="co-storepicker__status co-storepicker__status--error" role="alert">
              We couldn’t load stores just now. Please try again.
            </p>
          )}
          {!loading && !error && attempted && (
            <p className="co-storepicker__status">No stores found near “{query}”.</p>
          )}
        </>
      )}

      <StoreDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        stores={stores}
        selected={selected}
        loading={loading}
        error={error}
        query={query}
        onQueryChange={onQueryChange}
        onSearch={onSearch}
        onSelect={onSelect}
      />
    </div>
  );
}
