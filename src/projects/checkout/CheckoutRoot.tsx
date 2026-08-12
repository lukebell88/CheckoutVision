import { useProjectRuntime } from '../../studio/runtime';
import { IconProvider } from '../../components/Icon';
import { Header, variantFromTemplate } from '../../components/Header';
import { headerConfigForClient } from '../../config/headerConfig';
import { pageDef, type CheckoutPageId } from './screens';
import { CART } from './cart';
import { CheckoutPage } from './CheckoutPage';
import './checkout.css';

/**
 * The themed checkout mount.
 *
 * Renders the header and the current screen. This component is brand-agnostic
 * and screen-agnostic — there is exactly one checkout for all clients, and it
 * can render any screen of the journey. The canvas mounts one instance per
 * screen; focus mode mounts a single interactive instance.
 *
 * Everything it needs (brand, screen, flags) comes from the studio runtime, so
 * the checkout never reads studio state directly. The active brand's theme scope
 * (`data-client`) is applied here so every token variable resolves.
 *
 * Two headers, both the shared `Header` component: the journey runs under the
 * Secure form (logo + lock, no nav — nothing to click away with), and the
 * confirmation drops back to the brand's full site header, because at that point
 * we want the shopper browsing again. That's what the scamp draws, and it's why
 * the confirmation no longer has a bespoke bar of its own.
 */
export function CheckoutRoot() {
  const { screen, brand } = useProjectRuntime();

  const page = screen as CheckoutPageId;
  const isConfirmation = pageDef(page).terminal;

  // The secure header keeps the brand's own header template — Figma's Secure
  // type inherits the variant's logo placement, so Club22/Tab22 brands centre
  // their logo where Next (Cutaway22) keeps it left. Read from the platform's
  // `_Config/Header` table, not the store: projects never read studio state.
  const headerConfig = headerConfigForClient(brand.id);
  const headerVariant = variantFromTemplate(headerConfig.template);

  // The brand's own nav labels, from the same `_Config/Header` table — otherwise
  // the confirmation's site header reads "Tab Tab Tab".
  const tabs = Array.from({ length: 16 }, (_, i) => i + 1)
    .filter((n) => headerConfig[`nav.tab${n}`])
    .map((n) => String(headerConfig[`nav.tab${n}.label`] ?? ''))
    .filter(Boolean);

  // The global bar's promo message and quick links, again from `_Config/Header`,
  // so the confirmation's global bar carries the brand's real copy rather than
  // the component's "Link · Link" placeholder.
  const globalMessage = headerConfig.uspMessage ? String(headerConfig.uspMessageLabel ?? '') : undefined;
  const globalLinks = [
    headerConfig.quickLink1 && { label: String(headerConfig.quickLink1Label ?? '') },
    headerConfig.quickLink2 && { label: String(headerConfig.quickLink2Label ?? '') },
  ].filter(Boolean) as { label: string }[];

  return (
    <IconProvider value={brand.iconBrand}>
      <div className="checkout" data-client={brand.id}>
        {isConfirmation ? (
          <Header
            variant={headerVariant}
            type="default"
            globalAppBar
            message={globalMessage}
            links={globalLinks.length ? globalLinks : undefined}
            bagCount={0}
            tabs={tabs}
          />
        ) : (
          <Header variant={headerVariant} type="secure" bagCount={CART.length} />
        )}

        <CheckoutPage />

        {/* Sits at the bottom of every page — a full-width band with a divider
            across the top, pushed down by the flex-1 screen above it. */}
        <footer className="co-footer">
          <p className="co-footer__text">©2026 {brand.name}. All Rights Reserved.</p>
        </footer>
      </div>
    </IconProvider>
  );
}
