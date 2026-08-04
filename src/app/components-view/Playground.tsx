import { useState, type ReactNode } from 'react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import Switch from '@mui/material/Switch';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';

import { useStore, selectHeaderConfig } from '../../studio/store';
import { clientById } from '../../config/clients';
import { IcCopy, IcCheck } from '../shell/icons';
import type { PlaygroundSpec, PlayControl, PlayValue } from './registry';

const KEYWORDS = new Set(['import', 'from']);
const CONSTS = new Set(['true', 'false', 'null', 'undefined']);
const IDENT = /[A-Za-z0-9_$-]/;

/** Tiny JSX/TS tokenizer → coloured spans (VS Code "Dark+" palette via CSS). */
function highlightCode(src: string): ReactNode[] {
  const out: ReactNode[] = [];
  let i = 0, key = 0, inTag = false;
  const n = src.length;
  const push = (text: string, cls?: string) =>
    out.push(cls ? <span key={key++} className={`tok-${cls}`}>{text}</span> : <span key={key++}>{text}</span>);

  while (i < n) {
    const ch = src[i];
    if (/\s/.test(ch)) { let j = i; while (j < n && /\s/.test(src[j])) j++; push(src.slice(i, j)); i = j; continue; }
    if (ch === '"' || ch === "'") { let j = i + 1; while (j < n && src[j] !== ch) { if (src[j] === '\\') j++; j++; } j = Math.min(j + 1, n); push(src.slice(i, j), 'str'); i = j; continue; }
    if (ch === '<') {
      if (src[i + 1] === '/') { push('</', 'punc'); i += 2; } else { push('<', 'punc'); i += 1; }
      let j = i; while (j < n && IDENT.test(src[j])) j++;
      if (j > i) { push(src.slice(i, j), 'tag'); i = j; }
      inTag = true; continue;
    }
    if (ch === '=' && src[i + 1] === '>') { push('=>', 'punc'); i += 2; continue; }
    if (ch === '/' && src[i + 1] === '>') { push('/>', 'punc'); i += 2; inTag = false; continue; }
    if (ch === '>') { push('>', 'punc'); i += 1; inTag = false; continue; }
    if (/[0-9]/.test(ch)) { let j = i; while (j < n && /[0-9.]/.test(src[j])) j++; push(src.slice(i, j), 'num'); i = j; continue; }
    if (/[A-Za-z_$]/.test(ch)) {
      let j = i; while (j < n && IDENT.test(src[j])) j++;
      const w = src.slice(i, j);
      const cls = KEYWORDS.has(w) ? 'kw' : CONSTS.has(w) ? 'const' : /^[A-Z]/.test(w) ? 'tag' : inTag ? 'attr' : undefined;
      push(w, cls); i = j; continue;
    }
    push(src[i], 'punc'); i += 1;
  }
  return out;
}

/** Build a copy-paste snippet from the current control values. */
function genCode(name: string, spec: PlaygroundSpec, v: Record<string, PlayValue>): string {
  if (spec.code) return spec.code(v);
  const dyn = spec.controls
    .map((c) => {
      const val = v[c.prop];
      if (val === c.default) return ''; // omit defaults for a clean snippet
      if (c.type === 'toggle') return val ? c.prop : `${c.prop}={false}`;
      return `${c.prop}="${val}"`;
    })
    .filter(Boolean);
  const attrs = [spec.attrs, ...dyn].filter(Boolean).join(' ');
  const open = `<${name}${attrs ? ' ' + attrs : ''}`;
  const body = spec.childText != null ? `${open}>${spec.childText}</${name}>` : `${open} />`;
  const imports = `import { ${name} } from './components/${name}';${spec.importExtra ? '\n' + spec.importExtra : ''}`;
  return `${imports}\n\n${body}`;
}

/**
 * Closed-state marker: the option showing is the active brand's configured one.
 * The dropdown carries the full "Reiss" chip; collapsed there's only ~130px, so
 * this is a dot with the same meaning in its tooltip.
 */
function BrandDot({ title }: { title: string }) {
  return (
    <Tooltip title={title} placement="top">
      <Box
        component="span"
        sx={{
          width: 6,
          height: 6,
          flex: 'none',
          borderRadius: '50%',
          bgcolor: 'success.main',
        }}
      />
    </Tooltip>
  );
}

/**
 * Live prop playground — toggle a component's variant props, see it update, and
 * copy the matching code for the current configuration.
 *
 * Controls that declare a `configField` also show which option the ACTIVE client
 * is configured to use, so "what does Reiss actually ship?" is answerable without
 * leaving the component. Selecting is still free — the marker says what the brand
 * is set to, it doesn't constrain what you can preview.
 */
export function Playground({ spec, name }: { spec: PlaygroundSpec; name: string }) {
  const [values, setValues] = useState<Record<string, PlayValue>>(() =>
    Object.fromEntries(spec.controls.map((c) => [c.prop, c.default])),
  );
  const set = (prop: string, val: PlayValue) => setValues((v) => ({ ...v, [prop]: val }));

  // The live board values, not the static table, so edits on the Configuration
  // board show up here immediately. Header is the only slice today — see the note
  // in ConfigBoard.tsx about what a second configurable component needs.
  const clientId = useStore((s) => s.clientId);
  const headerConfig = useStore(selectHeaderConfig);
  const clientName = clientById(clientId).name;

  /** What the active client is configured to use for this control, if anything. */
  const configuredValue = (c: PlayControl): PlayValue | null => {
    if (!c.configField) return null;
    const raw = headerConfig[c.configField];
    if (raw === undefined) return null;
    return c.fromConfig ? c.fromConfig(raw) : (raw as PlayValue);
  };

  const code = genCode(name, spec, values);
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard blocked */
    }
  };

  return (
    <Box className="ds-play">
      {spec.controls.length > 0 && (
        <Stack
          sx={{
            flex: 'none',
            width: 260,
            gap: 0.5,
            p: 1,
            borderRadius: 1.5,
            border: (t) => `1px solid ${t.vars.palette.divider}`,
          }}
        >
          {spec.controls.map((c) => {
            const configured = configuredValue(c);
            return (
              <Stack
                key={c.prop}
                component="label"
                direction="row"
                sx={{ alignItems: 'center', justifyContent: 'space-between', gap: 1.5, px: 1, py: 0.5 }}
              >
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {c.prop}
                </Typography>
                {c.type === 'select' ? (
                  <Select
                    size="small"
                    value={values[c.prop] as string}
                    onChange={(e) => set(c.prop, e.target.value)}
                    sx={{ width: 132 }}
                    renderValue={(v) => (
                      <Stack direction="row" sx={{ alignItems: 'center', gap: 0.75, minWidth: 0 }}>
                        {configured === v && <BrandDot title={`${clientName}'s setting`} />}
                        <Box component="span" sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {v}
                        </Box>
                      </Stack>
                    )}
                  >
                    {c.options!.map((o) => (
                      <MenuItem key={o} value={o} sx={{ gap: 1 }}>
                        <Box component="span" sx={{ flex: 1, minWidth: 0 }}>
                          {o}
                        </Box>
                        {configured === o && (
                          <Chip
                            size="small"
                            variant="soft"
                            color="success"
                            label={clientName}
                            sx={{ height: 20, fontSize: 11, pointerEvents: 'none' }}
                          />
                        )}
                      </MenuItem>
                    ))}
                  </Select>
                ) : (
                  <Switch
                    size="small"
                    checked={!!values[c.prop]}
                    onChange={(e) => set(c.prop, e.target.checked)}
                  />
                )}
              </Stack>
            );
          })}
        </Stack>
      )}

      {/* The stage renders REAL Fabric components. It keeps its own CSS and its
          light dot-grid canvas deliberately: specimens must show brand tokens,
          not the studio's theme — the same boundary the checkout previews sit
          behind. Nothing MUI belongs inside here. */}
      <div className="ds-play__stage">{spec.render(values)}</div>

      <Box
        sx={{
          flexBasis: '100%',
          borderRadius: 1.5,
          overflow: 'hidden',
          bgcolor: 'var(--ds-ink)',
          border: (t) => `1px solid ${t.vars.palette.divider}`,
        }}
      >
        <Stack
          direction="row"
          sx={{
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 1.5,
            py: 0.75,
            borderBottom: '1px solid var(--ds-ink-line)',
          }}
        >
          <Typography variant="overline" sx={{ color: 'var(--ds-ink-dim)' }}>
            Code
          </Typography>
          <Button
            size="small"
            onClick={copy}
            startIcon={copied ? <IcCheck size={15} /> : <IcCopy size={15} />}
            sx={{ color: 'var(--ds-ink-text)', '&:hover': { bgcolor: 'rgba(255,255,255,0.08)' } }}
          >
            {copied ? 'Copied' : 'Copy'}
          </Button>
        </Stack>
        <Box component="pre" className="ds-play__code-body">
          <code>{highlightCode(code)}</code>
        </Box>
      </Box>
    </Box>
  );
}
