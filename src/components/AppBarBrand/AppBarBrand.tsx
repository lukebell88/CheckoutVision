import flagGb from '../../../iconography/common/flag/flag-gb.png';
import { Icon } from '../Icon';
import { IconButton } from '../IconButton';
import { Badge } from '../Badge';
import { Button } from '../Button';
import { Link } from '../Link';
import { TextField } from '../TextField';
import { Logotype } from '../Logotype';
import './AppBarBrand.css';

/**
 * AppBarBrand — mirrors the Fabric v2 `<AppBarBrand>` (node 9028:66024), the
 * primary header bar: brand logo, search field and the right-hand icon group.
 * This is the variant-heavy part of `{Header}` — the six styles differ here,
 * plus a slim `Secure` form for checkout.
 *
 * Responsive (< M breakpoint, driven by the Header's container query): the
 * inline search field collapses and each variant adopts its Figma XS/S layout —
 * split variants keep their icons (search → icon); centred variants redistribute
 * a reduced icon set to both sides of the logo. See `mobile` in VARIANTS.
 *
 * Figma `Variant` → `variant`, `Type` → `type`.
 *
 * A note on Secure, because it looks like a missing variant: `<AppBarBrand>` has
 * NO `Type` property in Figma — its only axes are Variant and Screen Size. The
 * Secure form is produced inside `{Header}` (9197:74651) by hiding sub-layers of
 * an ordinary AppBarBrand instance and swapping BorderBottomDefault for
 * BorderBottomSecure. So Secure is modelled here as a reduced version of the
 * SAME layout, not a branch of its own — it keeps the variant's logo placement
 * and its geometry, and only the right-hand group shrinks. Rendering it
 * separately is what let it drift out of spec before.
 */
export type AppBarBrandVariant =
  | 'standard'
  | 'club22'
  | 'club25'
  | 'cutaway22'
  | 'tab22'
  | 'wing25';
export type AppBarBrandType = 'default' | 'secure';

type BrandIcon = 'location' | 'account' | 'favourite' | 'bag' | 'search' | 'menu' | 'secure';

/** Right-hand slot in the Secure form. Wing25 uses a text link, not an icon. */
type SecureItem = BrandIcon | 'help';

interface SecureConfig {
  right: SecureItem[];
  /** Below M, when Figma drops icons from the group. */
  mobileRight?: SecureItem[];
}

interface VariantConfig {
  logo: 'left' | 'center';
  search: boolean;
  placeholder?: string;
  right: BrandIcon[];
  checkoutButton?: boolean;
  flag?: boolean;
  /** Centred variants only: the reduced icon clusters shown on mobile. */
  mobile?: { left: BrandIcon[]; right: BrandIcon[] };
  secure: SecureConfig;
}

const VARIANTS: Record<AppBarBrandVariant, VariantConfig> = {
  standard: { logo: 'left', search: true, placeholder: 'Search product or brand', right: ['location', 'account', 'favourite', 'bag'], flag: true, secure: { right: ['location', 'bag'] } },
  cutaway22: { logo: 'left', search: true, placeholder: 'Search product or brand', right: ['account', 'location', 'favourite', 'bag'], flag: true, secure: { right: ['location', 'bag'] } },
  club22: { logo: 'center', search: true, placeholder: 'Search', right: ['location', 'favourite', 'account', 'bag'], flag: true, mobile: { left: ['search', 'favourite'], right: ['account', 'bag'] }, secure: { right: ['location', 'bag'], mobileRight: ['bag'] } },
  tab22: { logo: 'center', search: true, placeholder: 'Search', right: ['location', 'favourite', 'account', 'bag'], flag: true, mobile: { left: ['menu'], right: ['search', 'bag'] }, secure: { right: ['location', 'bag'], mobileRight: ['bag'] } },
  // Club25 has no Secure variant in Figma; it follows the centred family. Its
  // Secure form carries only the bag — no store-locator icon.
  club25: { logo: 'center', search: true, placeholder: 'Search for anything here', right: ['favourite', 'account', 'bag'], checkoutButton: true, flag: false, mobile: { left: ['account', 'favourite'], right: ['search', 'bag'] }, secure: { right: ['bag'] } },
  wing25: { logo: 'left', search: false, right: ['search', 'favourite', 'bag', 'menu'], flag: false, secure: { right: ['help', 'bag'] } },
};

const ICONS: Record<BrandIcon, { name: string; category: 'feature' | 'ui'; label: string }> = {
  location: { name: 'location', category: 'feature', label: 'Store locator' },
  account: { name: 'account', category: 'feature', label: 'Account' },
  favourite: { name: 'favourite', category: 'feature', label: 'Wishlist' },
  bag: { name: 'bag', category: 'feature', label: 'Bag' },
  search: { name: 'search', category: 'feature', label: 'Search' },
  menu: { name: 'menu', category: 'ui', label: 'Menu' },
  secure: { name: 'secure', category: 'feature', label: 'Secure checkout' },
};

/** Template names as they appear in the Figma `_Config/Header/Template` variable. */
const TEMPLATE_TO_VARIANT: Record<string, AppBarBrandVariant> = {
  Standard: 'standard',
  Club22: 'club22',
  Club25: 'club25',
  Cutaway22: 'cutaway22',
  Tab22: 'tab22',
  Wing25: 'wing25',
};

/** Resolve a `_Config/Header/Template` value ("Cutaway22") to a variant id. */
export function variantFromTemplate(template: unknown): AppBarBrandVariant {
  return (typeof template === 'string' && TEMPLATE_TO_VARIANT[template]) || 'standard';
}

function BrandIconButton({ icon, bagCount = 0 }: { icon: BrandIcon; bagCount?: number }) {
  const def = ICONS[icon];
  const btn = (
    <IconButton
      variant="unstyled"
      size="medium"
      aria-label={def.label}
      // Mark the secure lock so a host can hang an action on it (live review mode
      // opens the scenario tray from here on touch, where ⌘J isn't available).
      data-secure-lock={icon === 'secure' ? '' : undefined}
    >
      <Icon name={def.name} category={def.category} size={24} />
    </IconButton>
  );
  return icon === 'bag' ? <Badge content={bagCount}>{btn}</Badge> : btn;
}

function SecureSlot({ item, bagCount = 0 }: { item: SecureItem; bagCount?: number }) {
  if (item === 'help') return <Link underline="none">Help</Link>;
  return <BrandIconButton icon={item} bagCount={bagCount} />;
}

export interface AppBarBrandProps {
  variant?: AppBarBrandVariant;
  type?: AppBarBrandType;
  /** Brand for the logo; defaults to the active IconBrandContext. */
  brand?: string;
  bagCount?: number;
  /** Show the region flag in the icon group (Default forms only). */
  showFlag?: boolean;
}

export function AppBarBrand({
  variant = 'standard',
  type = 'default',
  brand,
  bagCount = 0,
  showFlag = true,
}: AppBarBrandProps) {
  const cfg = VARIANTS[variant];
  const secure = type === 'secure';
  const logo = <Logotype brand={brand} height={20} />;

  // ---- Secure form: the same layout, reduced. The lock takes the slot the
  //      search field occupies in the Default form, so the logo stays put. ----
  if (secure) {
    const lock = <BrandIconButton icon="secure" />;
    const slots = (items: SecureItem[]) =>
      items.map((it) => <SecureSlot key={it} item={it} bagCount={bagCount} />);
    // Only the variants whose icon group shrinks below M need the two clusters;
    // the rest render one set, or the desktop cluster would hide on mobile.
    const right = cfg.secure.mobileRight ? (
      <>
        <div className="fab-appbar-brand__desktop-icons">{slots(cfg.secure.right)}</div>
        <div className="fab-appbar-brand__mobile-right">{slots(cfg.secure.mobileRight)}</div>
      </>
    ) : (
      slots(cfg.secure.right)
    );

    // Centred variants keep the logo centred and stand the lock alone on the
    // left; split variants keep logo-then-lock. Same classes as Default, so the
    // two forms can never drift apart on geometry again.
    return cfg.logo === 'center' ? (
      <div className="fab-appbar-brand fab-appbar-brand--centered fab-appbar-brand--secure">
        <div className="fab-appbar-brand__left">{lock}</div>
        <div className="fab-appbar-brand__center">{logo}</div>
        <div className="fab-appbar-brand__right">{right}</div>
      </div>
    ) : (
      <div className="fab-appbar-brand fab-appbar-brand--split fab-appbar-brand--secure">
        <div className="fab-appbar-brand__left">
          {logo}
          {lock}
        </div>
        <div className="fab-appbar-brand__right">{right}</div>
      </div>
    );
  }

  const searchField = cfg.search && (
    <TextField
      className="fab-appbar-brand__search"
      pill
      readOnly
      placeholder={cfg.placeholder}
      endIcon={<Icon name="search" category="feature" size={20} />}
    />
  );
  const flag = showFlag && cfg.flag && (
    <span className="fab-appbar-brand__flag" aria-label="United Kingdom" role="img">
      <img src={flagGb} alt="" />
    </span>
  );
  const checkout = cfg.checkoutButton && (
    <Button variant="contained" color="primary" size="medium">
      Checkout
    </Button>
  );

  // ---- Centred variants: search left · logo centre · icons right (desktop);
  //      reduced clusters both sides of the logo (mobile). ----
  if (cfg.logo === 'center') {
    return (
      <div className="fab-appbar-brand fab-appbar-brand--centered">
        <div className="fab-appbar-brand__left">
          {searchField}
          {cfg.mobile && (
            <div className="fab-appbar-brand__mobile-left">
              {cfg.mobile.left.map((ic) => (
                <BrandIconButton key={ic} icon={ic} bagCount={bagCount} />
              ))}
            </div>
          )}
        </div>
        <div className="fab-appbar-brand__center">{logo}</div>
        <div className="fab-appbar-brand__right">
          <div className="fab-appbar-brand__desktop-icons">
            {cfg.right.map((ic) => (
              <BrandIconButton key={ic} icon={ic} bagCount={bagCount} />
            ))}
            {flag}
            {checkout}
          </div>
          {cfg.mobile && (
            <div className="fab-appbar-brand__mobile-right">
              {cfg.mobile.right.map((ic) => (
                <BrandIconButton key={ic} icon={ic} bagCount={bagCount} />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ---- Split variants (logo left): logo + search on the left, icons right.
  //      On mobile the search field collapses to a leading search icon. ----
  return (
    <div className="fab-appbar-brand fab-appbar-brand--split">
      <div className="fab-appbar-brand__left">
        {logo}
        {searchField}
      </div>
      <div className="fab-appbar-brand__right">
        {cfg.search && (
          <span className="fab-appbar-brand__search-icon">
            <BrandIconButton icon="search" />
          </span>
        )}
        {cfg.right.map((ic) => (
          <BrandIconButton key={ic} icon={ic} bagCount={bagCount} />
        ))}
        {flag}
        {checkout}
      </div>
    </div>
  );
}
