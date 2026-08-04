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

  return (
    <IconProvider value={brand.iconBrand}>
      <div className="checkout" data-client={brand.id}>
        {isConfirmation ? (
          <Header variant={headerVariant} type="default" globalAppBar={false} bagCount={0} tabs={tabs} />
        ) : (
          <Header variant={headerVariant} type="secure" bagCount={CART.length} />
        )}

        <CheckoutPage />
      </div>
    </IconProvider>
  );
}
