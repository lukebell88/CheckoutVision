# CheckoutVision

A **prototype studio** (React + TS + Vite + Zustand) that hosts many prototypes. Checkout is
the first one. Brands are CSS-variable themes under `theming/`, shared by every project.

## Architecture

Three layers, and arrows only point up:

```
src/config, src/components   platform — brands, devices, Fabric components, design-system config
src/studio, src/app          studio  — the contract, the store, the shell
src/projects/<id>            projects — one prototype each
```

The studio never imports a project: it works from `ProjectDef` (`src/studio/project.ts`)
alone, and `src/studio/registry.ts` is the single place a project is named. If the shell
needs to know something about what it's rendering, **add a field to `ProjectDef`** — reaching
sideways into a project is the one thing that breaks this.

- `src/studio/project.ts` — the contract: screens, flows, flags, variants, `ProjectRuntime`.
- `src/studio/runtime.tsx` — `ProjectProvider` (which project) and `RuntimeProvider` (the
  flags/data/nav for one rendered instance). `RenderedProject` is the only render path.
- `src/studio/useRuntime.ts` — builds a runtime from the store, or from a Pages variant.
- `src/studio/store.ts` — studio prefs are global; project state is namespaced under
  `byProject[id]`, so projects never inherit each other's state.

A project supplies screens/flows/flags/variants and a `render()`; the studio hands it a
runtime. Projects read that runtime, never the store — see
`src/projects/checkout/checkoutConfig.ts` for the one place checkout narrows the studio's
generic flags/data back to its own types.

### Adding a project

A project folder needs two files:

- `project.tsx` — **default export** of a `ProjectDef`. Loaded lazily.
- `meta.ts` — **default export** of a `ProjectMeta` (`id`, `name`, `description`). Loaded
  eagerly, and it's what the gallery lists. Keep it tiny; anything expensive belongs in
  `project.tsx`. `project.tsx` spreads its own meta so the name lives in one place.

The registry globs the folders and the folder name is the project id — nothing to register.

Projects load lazily, so a project isn't available synchronously. The shell gates on
`useActiveProject()`; everything below that gate can assume the definition and its state both
exist. Synchronous callers outside React (the keyboard layer, store actions) use
`loadedProject(id)` and no-op if it's absent. Things that render ABOVE the gate — the gallery
and the ⌘K palette — use `useProjectOptional()`.

### Switching project

- The **gallery** (rail logo → `view: 'projects'`) is the studio home: a card per project, from
  `meta.ts` alone. Choosing one sets the project and drops into its Prototype view.
- **⌘K** has a `Project` section, and works in the gallery with no project loaded.
- **`?project=<id>`** works on both the studio and live links. On a live link an unknown id is
  an explicit error, never a silent fallback — a stale tester link must not show the wrong
  prototype. On the studio it's simply ignored.

There is no duplicate/rename yet. When it comes, it goes in the gallery: `flows`/`flags`/
`variants` are already pure data, so a project splits cleanly into template (code: `screens`,
`render`) and instance (data), and instances can be cloned without touching code.

## Payload

Everything brand-specific is loaded on demand; this is the difference between a ~200 KB and a
~1 MB first load for a tester on a phone.

- **Icons** (`src/components/Icon`) load per folder — `feature/<brand>`, `user-interface/<brand>`,
  `common/<group>` — and `vite.config.ts` `manualChunks` makes each folder exactly one request.
  `IconProvider` preloads the active brand; anything else loads on first use. Do NOT make this
  glob eager: it was ~1.4 MB (625 KB gz), two thirds of the bundle, and it shipped a 750 KB
  payment-logo set that nothing referenced.
- **Logos** (`src/theme/icons.ts`) stay eager — ~76 KB, and the brand switcher shows all at once.
- **Fonts** are already lazy at the network level: all `@font-face` rules ship in the CSS, but
  browsers only fetch the faces actually used. Nothing to do here.
- **Theme CSS** stays eager for all brands so brand switching is an instant attribute flip.
  That's a deliberate trade for the studio; it's ~14 KB gzipped.

## Studio UI — Minimal

The studio chrome runs on the **Minimal UI Kit** (MUI v7), lifted from
`Minimal_TypeScript_v7.5.0/starter-vite-ts` into four folders:

| Folder | From the starter |
|---|---|
| `src/studio-theme` | `src/theme` — palette, typography, shadows, component overrides |
| `src/studio-nav` | `components/nav-section` + an Iconify shim and a router shim |
| `src/studio-layout` | `layouts/core` + the structural parts of `layouts/dashboard` |
| `src/studio-ui` | `components/custom-popover`, `components/label` |

Rules that matter:

- **No `<CssBaseline />`.** It writes to `body` and would cascade into the checkout
  previews, which must render in brand tokens only. `src/base.css` holds the few
  resets both the studio and live mode need; `studio.css` reads Minimal's palette
  through its CSS variables (`var(--palette-background-default)`), since MUI runs in
  css-vars mode with `colorSchemeSelector: 'data-theme'`.
- **Minimal 7.5 targets React 19**, where `ref` is a plain prop. This project is on
  React 18, so lifted components that receive a ref need `forwardRef` — see
  `studio-nav/nav-section/*/nav-item.tsx`.
- **Layout comes from the starter**, not hand-rolled: `LayoutSection` +
  `MainSection` + `NavVertical`, with widths from `--layout-nav-vertical-width` /
  `--layout-nav-mini-width` and the header height from
  `--layout-header-desktop-height`.
- **Titles live in the content** (`ViewHeading`), not the header — the starter's
  convention. The header carries global chrome only.
- The `--w-*` token layer is **gone**. What little CSS remains reads Minimal's
  published variables (`--palette-*`, `--layout-*`) directly.
- Some CSS classes are built at runtime (`shell--${device.id}`,
  `frame__device--${device.id}`, `tok-${cls}`) or assembled in ternaries
  (`'studio studio--present'`). A grep-based dead-CSS sweep reports these as
  unused — they aren't. If you sweep, match whole tokens and guard the known
  dynamic ones, then check the result renders: a half-deleted rule can leave a
  dangling selector that silently swallows the *next* rule.
- Overlays that must sit above the layout need `z-index: 1300` (MUI's modal
  level) — Minimal's nav is `drawer+1` and its header `appBar+1`.

What stays bespoke and should: the device shells, frame/focus-stage geometry, and
the components preview canvas. Minimal has no equivalent, and its opinions would be
wrong there.

## Working with Figma

This prototype round-trips with the team's Fabric design system in Figma.

- **Design → code** (build a checkout component from a Figma node): follow the Figma MCP
  skills and the token mapping recorded per-component in `src/components/codeConnect.ts`.
- **Code → design** (push a checkout page into Figma at a breakpoint): use the
  **`/figma-round-trip`** skill in `.claude/skills/figma-round-trip/`. It encodes the
  destination file, the real component keys, the "Realm" brand-variable modes, and the
  must-follow build rules (single atomic `use_figma` call; verify with `get_metadata`).
  Proven so far: **Mobile Sign In**. Other pages/breakpoints follow the same recipe but
  should each be verified.

## Dev

```bash
npm run dev   # http://localhost:5180
```

Live tester link (bare prototype, real-device breakpoints):
`/?live=1&project=<id>&client=<brand>&flow=<flow>&flags=<comma,list>`.

Query params rather than path routes: the build is static with no SPA rewrite, so a path
route would 404 on exactly the direct links testers get sent.
