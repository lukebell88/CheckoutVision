import { useState } from 'react';
import { CLIENTS } from '../../config/clients';
import { ensureThemesInjected } from '../../theme/themes';
import { Button, type ButtonVariant, type ButtonColor, type ButtonSize } from '../Button';
import {
  IconButton,
  type IconButtonVariant,
  type IconButtonColor,
  type IconButtonSize,
} from '../IconButton';
import { Icon, IconProvider } from '../Icon';
import { Check, Checkbox } from '../Checkbox';
import { Radio, RadioButton } from '../Radio';
import { Header, type HeaderVariant } from '../Header';
import { clientById } from '../../config/clients';
import './component-preview.css';

/**
 * Dev-only component playground (open with `?preview=1`). Renders each built
 * component's variant matrix inside a themed context so it can be checked
 * against the Figma source across clients.
 */
ensureThemesInjected();

const BTN_VARIANTS: ButtonVariant[] = ['contained', 'outlined', 'unstyled'];
const BTN_COLORS: ButtonColor[] = ['primary', 'secondary'];
const BTN_SIZES: ButtonSize[] = ['large', 'medium', 'small'];

const HEADER_VARIANTS: HeaderVariant[] = ['standard', 'club22', 'club25', 'cutaway22', 'tab22', 'wing25'];

const IB_SIZES: IconButtonSize[] = ['large', 'medium'];
const IB_COMBOS: Array<{ variant: IconButtonVariant; color: IconButtonColor }> = [
  { variant: 'contained', color: 'primary' },
  { variant: 'contained', color: 'secondary' },
  { variant: 'outlined', color: 'primary' },
  { variant: 'outlined', color: 'secondary' },
  { variant: 'outlined', color: 'action' },
  { variant: 'unstyled', color: 'action' },
];

const HeartIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 1 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" />
  </svg>
);

export function ComponentPreview() {
  const [clientId, setClientId] = useState('logo');

  return (
    <div className="cp">
      <header className="cp__bar">
        <strong>Component preview</strong>
        <span className="cp__dim">Fabric v2 · components-fabric-v2b</span>
        <label className="cp__client">
          Client
          <select value={clientId} onChange={(e) => setClientId(e.target.value)}>
            {CLIENTS.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </label>
      </header>

      <IconProvider value={clientById(clientId).iconBrand}>
      <div className="cp__stage" data-client={clientId}>
        <h2 className="cp__title">Header — node 9197-74651</h2>
        {HEADER_VARIANTS.map((v) => (
          <section className="cp__section" key={v}>
            <h3 className="cp__h">{v} · Default</h3>
            <div className="cp__header-frame">
              <Header variant={v} brand={clientId} bagCount={2} />
            </div>
            <h3 className="cp__h">{v} · Secure</h3>
            <div className="cp__header-frame">
              <Header variant={v} type="secure" brand={clientId} bagCount={2} />
            </div>
          </section>
        ))}

        <h2 className="cp__title">Icons from the folder (in Button &amp; IconButton)</h2>
        <div className="cp__row">
          <span className="cp__tag">Buttons</span>
          <div className="cp__cell">
            <Button variant="contained" color="primary" startIcon={<Icon name="bag" size={18} />}>Add to bag</Button>
            <Button variant="outlined" color="secondary" startIcon={<Icon name="delivery" size={18} />}>Delivery</Button>
            <Button variant="contained" color="secondary" endIcon={<Icon name="chevron-right" category="ui" size={18} />}>Continue</Button>
          </div>
        </div>
        <div className="cp__row">
          <span className="cp__tag">IconButtons</span>
          <div className="cp__cell">
            <IconButton variant="contained" color="primary" aria-label="Bag"><Icon name="bag" /></IconButton>
            <IconButton variant="outlined" color="action" aria-label="Favourite"><Icon name="favourite" /></IconButton>
            <IconButton variant="outlined" color="action" aria-label="Search"><Icon name="search" /></IconButton>
            <IconButton variant="unstyled" color="action" aria-label="Close"><Icon name="cross" category="ui" /></IconButton>
            <IconButton variant="outlined" color="action" aria-label="Edit"><Icon name="edit" /></IconButton>
          </div>
        </div>

        <h2 className="cp__title">Check — node 26119-7772</h2>
        <div className="cp__row">
          <span className="cp__tag">unselected</span>
          <div className="cp__cell"><Check /><Check hovered /><Check focused /><Check disabled /></div>
        </div>
        <div className="cp__row">
          <span className="cp__tag">checked</span>
          <div className="cp__cell"><Check checked /><Check checked hovered /><Check checked focused /><Check checked disabled /></div>
        </div>
        <div className="cp__row">
          <span className="cp__tag">indeterminate</span>
          <div className="cp__cell"><Check indeterminate /><Check indeterminate hovered /><Check indeterminate focused /><Check indeterminate disabled /></div>
        </div>

        <h2 className="cp__title">Checkbox — node 19784-119461</h2>
        <div className="cp__row">
          <span className="cp__tag">interactive</span>
          <div className="cp__cell" style={{ gap: 24 }}>
            <Checkbox label="Label" count="(123)" />
            <Checkbox label="Label" count="(123)" defaultChecked />
            <Checkbox label="Label" count="(123)" indeterminate />
            <Checkbox label="Label" count="(123)" defaultChecked disabled />
          </div>
        </div>

        <h2 className="cp__title">Radio — node 26119-7819</h2>
        <div className="cp__row">
          <span className="cp__tag">unselected</span>
          <div className="cp__cell"><Radio /><Radio hovered /><Radio focused /><Radio disabled /></div>
        </div>
        <div className="cp__row">
          <span className="cp__tag">selected</span>
          <div className="cp__cell"><Radio checked /><Radio checked hovered /><Radio checked focused /><Radio checked disabled /></div>
        </div>

        <h2 className="cp__title">RadioButton — node 9064-68701</h2>
        <div className="cp__row">
          <span className="cp__tag">interactive</span>
          <div className="cp__cell" style={{ gap: 24 }}>
            <RadioButton name="cp-radio" label="Option one" defaultChecked />
            <RadioButton name="cp-radio" label="Option two" />
            <RadioButton name="cp-radio" label="Option three" />
            <RadioButton name="cp-radio2" label="Disabled" disabled defaultChecked />
          </div>
        </div>

        <h2 className="cp__title">Button — node 6543-36744</h2>
        {BTN_VARIANTS.map((variant) => (
          <section className="cp__section" key={variant}>
            <h3 className="cp__h">{variant}</h3>
            {BTN_COLORS.map((color) => (
              <div className="cp__row" key={color}>
                <span className="cp__tag">{color}</span>
                {BTN_SIZES.map((size) => (
                  <div className="cp__cell" key={size}>
                    <Button variant={variant} color={color} size={size}>Label</Button>
                    <Button variant={variant} color={color} size={size} disabled>Label</Button>
                    <Button variant={variant} color={color} size={size} loading>Label</Button>
                  </div>
                ))}
              </div>
            ))}
          </section>
        ))}

        <h2 className="cp__title">IconButton — node 9028-69880</h2>
        {IB_COMBOS.map(({ variant, color }) => (
          <div className="cp__row" key={`${variant}-${color}`}>
            <span className="cp__tag">{variant} · {color}</span>
            {IB_SIZES.map((size) => (
              <div className="cp__cell" key={size}>
                <IconButton variant={variant} color={color} size={size} aria-label="Favourite"><HeartIcon /></IconButton>
                <IconButton variant={variant} color={color} size={size} disabled aria-label="Favourite"><HeartIcon /></IconButton>
                <IconButton variant={variant} color={color} size={size} loading aria-label="Loading"><HeartIcon /></IconButton>
              </div>
            ))}
          </div>
        ))}
      </div>
      </IconProvider>
    </div>
  );
}
