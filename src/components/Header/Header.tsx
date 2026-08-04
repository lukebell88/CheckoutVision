import { IconProvider } from '../Icon';
import { AppBarBackToNext } from '../AppBarBackToNext';
import { AppBarGlobal } from '../AppBarGlobal';
import { AppBarBrand, type AppBarBrandVariant, type AppBarBrandType } from '../AppBarBrand';
import { AppBarNav } from '../AppBarNav';
import './Header.css';

/**
 * Header — mirrors the Fabric v2 `{Header}` set (file components-fabric-v2b,
 * node 9197-74651). Stacks the app bars per variant/type:
 *
 *   backToNextAppBar? · AppBarBackToNext (black "Back to Next" strip)
 *   globalAppBar?     · AppBarGlobal     (promo message + links)
 *                       AppBarBrand      (logo · search · icon group)
 *   type=Default &    · AppBarNav        (scrolling tab nav)
 *   variant≠Wing25
 *
 * Figma variant properties → props: Variant → `variant`, Type → `type`. Screen
 * Size is handled responsively via CSS rather than discrete variants.
 */
export type HeaderVariant = AppBarBrandVariant;
export type HeaderType = AppBarBrandType;

export interface HeaderProps {
  variant?: HeaderVariant;
  type?: HeaderType;
  /** Black "Back to Next" strip above the global bar. */
  backToNextAppBar?: boolean;
  /** Global bar (promo message + links). Hidden in the Secure form. */
  globalAppBar?: boolean;
  /** Brand id for logo + icons (e.g. "next"). Defaults to ambient context. */
  brand?: string;
  bagCount?: number;
  message?: string;
  tabs?: string[];
  className?: string;
}

export function Header({
  variant = 'standard',
  type = 'default',
  backToNextAppBar = false,
  globalAppBar = true,
  brand,
  bagCount = 0,
  message,
  tabs,
  className,
}: HeaderProps) {
  const secure = type === 'secure';
  const showNav = !secure && variant !== 'wing25';
  // Tab22 shows its nav on desktop but hides it on mobile (Figma XS/S variants).
  const navHiddenMobile = variant === 'tab22';

  const content = (
    <div className={['fab-header', navHiddenMobile && 'fab-header--nav-hidden-mobile', className].filter(Boolean).join(' ')}>
      {backToNextAppBar && !secure && <AppBarBackToNext />}
      {globalAppBar && !secure && <AppBarGlobal message={message} />}
      <AppBarBrand variant={variant} type={type} brand={brand} bagCount={bagCount} />
      {showNav && <AppBarNav tabs={tabs} />}
    </div>
  );

  return brand ? <IconProvider value={brand}>{content}</IconProvider> : content;
}
