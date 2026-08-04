/**
 * Header configuration model — mirrors the Figma `_Config / Header / *` variables
 * (library `components-fabric-v2b`, keyed by the Realm brand modes). Each field maps
 * to one Figma config variable so the studio can drive the same header options the
 * design system exposes. Defaults below are the Figma "Next" mode values.
 *
 * The header variant list is the `{Header}` component's `Variant` property options
 * (Club22 · Tab22 · Cutaway22 · Standard · Club25 · Wing25).
 */
export type HeaderFieldType = 'bool' | 'text' | 'select' | 'number';
export type HeaderGroup = 'Template' | 'Global bar' | 'Primary nav' | 'Menus';

export interface HeaderFieldDef {
  id: string;
  /** The `_Config` variable this field controls. */
  figmaVar: string;
  name: string;
  type: HeaderFieldType;
  group: HeaderGroup;
  default: boolean | string | number;
  options?: readonly string[];
  /** For label/text fields: the boolean field that must be on for this to apply. */
  gatedBy?: string;
}

/** The header variants — the `{Header}` component's `Variant` property options. */
export const HEADER_TEMPLATES = ['Club22', 'Tab22', 'Cutaway22', 'Standard', 'Club25', 'Wing25'] as const;

export const HEADER_GROUP_ORDER: HeaderGroup[] = ['Template', 'Global bar', 'Primary nav', 'Menus'];

/** Primary-nav defaults from the Figma "Next" mode. */
const NAV_LABELS = [
  'For You', 'Women', 'Men', 'Boys', 'Girls', 'Home', 'School', 'Baby',
  'Brands', 'Gifts', 'Beauty', 'Sports', 'Clearance', 'Tab', 'Tab', 'Tab',
];
const NAV_ENABLED_UPTO = 13; // tabs 1..13 on by default

const NAV_FIELDS: HeaderFieldDef[] = Array.from({ length: 16 }, (_, idx) => {
  const i = idx + 1;
  return [
    {
      id: `nav.tab${i}`,
      figmaVar: `_Config/Header/AppBarNav/Default/Tab ${i}`,
      name: `Tab ${i}`,
      type: 'bool' as const,
      group: 'Primary nav' as const,
      default: i <= NAV_ENABLED_UPTO,
    },
    {
      id: `nav.tab${i}.label`,
      figmaVar: `_Config/Header/AppBarNav/Default/Tab Label ${i}`,
      name: `Tab ${i} label`,
      type: 'text' as const,
      group: 'Primary nav' as const,
      default: NAV_LABELS[idx],
      gatedBy: `nav.tab${i}`,
    },
  ];
}).flat();

export const HEADER_FIELDS: HeaderFieldDef[] = [
  // Template — the header variant + its feature toggles
  { id: 'template', figmaVar: '_Config/Header/Template/Template', name: 'Template', type: 'select', group: 'Template', default: 'Cutaway22', options: HEADER_TEMPLATES },
  { id: 'favourites', figmaVar: '_Config/Header/Template/Favourites', name: 'Favourites', type: 'bool', group: 'Template', default: true },
  { id: 'flag', figmaVar: '_Config/Header/Template/Flag', name: 'Country flag', type: 'bool', group: 'Template', default: false },
  { id: 'storeLocator', figmaVar: '_Config/Header/Template/Store Locator', name: 'Store locator', type: 'bool', group: 'Template', default: false },
  { id: 'myAccountLabel', figmaVar: '_Config/Header/Template/My Account Label', name: 'My account label', type: 'bool', group: 'Template', default: false },
  { id: 'helpLabel', figmaVar: '_Config/Header/Template/Help Label', name: 'Help label', type: 'bool', group: 'Template', default: false },

  // Global bar — the top utility strip
  { id: 'uspMessage', figmaVar: '_Config/Header/AppBarGlobal/USP Message', name: 'USP message', type: 'bool', group: 'Global bar', default: true },
  { id: 'uspMessageLabel', figmaVar: '_Config/Header/AppBarGlobal/USP Message Label', name: 'USP message text', type: 'text', group: 'Global bar', default: 'Next day delivery to home or free to store*', gatedBy: 'uspMessage' },
  { id: 'quickLink1', figmaVar: '_Config/Header/AppBarGlobal/Quick Link 1', name: 'Quick link 1', type: 'bool', group: 'Global bar', default: true },
  { id: 'quickLink1Label', figmaVar: '_Config/Header/AppBarGlobal/Quick Link 1 Label', name: 'Quick link 1 text', type: 'text', group: 'Global bar', default: 'Store Locator', gatedBy: 'quickLink1' },
  { id: 'quickLink2', figmaVar: '_Config/Header/AppBarGlobal/Quick Link 2', name: 'Quick link 2', type: 'bool', group: 'Global bar', default: true },
  { id: 'quickLink2Label', figmaVar: '_Config/Header/AppBarGlobal/Quick Link 2 Label', name: 'Quick link 2 text', type: 'text', group: 'Global bar', default: 'Help', gatedBy: 'quickLink2' },
  { id: 'subsiteLinks', figmaVar: '_Config/Header/AppBarGlobal/Subsite Links', name: 'Subsite links', type: 'bool', group: 'Global bar', default: false },

  // Menus
  { id: 'searchFullWidth', figmaVar: '_Config/Header/SearchMenu/Full Width', name: 'Search menu · full width', type: 'bool', group: 'Menus', default: false },
  { id: 'megaFullWidth', figmaVar: '_Config/Header/MegaMenu/Full Width', name: 'Mega menu · full width', type: 'bool', group: 'Menus', default: false },

  // Primary nav — 16 tabs (show/hide + label)
  ...NAV_FIELDS,
];

export type HeaderConfigState = Record<string, boolean | string | number>;

/**
 * Per-client header configuration, pulled from the Figma `_Config/Header/*`
 * variables at each Realm brand mode (client id → that brand's mode). This is the
 * source of truth the studio seeds from; editing in the Config board overrides a
 * client's copy in the store. Keep client ids in sync with `config/clients.ts`.
 */
export const HEADER_CONFIG_BY_BRAND: Record<string, HeaderConfigState> = {
  next: { template: 'Cutaway22', favourites: true, flag: false, storeLocator: false, myAccountLabel: false, helpLabel: false, uspMessage: true, uspMessageLabel: 'Next day delivery to home or free to store*', quickLink1: true, quickLink1Label: 'Store Locator', quickLink2: true, quickLink2Label: 'Help', subsiteLinks: false, searchFullWidth: false, megaFullWidth: false, 'nav.tab1': true, 'nav.tab1.label': 'For You', 'nav.tab2': true, 'nav.tab2.label': 'Women', 'nav.tab3': true, 'nav.tab3.label': 'Men', 'nav.tab4': true, 'nav.tab4.label': 'Boys', 'nav.tab5': true, 'nav.tab5.label': 'Girls', 'nav.tab6': true, 'nav.tab6.label': 'Home', 'nav.tab7': true, 'nav.tab7.label': 'School', 'nav.tab8': true, 'nav.tab8.label': 'Baby', 'nav.tab9': true, 'nav.tab9.label': 'Brands', 'nav.tab10': true, 'nav.tab10.label': 'Gifts', 'nav.tab11': true, 'nav.tab11.label': 'Beauty', 'nav.tab12': true, 'nav.tab12.label': 'Sports', 'nav.tab13': true, 'nav.tab13.label': 'Clearance', 'nav.tab14': false, 'nav.tab14.label': 'Tab', 'nav.tab15': false, 'nav.tab15.label': 'Tab', 'nav.tab16': false, 'nav.tab16.label': 'Tab' },
  reiss: { template: 'Tab22', favourites: true, flag: true, storeLocator: false, myAccountLabel: false, helpLabel: false, uspMessage: true, uspMessageLabel: 'FREE NEXT DAY DELIVERY AND RETURNS TO STORES*', quickLink1: false, quickLink1Label: 'Link', quickLink2: false, quickLink2Label: 'Link', subsiteLinks: false, searchFullWidth: true, megaFullWidth: true, 'nav.tab1': true, 'nav.tab1.label': 'WOMEN', 'nav.tab2': true, 'nav.tab2.label': 'MEN', 'nav.tab3': true, 'nav.tab3.label': 'CHILDREN', 'nav.tab4': true, 'nav.tab4.label': 'BRANDS', 'nav.tab5': true, 'nav.tab5.label': 'OUTLET', 'nav.tab6': true, 'nav.tab6.label': 'STORIES', 'nav.tab7': false, 'nav.tab7.label': 'Tab', 'nav.tab8': false, 'nav.tab8.label': 'Tab', 'nav.tab9': false, 'nav.tab9.label': 'Tab', 'nav.tab10': false, 'nav.tab10.label': 'Tab', 'nav.tab11': false, 'nav.tab11.label': 'Tab', 'nav.tab12': false, 'nav.tab12.label': 'Tab', 'nav.tab13': false, 'nav.tab13.label': 'Tab', 'nav.tab14': false, 'nav.tab14.label': 'Tab', 'nav.tab15': false, 'nav.tab15.label': 'Tab', 'nav.tab16': false, 'nav.tab16.label': 'Tab' },
  gap: { template: 'Club22', favourites: true, flag: false, storeLocator: false, myAccountLabel: false, helpLabel: false, uspMessage: true, uspMessageLabel: 'Free next day delivery and returns to stores*', quickLink1: false, quickLink1Label: 'Link', quickLink2: false, quickLink2Label: 'Link', subsiteLinks: false, searchFullWidth: true, megaFullWidth: true, 'nav.tab1': true, 'nav.tab1.label': 'New In', 'nav.tab2': true, 'nav.tab2.label': 'Women', 'nav.tab3': true, 'nav.tab3.label': 'Men', 'nav.tab4': true, 'nav.tab4.label': 'Boys', 'nav.tab5': true, 'nav.tab5.label': 'Girls', 'nav.tab6': true, 'nav.tab6.label': 'Baby & Toddler', 'nav.tab7': true, 'nav.tab7.label': 'Discover GAP', 'nav.tab8': false, 'nav.tab8.label': 'Tab', 'nav.tab9': false, 'nav.tab9.label': 'Tab', 'nav.tab10': false, 'nav.tab10.label': 'Tab', 'nav.tab11': false, 'nav.tab11.label': 'Tab', 'nav.tab12': false, 'nav.tab12.label': 'Tab', 'nav.tab13': false, 'nav.tab13.label': 'Tab', 'nav.tab14': false, 'nav.tab14.label': 'Tab', 'nav.tab15': false, 'nav.tab15.label': 'Tab', 'nav.tab16': false, 'nav.tab16.label': 'Tab' },
  made: { template: 'Cutaway22', favourites: true, flag: false, storeLocator: false, myAccountLabel: false, helpLabel: false, uspMessage: true, uspMessageLabel: 'FREE NEXT DAY DELIVERY AND RETURNS TO STORES *', quickLink1: false, quickLink1Label: 'Link', quickLink2: false, quickLink2Label: 'Link', subsiteLinks: false, searchFullWidth: false, megaFullWidth: true, 'nav.tab1': true, 'nav.tab1.label': 'Shop All', 'nav.tab2': true, 'nav.tab2.label': 'Sofas & Chairs', 'nav.tab3': true, 'nav.tab3.label': 'Lighting', 'nav.tab4': true, 'nav.tab4.label': 'Garden', 'nav.tab5': true, 'nav.tab5.label': 'Bedroom', 'nav.tab6': true, 'nav.tab6.label': 'Living Room', 'nav.tab7': true, 'nav.tab7.label': 'Dining Room', 'nav.tab8': true, 'nav.tab8.label': 'Soft Furnishings', 'nav.tab9': true, 'nav.tab9.label': 'Home Accessories', 'nav.tab10': false, 'nav.tab10.label': 'Tab', 'nav.tab11': false, 'nav.tab11.label': 'Tab', 'nav.tab12': false, 'nav.tab12.label': 'Tab', 'nav.tab13': false, 'nav.tab13.label': 'Tab', 'nav.tab14': false, 'nav.tab14.label': 'Tab', 'nav.tab15': false, 'nav.tab15.label': 'Tab', 'nav.tab16': false, 'nav.tab16.label': 'Tab' },
  fatface: { template: 'Tab22', favourites: true, flag: false, storeLocator: false, myAccountLabel: false, helpLabel: false, uspMessage: true, uspMessageLabel: 'Free next day delivery and returns to stores*', quickLink1: false, quickLink1Label: 'Link', quickLink2: false, quickLink2Label: 'Link', subsiteLinks: false, searchFullWidth: true, megaFullWidth: true, 'nav.tab1': true, 'nav.tab1.label': 'Women', 'nav.tab2': true, 'nav.tab2.label': 'Men', 'nav.tab3': true, 'nav.tab3.label': 'Kids', 'nav.tab4': true, 'nav.tab4.label': 'Sustainability', 'nav.tab5': true, 'nav.tab5.label': 'Blog', 'nav.tab6': true, 'nav.tab6.label': 'Sale', 'nav.tab7': false, 'nav.tab7.label': 'Tab', 'nav.tab8': false, 'nav.tab8.label': 'Tab', 'nav.tab9': false, 'nav.tab9.label': 'Tab', 'nav.tab10': false, 'nav.tab10.label': 'Tab', 'nav.tab11': false, 'nav.tab11.label': 'Tab', 'nav.tab12': false, 'nav.tab12.label': 'Tab', 'nav.tab13': false, 'nav.tab13.label': 'Tab', 'nav.tab14': false, 'nav.tab14.label': 'Tab', 'nav.tab15': false, 'nav.tab15.label': 'Tab', 'nav.tab16': false, 'nav.tab16.label': 'Tab' },
  jojomamanbebe: { template: 'Tab22', favourites: true, flag: true, storeLocator: false, myAccountLabel: false, helpLabel: false, uspMessage: true, uspMessageLabel: 'Free next day delivery and returns to stores*', quickLink1: false, quickLink1Label: 'Link', quickLink2: false, quickLink2Label: 'Link', subsiteLinks: false, searchFullWidth: true, megaFullWidth: true, 'nav.tab1': true, 'nav.tab1.label': 'Baby (0-2 Years)', 'nav.tab2': true, 'nav.tab2.label': 'Girls (2-9 Years)', 'nav.tab3': true, 'nav.tab3.label': 'Boys (2-9 Years)', 'nav.tab4': true, 'nav.tab4.label': 'Maternity', 'nav.tab5': true, 'nav.tab5.label': 'Holiday Shop', 'nav.tab6': true, 'nav.tab6.label': 'Toys & Gifts', 'nav.tab7': true, 'nav.tab7.label': 'New In', 'nav.tab8': true, 'nav.tab8.label': 'Home & Nursery', 'nav.tab9': true, 'nav.tab9.label': 'Prams & Travel', 'nav.tab10': true, 'nav.tab10.label': 'Clearance', 'nav.tab11': false, 'nav.tab11.label': 'Tab', 'nav.tab12': false, 'nav.tab12.label': 'Tab', 'nav.tab13': false, 'nav.tab13.label': 'Tab', 'nav.tab14': false, 'nav.tab14.label': 'Tab', 'nav.tab15': false, 'nav.tab15.label': 'Tab', 'nav.tab16': false, 'nav.tab16.label': 'Tab' },
  victoriassecret: { template: 'Club22', favourites: true, flag: true, storeLocator: false, myAccountLabel: false, helpLabel: false, uspMessage: true, uspMessageLabel: 'Free next day delivery and returns to stores*', quickLink1: false, quickLink1Label: 'Link', quickLink2: false, quickLink2Label: 'Link', subsiteLinks: false, searchFullWidth: true, megaFullWidth: true, 'nav.tab1': true, 'nav.tab1.label': 'ICONIC', 'nav.tab2': true, 'nav.tab2.label': 'BRAS', 'nav.tab3': true, 'nav.tab3.label': 'KNICKERS', 'nav.tab4': true, 'nav.tab4.label': 'NIGHTWEAR', 'nav.tab5': true, 'nav.tab5.label': 'LINGERIE', 'nav.tab6': true, 'nav.tab6.label': 'FRAGRANCE', 'nav.tab7': true, 'nav.tab7.label': 'SWIM', 'nav.tab8': true, 'nav.tab8.label': 'ACCESSORIES', 'nav.tab9': true, 'nav.tab9.label': 'CLOTHING & LOUNGE', 'nav.tab10': true, 'nav.tab10.label': 'SPORT', 'nav.tab11': true, 'nav.tab11.label': 'OUTLET', 'nav.tab12': false, 'nav.tab12.label': 'Tab', 'nav.tab13': false, 'nav.tab13.label': 'Tab', 'nav.tab14': false, 'nav.tab14.label': 'Tab', 'nav.tab15': false, 'nav.tab15.label': 'Tab', 'nav.tab16': false, 'nav.tab16.label': 'Tab' },
  bathandbodyworks: { template: 'Club22', favourites: true, flag: false, storeLocator: false, myAccountLabel: false, helpLabel: false, uspMessage: true, uspMessageLabel: 'Free next day delivery and returns to stores*', quickLink1: false, quickLink1Label: 'Link', quickLink2: false, quickLink2Label: 'Link', subsiteLinks: false, searchFullWidth: true, megaFullWidth: true, 'nav.tab1': true, 'nav.tab1.label': 'Top Offers', 'nav.tab2': true, 'nav.tab2.label': 'New', 'nav.tab3': true, 'nav.tab3.label': 'Gift Shop', 'nav.tab4': true, 'nav.tab4.label': 'Body Care', 'nav.tab5': true, 'nav.tab5.label': 'Candles', 'nav.tab6': true, 'nav.tab6.label': 'Wallflowers & Diffusers', 'nav.tab7': true, 'nav.tab7.label': 'Hand Soaps & Sanitisers', 'nav.tab8': true, 'nav.tab8.label': "Men's Shop", 'nav.tab9': true, 'nav.tab9.label': 'Laundry Care', 'nav.tab10': false, 'nav.tab10.label': 'Tab', 'nav.tab11': false, 'nav.tab11.label': 'Tab', 'nav.tab12': false, 'nav.tab12.label': 'Tab', 'nav.tab13': false, 'nav.tab13.label': 'Tab', 'nav.tab14': false, 'nav.tab14.label': 'Tab', 'nav.tab15': false, 'nav.tab15.label': 'Tab', 'nav.tab16': false, 'nav.tab16.label': 'Tab' },
  joules: { template: 'Tab22', favourites: true, flag: false, storeLocator: false, myAccountLabel: false, helpLabel: false, uspMessage: true, uspMessageLabel: 'Free next day delivery and returns to stores*', quickLink1: false, quickLink1Label: 'Link', quickLink2: false, quickLink2Label: 'Link', subsiteLinks: false, searchFullWidth: true, megaFullWidth: true, 'nav.tab1': true, 'nav.tab1.label': 'WOMEN', 'nav.tab2': true, 'nav.tab2.label': 'MEN', 'nav.tab3': true, 'nav.tab3.label': 'KIDS', 'nav.tab4': true, 'nav.tab4.label': 'HOME', 'nav.tab5': true, 'nav.tab5.label': 'GIFTS', 'nav.tab6': true, 'nav.tab6.label': 'OUTLET', 'nav.tab7': true, 'nav.tab7.label': 'JOURNAL', 'nav.tab8': false, 'nav.tab8.label': 'Tab', 'nav.tab9': false, 'nav.tab9.label': 'Tab', 'nav.tab10': false, 'nav.tab10.label': 'Tab', 'nav.tab11': false, 'nav.tab11.label': 'Tab', 'nav.tab12': false, 'nav.tab12.label': 'Tab', 'nav.tab13': false, 'nav.tab13.label': 'Tab', 'nav.tab14': false, 'nav.tab14.label': 'Tab', 'nav.tab15': false, 'nav.tab15.label': 'Tab', 'nav.tab16': false, 'nav.tab16.label': 'Tab' },
  logo: { template: 'Club25', favourites: false, flag: true, storeLocator: true, myAccountLabel: false, helpLabel: false, uspMessage: true, uspMessageLabel: 'Next day delivery to home or free to store*', quickLink1: true, quickLink1Label: 'Link', quickLink2: true, quickLink2Label: 'Link', subsiteLinks: true, searchFullWidth: false, megaFullWidth: false, 'nav.tab1': true, 'nav.tab1.label': 'Tab', 'nav.tab2': true, 'nav.tab2.label': 'Tab', 'nav.tab3': true, 'nav.tab3.label': 'Tab', 'nav.tab4': true, 'nav.tab4.label': 'Tab', 'nav.tab5': true, 'nav.tab5.label': 'Tab', 'nav.tab6': true, 'nav.tab6.label': 'Tab', 'nav.tab7': true, 'nav.tab7.label': 'Tab', 'nav.tab8': true, 'nav.tab8.label': 'Tab', 'nav.tab9': true, 'nav.tab9.label': 'Tab', 'nav.tab10': true, 'nav.tab10.label': 'Tab', 'nav.tab11': true, 'nav.tab11.label': 'Tab', 'nav.tab12': true, 'nav.tab12.label': 'Tab', 'nav.tab13': true, 'nav.tab13.label': 'Tab', 'nav.tab14': false, 'nav.tab14.label': 'Tab', 'nav.tab15': false, 'nav.tab15.label': 'Tab', 'nav.tab16': false, 'nav.tab16.label': 'Tab' },
};

/** Field-level fallback (Next values) for any client not present in the table. */
export const defaultHeaderConfig = (): HeaderConfigState =>
  HEADER_FIELDS.reduce((acc, f) => { acc[f.id] = f.default; return acc; }, {} as HeaderConfigState);

/** The header config for a client, falling back to the field defaults. */
export const headerConfigForClient = (clientId: string): HeaderConfigState =>
  HEADER_CONFIG_BY_BRAND[clientId] ?? defaultHeaderConfig();

/** A deep copy of the whole per-client table, for store init / reset. */
export const defaultHeaderConfigByClient = (): Record<string, HeaderConfigState> =>
  JSON.parse(JSON.stringify(HEADER_CONFIG_BY_BRAND));
