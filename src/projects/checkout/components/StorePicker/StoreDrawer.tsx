import { useEffect, useState, type KeyboardEvent } from 'react';
import { Button } from '../../../../components/Button';
import { Icon } from '../../../../components/Icon';
import { Link } from '../../../../components/Link';
import { Logotype } from '../../../../components/Logotype';
import { storeAddress, storeName, storePostcode, type Store } from '../../stores';

/**
 * StoreDrawer — the full store finder as a right-hand drawer with a backdrop.
 *
 * Opened from the dropdown's "Find Another Store". Where the dropdown is a quick
 * pick of the nearest few, this is the place to change the search entirely: edit
 * the postcode and choose from a longer list. The backdrop + panel are bespoke
 * (brand-token styled) rather than the studio's MUI Backdrop/Drawer, because the
 * checkout preview renders in brand tokens only — no MUI.
 */
export interface StoreDrawerProps {
  open: boolean;
  onClose: () => void;
  stores: Store[];
  selected: Store | null;
  loading?: boolean;
  error?: boolean;
  query: string;
  onQueryChange: (q: string) => void;
  onSearch: () => void;
  onSelect: (store: Store) => void;
  /** Most stores to list in the drawer. */
  maxOptions?: number;
  /** The noun for the collection point, e.g. "Store" or "Shop". */
  noun?: string;
}

export function StoreDrawer({
  open,
  onClose,
  stores,
  selected,
  loading = false,
  error = false,
  query,
  onQueryChange,
  onSelect,
  onSearch,
  maxOptions = 10,
  noun = 'Store',
}: StoreDrawerProps) {
  const [expanded, setExpanded] = useState<string | null>(null);

  // Escape to close, and lock the background from scrolling behind the drawer.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  const visible = stores.slice(0, maxOptions);
  const onInputKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onSearch();
    }
  };

  return (
    <div className="co-storedrawer">
      <div className="co-storedrawer__backdrop" onClick={onClose} aria-hidden="true" />

      <aside
        className="co-storedrawer__panel"
        role="dialog"
        aria-modal="true"
        aria-label="Collect from store"
      >
        <header className="co-storedrawer__head">
          <h2 className="co-storedrawer__title">Collect From</h2>
          <button
            type="button"
            className="co-storedrawer__close"
            aria-label="Close"
            onClick={onClose}
          >
            <Icon name="cross" category="ui" size={24} />
          </button>
        </header>

        <div className="co-storedrawer__body">
          <label className="co-storedrawer__label" htmlFor="co-storedrawer-search">
            Search for {noun.toLowerCase()}s
          </label>
          <div className="co-storedrawer__search">
            <input
              id="co-storedrawer-search"
              className="co-storedrawer__input"
              placeholder="Postal Code"
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              onKeyDown={onInputKey}
            />
            <button
              type="button"
              className="co-storedrawer__searchbtn"
              aria-label="Search"
              onClick={onSearch}
              disabled={loading || !query.trim()}
            >
              <Icon name="search" category="feature" size={20} />
            </button>
          </div>

          {loading && <p className="co-storedrawer__status">Searching…</p>}
          {error && (
            <p className="co-storedrawer__status co-storedrawer__status--error" role="alert">
              We couldn’t load stores just now. Please try again.
            </p>
          )}
          {!loading && !error && query.trim() && stores.length === 0 && (
            <p className="co-storedrawer__status">No stores found near “{query}”.</p>
          )}

          {!loading &&
            visible.map((s) => {
              const on = selected?.branchNumber === s.branchNumber;
              const isOpen = expanded === s.branchNumber;
              return (
                <div
                  key={s.branchNumber}
                  className={`co-storecard ${on ? 'co-storecard--on' : ''}`}
                >
                  <Logotype height={16} className="co-storecard__logo" />
                  <p className="co-storecard__addr">
                    {storeName(s)}, {storeAddress(s)},{' '}
                    <span className="co-storecard__pc">{storePostcode(s)}</span>
                  </p>

                  <Link
                    href="#"
                    className="co-storecard__more"
                    onClick={(e) => {
                      e.preventDefault();
                      setExpanded(isOpen ? null : s.branchNumber);
                    }}
                  >
                    More Info
                  </Link>
                  {isOpen && s.openingMessage && (
                    <p className="co-storecard__hours">
                      {s.isOpen ? 'Open today' : 'Closed'} · {s.openingMessage}
                    </p>
                  )}

                  <Button
                    variant="outlined"
                    color="secondary"
                    size="large"
                    fullWidth
                    onClick={() => {
                      onSelect(s);
                      onClose();
                    }}
                  >
                    {on ? 'Selected' : 'Select Store'}
                  </Button>
                </div>
              );
            })}
        </div>
      </aside>
    </div>
  );
}
