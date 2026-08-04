import { CLIENTS } from '../config/clients';

/**
 * Theme loader.
 *
 * Each client ships a `.vars.css` file that declares its design tokens under a
 * `:root` selector. To let every theme coexist (so switching is an instant
 * attribute flip with no network fetch or flash), we import each file as raw
 * text, rewrite its `:root` selector to `[data-client="<id>"]`, and inject the
 * combined stylesheet once. The active theme is chosen by setting
 * `data-client` on the checkout preview root — see applyClientAttr().
 *
 * Fonts are imported globally (side-effect CSS imports) so every @font-face is
 * available regardless of the active theme.
 */

// Raw token files, keyed by absolute-ish glob path.
const themeFiles = import.meta.glob('../../theming/*.vars.css', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

// Side-effect imports: register every brand's @font-face declarations.
import.meta.glob('../../fonts/**/*.css', { eager: true });

const basenameToClientId = new Map(CLIENTS.map((c) => [c.themeFile, c.id]));

function scopeThemeCss(css: string, clientId: string): string {
  // Replace the leading :root selector with a client-scoped one. The token
  // files contain a single :root block, but replaceAll keeps us safe if that
  // ever changes.
  return css.replaceAll(':root', `[data-client="${clientId}"]`);
}

let injected = false;

/** Inject all client stylesheets once, on first use. Idempotent. */
export function ensureThemesInjected(): void {
  if (injected) return;
  const chunks: string[] = [];
  for (const [path, css] of Object.entries(themeFiles)) {
    const base = path.split('/').pop()!.replace('.vars.css', '');
    const clientId = basenameToClientId.get(base);
    if (!clientId) continue; // token file with no matching client entry
    chunks.push(scopeThemeCss(css, clientId));
  }
  const style = document.createElement('style');
  style.id = 'checkout-vision-themes';
  style.textContent = chunks.join('\n');
  document.head.appendChild(style);
  injected = true;
}

/** Apply a client's theme to an element by setting the scope attribute. */
export function applyClientAttr(el: HTMLElement, clientId: string): void {
  el.setAttribute('data-client', clientId);
}
