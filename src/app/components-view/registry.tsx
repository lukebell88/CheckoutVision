import type { ReactNode } from 'react';
import { HEADER_FIELDS, HEADER_GROUP_ORDER } from '../../config/headerConfig';
import type { ConfigBoardSpec } from './ConfigBoard';
import { Button, type ButtonVariant, type ButtonColor, type ButtonSize } from '../../components/Button';
import { IconButton, type IconButtonVariant, type IconButtonColor, type IconButtonSize } from '../../components/IconButton';
import { Icon } from '../../components/Icon';
import { Checkbox } from '../../components/Checkbox';
import { RadioButton } from '../../components/Radio';
import { Header, type HeaderVariant, type HeaderType } from '../../components/Header';
import { AppBarBrand, variantFromTemplate, type AppBarBrandVariant, type AppBarBrandType } from '../../components/AppBarBrand';
import { AppBarGlobal } from '../../components/AppBarGlobal';
import { AppBarNav } from '../../components/AppBarNav';
import { AppBarBackToNext } from '../../components/AppBarBackToNext';
import { TextField, type TextFieldVariant, type TextFieldSize, type TextFieldRadius, type TextFieldState } from '../../components/TextField';
import { TextArea, type TextAreaSize, type TextAreaState } from '../../components/TextArea';
import { Select, type SelectSize, type SelectState } from '../../components/Select';
import { InputStepper, type InputStepperSize } from '../../components/InputStepper';
import { Tab, type TabVariant, type TabState, type TabTone, type TabIndicator, type TabPosition } from '../../components/Tab';
import { Tabs } from '../../components/Tabs';
import { Badge, type BadgeColor } from '../../components/Badge';
import { Alert, type AlertStyle } from '../../components/Alert';
import { AlertSignal, type AlertSignalColor } from '../../components/AlertSignal';
import { Divider } from '../../components/Divider';
import { Link, type LinkTextStyle } from '../../components/Link';
import { Logotype } from '../../components/Logotype';

/**
 * Component registry — the data behind the design-system browser. Each entry is
 * a component with its Figma node and a single interactive playground (prop
 * controls + live preview + copyable code). No static specimen grids.
 */
export type PlayValue = string | boolean;
export interface PlayControl {
  prop: string;
  type: 'select' | 'toggle';
  options?: string[];
  default: PlayValue;
  /**
   * The `_Config` field this control mirrors. When set, the dropdown marks the
   * option the ACTIVE client is configured to use, so you can see at a glance
   * which variant is Reiss's and which you're just previewing. Follows the brand
   * switcher, and reflects live edits made on the Configuration board.
   */
  configField?: string;
  /** Map a config value ("Tab22") to this control's value ("tab22"). */
  fromConfig?: (v: unknown) => PlayValue;
}
export interface PlaygroundSpec {
  controls: PlayControl[];
  render: (v: Record<string, PlayValue>) => ReactNode;
  /** Static attributes always shown in the generated code (e.g. aria-label). */
  attrs?: string;
  /** Text/markup shown between the tags in the generated code. */
  childText?: string;
  /** Extra import lines (e.g. a companion Icon import). */
  importExtra?: string;
  /** Full override of the generated code (for tag ≠ name or complex props). */
  code?: (v: Record<string, PlayValue>) => string;
}
export interface ComponentSpec {
  id: string;
  name: string;
  figmaNode: string;
  description: string;
  playground: PlaygroundSpec;
  /**
   * A per-client configuration board (the Figma `_Config/*` variables for this
   * component across every brand). Components that declare one are listed in the
   * Configuration section above the component list.
   */
  config?: ConfigBoardSpec;
}

/** Components that expose a configuration board, in nav order. */
export const CONFIGURABLE = (): ComponentSpec[] => REGISTRY.filter((c) => c.config);

const HeartIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 1 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" />
  </svg>
);

const SAMPLE_ICONS = ['bag', 'favourite', 'search', 'delivery', 'account', 'store', 'card', 'secure', 'gift', 'calendar', 'edit', 'share'];
const HEADER_VARIANTS: HeaderVariant[] = ['standard', 'club22', 'club25', 'cutaway22', 'tab22', 'wing25'];
const full = (node: ReactNode) => <div style={{ width: '100%' }}>{node}</div>;
const boxed = (w: number, node: ReactNode) => <div style={{ width: w, maxWidth: '100%' }}>{node}</div>;

export const REGISTRY: ComponentSpec[] = [
  {
    id: 'button', name: 'Button', figmaNode: '6543-36744',
    description: 'Variant × Color × Size × State.',
    playground: {
      controls: [
        { prop: 'variant', type: 'select', options: ['contained', 'outlined', 'unstyled'], default: 'contained' },
        { prop: 'color', type: 'select', options: ['primary', 'secondary'], default: 'primary' },
        { prop: 'size', type: 'select', options: ['large', 'medium', 'small'], default: 'large' },
        { prop: 'loading', type: 'toggle', default: false },
        { prop: 'disabled', type: 'toggle', default: false },
        { prop: 'fullWidth', type: 'toggle', default: false },
      ],
      childText: 'Label',
      render: (v) => (
        <Button variant={v.variant as ButtonVariant} color={v.color as ButtonColor} size={v.size as ButtonSize} loading={!!v.loading} disabled={!!v.disabled} fullWidth={!!v.fullWidth}>Label</Button>
      ),
    },
  },
  {
    id: 'iconbutton', name: 'IconButton', figmaNode: '9028-69880',
    description: 'Icon-only button; Action colour is the neutral bordered style.',
    playground: {
      controls: [
        { prop: 'variant', type: 'select', options: ['contained', 'outlined', 'unstyled'], default: 'contained' },
        { prop: 'color', type: 'select', options: ['primary', 'secondary', 'action'], default: 'primary' },
        { prop: 'size', type: 'select', options: ['large', 'medium'], default: 'large' },
        { prop: 'loading', type: 'toggle', default: false },
        { prop: 'disabled', type: 'toggle', default: false },
      ],
      attrs: 'aria-label="Bag"',
      childText: '<Icon name="bag" />',
      importExtra: `import { Icon } from './components/Icon';`,
      render: (v) => (
        <IconButton variant={v.variant as IconButtonVariant} color={v.color as IconButtonColor} size={v.size as IconButtonSize} loading={!!v.loading} disabled={!!v.disabled} aria-label="Favourite"><HeartIcon /></IconButton>
      ),
    },
  },
  {
    id: 'checkbox', name: 'Checkbox', figmaNode: '19784-119461',
    description: 'Check box with checkmark / indeterminate + optional label & count.',
    playground: {
      controls: [
        { prop: 'checked', type: 'toggle', default: true },
        { prop: 'indeterminate', type: 'toggle', default: false },
        { prop: 'disabled', type: 'toggle', default: false },
        { prop: 'count', type: 'toggle', default: true },
      ],
      attrs: 'label="Label"',
      code: (v) => `import { Checkbox } from './components/Checkbox';\n\n<Checkbox label="Label"${v.count ? ' count="(123)"' : ''}${v.checked ? ' checked' : ''}${v.indeterminate ? ' indeterminate' : ''}${v.disabled ? ' disabled' : ''} />`,
      render: (v) => (
        <Checkbox label="Label" count={v.count ? '(123)' : undefined} checked={!!v.checked} indeterminate={!!v.indeterminate} disabled={!!v.disabled} onChange={() => {}} />
      ),
    },
  },
  {
    id: 'radio', name: 'Radio', figmaNode: '9064-68701',
    description: 'Single-select circle with centre dot + optional label.',
    playground: {
      controls: [
        { prop: 'checked', type: 'toggle', default: true },
        { prop: 'disabled', type: 'toggle', default: false },
      ],
      code: (v) => `import { RadioButton } from './components/Radio';\n\n<RadioButton name="group" label="Option"${v.checked ? ' defaultChecked' : ''}${v.disabled ? ' disabled' : ''} />`,
      render: (v) => <RadioButton label="Option" checked={!!v.checked} disabled={!!v.disabled} onChange={() => {}} />,
    },
  },
  {
    id: 'icon', name: 'Icon', figmaNode: '—',
    description: 'Any SVG from the icon set, inline & recolourable via currentColor.',
    playground: {
      controls: [
        { prop: 'name', type: 'select', options: SAMPLE_ICONS, default: 'bag' },
        { prop: 'size', type: 'select', options: ['16', '20', '24', '32', '40'], default: '32' },
      ],
      code: (v) => `import { Icon } from './components/Icon';\n\n<Icon name="${v.name}" size={${v.size}} />`,
      render: (v) => <Icon name={v.name as string} size={Number(v.size)} />,
    },
  },
  {
    id: 'header', name: 'Header', figmaNode: '9197-74651',
    description: 'Responsive site header — 6 variants × Default/Secure. Stacks the app bars; breakpoints via CSS.',
    playground: {
      controls: [
        { prop: 'variant', type: 'select', options: [...HEADER_VARIANTS], default: 'standard', configField: 'template', fromConfig: variantFromTemplate },
        { prop: 'type', type: 'select', options: ['default', 'secure'], default: 'default' },
        { prop: 'backToNextAppBar', type: 'toggle', default: false },
        { prop: 'globalAppBar', type: 'toggle', default: true },
      ],
      render: (v) => full(<Header variant={v.variant as HeaderVariant} type={v.type as HeaderType} backToNextAppBar={!!v.backToNextAppBar} globalAppBar={!!v.globalAppBar} bagCount={2} />),
    },
    // The `_Config/Header/*` variables at each Realm brand mode. Primary nav and
    // free-text rows are left out: 16 tabs × 10 clients doesn't tabulate.
    config: {
      fields: HEADER_FIELDS,
      groupOrder: HEADER_GROUP_ORDER.filter((g) => g !== 'Primary nav'),
      include: (f) => f.group !== 'Primary nav' && f.type !== 'text',
    },
  },
  {
    id: 'appbarbrand', name: 'AppBarBrand', figmaNode: '9028-66024',
    description: 'The primary header bar: logo · search · icon group. Drives the six style variants + Secure form.',
    playground: {
      controls: [
        { prop: 'variant', type: 'select', options: [...HEADER_VARIANTS], default: 'standard', configField: 'template', fromConfig: variantFromTemplate },
        { prop: 'type', type: 'select', options: ['default', 'secure'], default: 'default' },
      ],
      render: (v) => full(<AppBarBrand variant={v.variant as AppBarBrandVariant} type={v.type as AppBarBrandType} bagCount={2} />),
    },
  },
  {
    id: 'appbarglobal', name: 'AppBarGlobal', figmaNode: '9192-74176',
    description: 'Global bar — centred promo message + right-aligned links with a divider.',
    playground: {
      controls: [],
      attrs: 'message="Next day delivery to home or free to store*"',
      render: () => full(<AppBarGlobal />),
    },
  },
  {
    id: 'appbarnav', name: 'AppBarNav', figmaNode: '9065-69103',
    description: 'Scrolling tab navigation with a right-edge gradient fade.',
    playground: {
      controls: [],
      attrs: `tabs={['Home', 'New in', 'Sale']}`,
      render: () => full(<AppBarNav />),
    },
  },
  {
    id: 'appbarbacktonext', name: 'AppBarBackToNext', figmaNode: '30825-21384',
    description: 'Black "Back to Next" strip shown above the header via the Header backToNextAppBar flag.',
    playground: {
      controls: [],
      render: () => full(<AppBarBackToNext />),
    },
  },
  {
    id: 'textfield', name: 'TextField', figmaNode: '8985-62449',
    description: 'Variant (Default · Strong · Block) × Radius × Size × State (Enabled/Hovered/Focused/Disabled/Error/Success).',
    playground: {
      controls: [
        { prop: 'variant', type: 'select', options: ['default', 'strong', 'block'], default: 'default' },
        { prop: 'size', type: 'select', options: ['large', 'medium'], default: 'large' },
        { prop: 'radius', type: 'select', options: ['default', 'rounded'], default: 'default' },
        { prop: 'state', type: 'select', options: ['enabled', 'hovered', 'focused', 'disabled', 'error', 'success'], default: 'enabled' },
      ],
      attrs: 'placeholder="Email"',
      render: (v) => boxed(280, <TextField variant={v.variant as TextFieldVariant} size={v.size as TextFieldSize} radius={v.radius as TextFieldRadius} state={v.state as TextFieldState} placeholder="Email" defaultValue="Value" />),
    },
  },
  {
    id: 'textarea', name: 'TextArea', figmaNode: '42568-6551',
    description: 'Multi-line text input. Size × State (Enabled/Hovered/Focused/Disabled/Error).',
    playground: {
      controls: [
        { prop: 'size', type: 'select', options: ['large', 'medium'], default: 'large' },
        { prop: 'state', type: 'select', options: ['enabled', 'hovered', 'focused', 'disabled', 'error'], default: 'enabled' },
      ],
      attrs: 'placeholder="Notes"',
      render: (v) => boxed(280, <TextArea size={v.size as TextAreaSize} state={v.state as TextAreaState} placeholder="Notes" defaultValue="Value" />),
    },
  },
  {
    id: 'select', name: 'Select', figmaNode: '6570-41424',
    description: 'Select trigger: value/placeholder + chevron. Size × State × Active, with optional chip / flag. Radius is theme-driven (--global-select-*-border-radius).',
    playground: {
      controls: [
        { prop: 'size', type: 'select', options: ['large', 'medium'], default: 'large' },
        { prop: 'state', type: 'select', options: ['enabled', 'hovered', 'focused', 'disabled', 'error'], default: 'enabled' },
        { prop: 'active', type: 'toggle', default: false },
        { prop: 'placeholder', type: 'toggle', default: false },
        { prop: 'showChip', type: 'toggle', default: false },
        { prop: 'showFlag', type: 'toggle', default: false },
      ],
      code: (v) => {
        const p: string[] = [];
        if (v.size !== 'large') p.push(`size="${v.size}"`);
        if (v.state !== 'enabled') p.push(`state="${v.state}"`);
        if (v.active) p.push('active');
        if (v.showChip) p.push('showChip');
        if (v.showFlag) p.push('showFlag');
        p.push(v.placeholder ? 'placeholder="Country"' : 'value="United Kingdom"');
        return `import { Select } from './components/Select';\n\n<Select ${p.join(' ')} />`;
      },
      render: (v) => boxed(280, <Select
        size={v.size as SelectSize}
        state={v.state as SelectState}
        active={!!v.active}
        showChip={!!v.showChip}
        showFlag={!!v.showFlag}
        value={v.placeholder ? undefined : 'United Kingdom'}
        placeholder="Country"
      />),
    },
  },
  {
    id: 'inputstepper', name: 'InputStepper', figmaNode: '31576-35621',
    description: 'Quantity control (− value +). Minus disables at min, plus at max.',
    playground: {
      controls: [
        { prop: 'size', type: 'select', options: ['large', 'medium'], default: 'large' },
        { prop: 'disabled', type: 'toggle', default: false },
      ],
      attrs: 'defaultValue={3} min={0} max={10}',
      render: (v) => <InputStepper size={v.size as InputStepperSize} disabled={!!v.disabled} defaultValue={3} min={0} max={10} />,
    },
  },
  {
    id: 'tabs', name: 'Tabs', figmaNode: '37288-120972',
    description: 'Connected "folder" tabs on a track; the active tab lifts with a highlight bar. Distinct from AppBarNav.',
    playground: {
      controls: [
        { prop: 'active', type: 'select', options: ['0', '1', '2'], default: '0' },
      ],
      code: (v) => `import { Tabs } from './components/Tabs';\n\n<Tabs tabs={['Details', 'Delivery', 'Payment']} defaultValue={${v.active}} />`,
      render: (v) => full(<div style={{ paddingTop: 8 }}><Tabs tabs={['Details', 'Delivery', 'Payment']} defaultValue={Number(v.active)} /></div>),
    },
  },
  {
    id: 'badge', name: 'Badge', figmaNode: '9121-76379',
    description: 'Variant (number · icon · dot) × Colour × Size. Pass children to overlay it on an icon (Badge+Instance).',
    playground: {
      controls: [
        { prop: 'variant', type: 'select', options: ['default', 'icon', 'dot'], default: 'default' },
        { prop: 'color', type: 'select', options: ['primary', 'secondary', 'notification', 'action', 'unstyled'], default: 'notification' },
        { prop: 'size', type: 'select', options: ['medium', 'large'], default: 'large' },
      ],
      code: (v) => {
        const base = `import { Badge } from './components/Badge';\n\n`;
        if (v.variant === 'icon') return base + `<Badge variant="icon" color="${v.color}" size="${v.size}" icon={<Icon name="check" />} />`;
        if (v.variant === 'dot') return base + `<Badge variant="dot" color="${v.color}" />`;
        return base + `<Badge color="${v.color}" size="${v.size}" content={2} />`;
      },
      render: (v) => {
        const color = v.color as BadgeColor;
        const size = v.size as 'medium' | 'large';
        if (v.variant === 'icon') return <Badge variant="icon" color={color} size={size} icon={<Icon name="check" category="ui" size={12} />} />;
        if (v.variant === 'dot') return <Badge variant="dot" color={color} />;
        return <Badge variant="default" color={color} size={size} content={2} />;
      },
    },
  },
  {
    id: 'alert', name: 'Alert', figmaNode: '9951-66221',
    description: 'Tinted banner with a left accent border. Style = Error / Warning / Info / Success.',
    playground: {
      controls: [
        { prop: 'style', type: 'select', options: ['error', 'warning', 'info', 'success'], default: 'error' },
      ],
      code: (v) => `import { Alert } from './components/Alert';\n\n<Alert style="${v.style}" title="Title" onClose={() => {}}>Body text.</Alert>`,
      render: (v) => boxed(440, <Alert style={v.style as AlertStyle} title="Title" onClose={() => {}}>Body text for the {String(v.style)} alert.</Alert>),
    },
  },
  {
    id: 'alertsignal', name: 'AlertSignal', figmaNode: '43422-1103',
    description: 'Softer "signal" banner (top/bottom dividers) with title, body and an inline link.',
    playground: {
      controls: [
        { prop: 'color', type: 'select', options: ['warning', 'info'], default: 'warning' },
      ],
      code: (v) => `import { AlertSignal } from './components/AlertSignal';\n\n<AlertSignal color="${v.color}" title="Title" link={{ label: 'Link' }}>Body text.</AlertSignal>`,
      render: (v) => boxed(440, <AlertSignal color={v.color as AlertSignalColor} title="Title" link={{ label: 'Link' }}>Body text for the {String(v.color)} signal.</AlertSignal>),
    },
  },
  {
    id: 'tab', name: 'Tab', figmaNode: '9065-68654',
    description: 'Variant (Nav · Global Bar · Default) × State × Sale/Clearance/Extra Gutter/Position + active indicators.',
    playground: {
      controls: [
        { prop: 'variant', type: 'select', options: ['nav', 'global-bar', 'default'], default: 'nav' },
        { prop: 'state', type: 'select', options: ['enabled', 'hovered', 'focused', 'active', 'disabled'], default: 'enabled' },
        { prop: 'tone', type: 'select', options: ['default', 'sale', 'clearance'], default: 'default' },
        { prop: 'indicator', type: 'select', options: ['none', 'bar', 'round', 'arrow'], default: 'none' },
        { prop: 'position', type: 'select', options: ['left', 'inner', 'right'], default: 'inner' },
        { prop: 'extraGutter', type: 'toggle', default: false },
      ],
      childText: 'Tab',
      render: (v) => (
        <Tab
          variant={v.variant as TabVariant}
          state={v.state as TabState}
          tone={v.tone as TabTone}
          indicator={v.indicator as TabIndicator}
          position={v.position as TabPosition}
          extraGutter={!!v.extraGutter}
        >
          Tab
        </Tab>
      ),
    },
  },
  {
    id: 'link', name: 'Link', figmaNode: '8974-62509',
    description: 'Themed anchor (Color=Inherit). Used in the global bar (Body 4, underline always).',
    playground: {
      controls: [
        { prop: 'underline', type: 'select', options: ['always', 'hover', 'none'], default: 'always' },
        { prop: 'textStyle', type: 'select', options: ['body-1', 'body-2', 'body-3', 'body-4'], default: 'body-4' },
        { prop: 'disabled', type: 'toggle', default: false },
      ],
      childText: 'Link',
      render: (v) => <Link underline={v.underline as 'always' | 'hover' | 'none'} textStyle={v.textStyle as LinkTextStyle} disabled={!!v.disabled}>Link</Link>,
    },
  },
  {
    id: 'divider', name: 'Divider', figmaNode: '8899-60539',
    description: 'A thin themed line grouping content, horizontal or vertical.',
    playground: {
      controls: [{ prop: 'orientation', type: 'select', options: ['horizontal', 'vertical'], default: 'horizontal' }],
      render: (v) =>
        v.orientation === 'vertical'
          ? <div style={{ height: 40, display: 'flex' }}><Divider orientation="vertical" /></div>
          : boxed(220, <Divider />),
    },
  },
  {
    id: 'logotype', name: 'Logotype', figmaNode: '8989-65272',
    description: 'Brand wordmark from the logotype set; follows the active client.',
    playground: {
      controls: [],
      render: () => <Logotype height={24} />,
    },
  },
];

/** Component families — used to group the browser into sections. */
export const CATEGORY_ORDER = ['Actions', 'Inputs', 'Navigation', 'Feedback', 'Foundations'] as const;
const CATEGORY_MAP: Record<string, (typeof CATEGORY_ORDER)[number]> = {
  button: 'Actions', iconbutton: 'Actions',
  checkbox: 'Inputs', radio: 'Inputs', textfield: 'Inputs', textarea: 'Inputs', select: 'Inputs', inputstepper: 'Inputs',
  header: 'Navigation', appbarbrand: 'Navigation', appbarglobal: 'Navigation', appbarnav: 'Navigation', appbarbacktonext: 'Navigation', tabs: 'Navigation', tab: 'Navigation',
  badge: 'Feedback', alert: 'Feedback', alertsignal: 'Feedback',
  icon: 'Foundations', link: 'Foundations', divider: 'Foundations', logotype: 'Foundations',
};
export const categoryOf = (id: string): string => CATEGORY_MAP[id] ?? 'Foundations';
