/**
 * Client (brand) registry.
 *
 * Each client maps to a `.vars.css` token file in /theming and a matching icon
 * brand folder in /iconography. Adding a client is a matter of dropping in the
 * token file + icon set and adding one entry here — nothing else in the app
 * hard-codes a brand.
 *
 * `id`        stable key used across state and the `data-client` theme selector.
 * `themeFile` basename (without extension) of the file in /theming.
 * `iconBrand` folder name under /iconography/{feature,user-interface}.
 * `logo`      basename (without extension) under /iconography/logotype.
 */
export interface ClientDef {
  id: string;
  name: string;
  themeFile: string;
  iconBrand: string;
  logo: string;
  /** Real domain shown in the device browser address bar. */
  domain: string;
}

export const CLIENTS: ClientDef[] = [
  { id: 'next', name: 'NEXT', themeFile: 'Next', iconBrand: 'next', logo: 'next-default', domain: 'next.co.uk' },
  { id: 'reiss', name: 'Reiss', themeFile: 'Reiss', iconBrand: 'reiss', logo: 'reiss-default', domain: 'reiss.com' },
  { id: 'gap', name: 'Gap', themeFile: 'Gap', iconBrand: 'gap', logo: 'gap-default', domain: 'gap.com' },
  { id: 'made', name: 'MADE', themeFile: 'Made', iconBrand: 'made', logo: 'made-default', domain: 'made.com' },
  { id: 'fatface', name: 'FatFace', themeFile: 'FatFace', iconBrand: 'fatface', logo: 'fatface-default', domain: 'fatface.com' },
  { id: 'jojomamanbebe', name: 'JoJo Maman Bébé', themeFile: 'JoJoMamanBebe', iconBrand: 'jojomamanbebe', logo: 'jojomamanbebe-default', domain: 'jojomamanbebe.com' },
  { id: 'victoriassecret', name: "Victoria's Secret", themeFile: 'VictoriasSecret', iconBrand: 'victoriassecret', logo: 'victoriassecret-default', domain: 'victoriassecret.com' },
  { id: 'bathandbodyworks', name: 'Bath & Body Works', themeFile: 'BathAndBodyWorks', iconBrand: 'bathandbodyworks', logo: 'bathandbodyworks-narrow', domain: 'bathandbodyworks.com' },
  { id: 'joules', name: 'Joules', themeFile: 'Joules', iconBrand: 'joules', logo: 'joules-default', domain: 'joules.com' },
  { id: 'logo', name: 'Generic (Logo)', themeFile: 'Logo', iconBrand: 'logo', logo: 'logo-default', domain: 'shop.example.com' },
];

export const DEFAULT_CLIENT_ID = 'next';

export const clientById = (id: string): ClientDef =>
  CLIENTS.find((c) => c.id === id) ?? CLIENTS[0];
