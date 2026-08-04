/**
 * Code Connect manifest — the local record of how each React component maps to
 * its Figma component (file + node), and how props correspond to Figma variant
 * properties.
 *
 * Purpose:
 *  - Keeps every component "Code-Connect-ready" as it's built.
 *  - Powers the reverse direction (code → design): when a finished flow is drawn
 *    back into Figma, this mapping lets us place the real design-system
 *    component instances with the correct variant properties, rather than
 *    redrawing primitives.
 *  - Can later be promoted to formal Figma Code Connect (`figma.connect(...)`)
 *    once the project lives in a repo with a source URL.
 */
export const FIGMA_FILE_KEY = 'K8lQK8xsRGJxitLGxd1fb0'; // components-fabric-v2b

export interface ComponentMapping {
  /** React component name / source path. */
  component: string;
  source: string;
  /** Figma component-set node id. */
  figmaNodeId: string;
  /** Figma component key — used to import a real instance (code→design round-trip). */
  figmaComponentKey?: string;
  /** React prop → Figma variant property name. */
  propToVariant: Record<string, string>;
  /** React prop values → Figma variant values (per prop), where they differ in case. */
  valueMap?: Record<string, Record<string, string>>;
  notes?: string;
}

export const CODE_CONNECT: ComponentMapping[] = [
  {
    component: 'Button',
    source: 'src/components/Button/Button.tsx',
    figmaNodeId: '6543-36744',
    propToVariant: {
      variant: 'Variant',
      color: 'Color',
      size: 'Size',
      // State is expressed via CSS/native interaction, not a prop:
      //   default→Enabled, :hover→Hovered, :focus-visible→Focused,
      //   disabled→Disabled, loading→Loading.
    },
    valueMap: {
      variant: { contained: 'Contained', outlined: 'Outlined', unstyled: 'Unstyled' },
      color: { primary: 'Primary', secondary: 'Secondary' },
      size: { small: 'Small', medium: 'Medium', large: 'Large' },
    },
    notes:
      'Colour/typography/border-radius bound to themed CSS vars; padding(12/16/24)·gap(8)·height(28/36/44) are shared Structure constants.',
  },
  {
    component: 'IconButton',
    source: 'src/components/IconButton/IconButton.tsx',
    figmaNodeId: '9028-69880',
    propToVariant: {
      variant: 'Variant',
      color: 'Color',
      size: 'Size',
      // State via CSS/native (loading→Loading); `children`→Figma `icon`.
    },
    valueMap: {
      variant: { contained: 'Contained', outlined: 'Outlined', unstyled: 'Unstyled' },
      color: { primary: 'Primary', secondary: 'Secondary', action: 'Action' },
      size: { medium: 'Medium', large: 'Large' },
    },
    notes:
      'Square 36/44, circular via --global-icon-button-{size}-border-radius. Action colour → --action-default-* tokens. No Small size.',
  },
  {
    component: 'Check',
    source: 'src/components/Checkbox/Check.tsx',
    figmaNodeId: '26119-7772',
    propToVariant: { checked: 'checked', indeterminate: 'indeterminate' },
    notes:
      '20px box, --global-check-default-border-radius; 1px unselected / 2px selected; checkmark = check-s-default Icon; state → native/CSS. colour(Primary)/size(Default) fixed.',
  },
  {
    component: 'Checkbox',
    source: 'src/components/Checkbox/Checkbox.tsx',
    figmaNodeId: '19784-119461',
    propToVariant: { checked: 'checked', indeterminate: 'indeterminate', label: 'label', count: 'count' },
    notes:
      'Composes Check + label (Input Label 1) + optional count. Real hidden <input>; label/labelValue→label, count/countValue→count.',
  },
  {
    component: 'Radio',
    source: 'src/components/Radio/Radio.tsx',
    figmaNodeId: '26119-7819',
    propToVariant: { checked: 'checked' },
    notes: '20px circle (radius 50%); 1px unselected / 2px selected + centre dot. No indeterminate. state → native/CSS.',
  },
  {
    component: 'RadioButton',
    source: 'src/components/Radio/RadioButton.tsx',
    figmaNodeId: '9064-68701',
    propToVariant: { checked: 'checked', label: 'label' },
    notes: 'Composes Radio + label (Body 1). Real hidden <input type=radio> (native grouping via name); no count.',
  },
  {
    component: 'Header',
    source: 'src/components/Header/Header.tsx',
    figmaNodeId: '9197-74651',
    propToVariant: {
      variant: 'Variant',
      type: 'Type',
      backToNextAppBar: 'backToNextAppBar',
      globalAppBar: 'globalAppBar',
      // Figma "Screen Size" is handled responsively via CSS, not a prop.
    },
    valueMap: {
      variant: { standard: 'Standard', club22: 'Club22', club25: 'Club25', cutaway22: 'Cutaway22', tab22: 'Tab22', wing25: 'Wing25' },
      type: { default: 'Default', secure: 'Secure' },
    },
    notes:
      'Stacks AppBarBackToNext? · AppBarGlobal? · AppBarBrand · AppBarNav (Nav omitted for Wing25 and Secure). Screen Size = responsive CSS (@container/@media), not discrete variants.',
  },
  {
    component: 'AppBarBrand',
    source: 'src/components/AppBarBrand/AppBarBrand.tsx',
    figmaNodeId: '9028-66024',
    propToVariant: { variant: 'Variant', type: 'Type' },
    valueMap: {
      variant: { standard: 'Standard', club22: 'Club22', club25: 'Club25', cutaway22: 'Cutaway22', tab22: 'Tab22', wing25: 'Wing25' },
      type: { default: 'Default', secure: 'Secure' },
    },
    notes:
      'Logo (left/centre) · search TextField · icon group (IconButton + Badge on bag). Club25 swaps bag→Checkout Button; Wing25 = hamburger, no search; Secure = slim logo+lock, minimal icons.',
  },
  {
    component: 'AppBarGlobal',
    source: 'src/components/AppBarGlobal/AppBarGlobal.tsx',
    figmaNodeId: '9192-74176',
    propToVariant: {},
    notes: 'Centred promo message (Body 4) + right-aligned Links separated by a vertical Divider.',
  },
  {
    component: 'AppBarNav',
    source: 'src/components/AppBarNav/AppBarNav.tsx',
    figmaNodeId: '9065-69103',
    propToVariant: {},
    notes: 'Horizontally scrolling row of nav Tabs with a right-edge gradient fade.',
  },
  {
    component: 'AppBarBackToNext',
    source: 'src/components/AppBarBackToNext/AppBarBackToNext.tsx',
    figmaNodeId: '30825-21384',
    figmaComponentKey: '7ad3955c9bf194046c269cecc90d53f9003be34a',
    propToVariant: {},
    notes: 'Black "Back to Next" strip: chevron-left + "Back to" (Body 2) + white Next wordmark. Component set has a Screen Size axis (XS→XL) handled responsively via CSS, not a prop.',
  },
  {
    component: 'Tab',
    source: 'src/components/Tab/Tab.tsx',
    figmaNodeId: '9065-68654',
    propToVariant: {
      variant: 'Variant', state: 'State', tone: 'Sale/Clearance', logotype: 'Logotype',
      extraGutter: 'Extra Gutter', position: 'Position',
    },
    valueMap: {
      variant: { nav: 'Nav', 'global-bar': 'Global Bar', default: 'Default' },
      state: { enabled: 'Enabled', hovered: 'Hovered', focused: 'Focused', active: 'Active', disabled: 'Disabled' },
      position: { left: 'Left', inner: 'Inner', right: 'Right' },
    },
    notes:
      'Full set. Nav/Global Bar = text/logotype tab (tab-text-nav); tone=sale/clearance sets Sale/Clearance text colour; `indicator` = optional active bar/round/arrow. Default = connected "folder" tab (tab-text-1/2, Position borders, blue focus ring, disabled diagonal strike) — composed by <Tabs>.',
  },
  {
    component: 'TextField',
    source: 'src/components/TextField/TextField.tsx',
    figmaNodeId: '8985-62449',
    propToVariant: { variant: 'Variant', radius: 'Border Radius', size: 'Size', state: 'State' },
    valueMap: {
      variant: { default: 'Default', strong: 'Strong', block: 'Block' },
      radius: { default: 'Default', rounded: 'Rounded' },
      size: { medium: 'Medium', large: 'Large' },
      state: { enabled: 'Enabled', hovered: 'Hovered', focused: 'Focused', disabled: 'Disabled', error: 'Error', success: 'Success' },
    },
    notes: 'Colours derive from action + semantic tokens (no dedicated text-field tokens). `pill` aliases radius=Rounded (app-bar search). startIcon/endIcon = adornments.',
  },
  {
    component: 'Badge',
    source: 'src/components/Badge/Badge.tsx',
    figmaNodeId: '9121-76379',
    propToVariant: { variant: 'Variant', color: 'Color', size: 'Size' },
    valueMap: {
      variant: { default: 'Default', icon: 'Icon', dot: 'Dot' },
      color: { unstyled: 'Unstyled', primary: 'Primary', secondary: 'Secondary', notification: 'Notification', action: 'Action' },
      size: { small: 'Small', medium: 'Medium', large: 'Large' },
    },
    notes: 'Default=number(content), Icon=icon, Dot=small dot. Pass children to overlay top-right of an icon (the <Badge+Instance> usage, node 17312-83540). showZero keeps "0".',
  },
  {
    component: 'Link',
    source: 'src/components/Link/Link.tsx',
    figmaNodeId: '8974-62509',
    propToVariant: { underline: 'Underline', textStyle: 'Style' },
    notes: 'Anchor with theme colour (Color=Inherit default) + typography. Used in AppBarGlobal (Body 4, underline always).',
  },
  {
    component: 'Divider',
    source: 'src/components/Divider/Divider.tsx',
    figmaNodeId: '8899-60539',
    propToVariant: { orientation: 'orientation' },
    notes: '1px themed line (--components-divider-default-border-color). Vertical form used between the global-bar links.',
  },
  {
    component: 'Logotype',
    source: 'src/components/Logotype/Logotype.tsx',
    figmaNodeId: '8989-65272',
    propToVariant: {},
    notes: 'Brand wordmark from /iconography/logotype via logo(); brand from IconBrandContext. Not variant-mapped (brand-driven, not a Figma variant).',
  },
  {
    component: 'TextArea',
    source: 'src/components/TextArea/TextArea.tsx',
    figmaNodeId: '42568-6551',
    propToVariant: { size: 'Size', state: 'State' },
    valueMap: {
      size: { medium: 'Medium', large: 'Large' },
      state: { enabled: 'Enabled', hovered: 'Hovered', focused: 'Focused', disabled: 'Disabled', error: 'Error' },
    },
    notes: 'Multi-line input sharing the TextField token model. No Success state.',
  },
  {
    component: 'Select',
    source: 'src/components/Select/Select.tsx',
    figmaNodeId: '6570-41424',
    propToVariant: { size: 'Size', state: 'State', active: 'Active', showChip: 'showChip', showFlag: 'showFlag' },
    valueMap: {
      size: { medium: 'Medium', large: 'Large' },
      state: { enabled: 'Enabled', hovered: 'Hovered', focused: 'Focused', disabled: 'Disabled', error: 'Error' },
    },
    notes: 'Trigger only (value/placeholder + chevron). Radius theme-driven via exported --global-select-{size}-border-radius (Next 4px / Joules 0 / Reiss 2) — the Figma board\'s 22px pill is a non-exported Structure var, so the generated token (4px) is used. NO Border Radius variant. showChip/showFlag = leading slots; omit `value` for the placeholder. Active=open flips the chevron.',
  },
  {
    component: 'InputStepper',
    source: 'src/components/InputStepper/InputStepper.tsx',
    figmaNodeId: '31576-35621',
    propToVariant: { size: 'Size' },
    valueMap: { size: { medium: 'Medium', large: 'Large' } },
    notes: 'Minus/value/Plus. Radius theme-driven via exported --global-input-stepper-{size}-border-radius (Next 4px / Joules 0 square). Figma Value=Minimum/Middle/Maximum → minus disables at min, plus at max. Per-button Hovered/Focused Plus/Minus states are native :hover/:focus.',
  },
  {
    component: 'Tabs',
    source: 'src/components/Tabs/Tabs.tsx',
    figmaNodeId: '37288-120972',
    propToVariant: {},
    notes: 'Connected "folder" tabs on a track; active tab lifts with the highlight bar. Uses tab-default tokens (distinct from AppBarNav / the nav <Tab>).',
  },
  {
    component: 'Alert',
    source: 'src/components/Alert/Alert.tsx',
    figmaNodeId: '9951-66221',
    propToVariant: { style: 'Style', alignment: 'Alignment' },
    valueMap: {
      style: { error: 'Error', warning: 'Warning', info: 'Info', success: 'Success' },
      alignment: { default: 'Default', rtl: 'Right to Left' },
    },
    notes: 'Left-accent tinted banner: title (Subtitle 2) + body (Body 1) + optional close IconButton. Colours from --components-alert-{style}-default-* tokens.',
  },
  {
    component: 'AlertSignal',
    source: 'src/components/AlertSignal/AlertSignal.tsx',
    figmaNodeId: '43422-1103',
    propToVariant: { alignment: 'Alignment' },
    valueMap: { alignment: { default: 'Default', rtl: 'Right to Left' } },
    notes: 'Signal banner (top/bottom dividers, no accent) with title, body, inline Link. Uses --components-alert-{info,warning}-signal-* tokens; `color` selects info/warning.',
  },
];
