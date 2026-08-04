# Checkout components

Reusable UI that this prototype needs but the Fabric design system doesn't have
yet. A staging area between "written inline on one screen" and "a real design
system component with a Figma node".

```
src/components/            Fabric — Figma-backed, shared by every project
src/projects/checkout/
  components/              ← here: checkout-owned, promotable
  ui/                      screens, and one-offs that only ever appear once
```

## Why a folder and not just more `ui/parts.tsx`

`parts.tsx` is fine for a helper used twice on one screen. It's the wrong home for
anything that defines how the product looks in more than one place, because a
grab-bag file gives you nothing to point at in review and no obvious place for a
second implementation NOT to appear. The title bar drifted into two different
versions inside a day of being a helper.

## Rules — these are what make promotion cheap

1. **One folder per component**, `Name.tsx` + `Name.css` + `index.ts`. Same shape
   as `src/components/*`, so promoting is a move rather than a rewrite.
2. **Props in, nothing else.** A component here must not import the runtime,
   `checkoutConfig`, flows, or flags. If it needs to know something, it takes a
   prop. This is the rule that actually decides whether promotion is a five-minute
   job or a refactor — file location is trivial to change, coupling isn't.
3. **Export `NameProps`** and give every prop a purpose, not a pass-through.
4. **Class prefix `co-`.** Fabric uses `fab-`. The prefix is the tier marker: when
   a component is promoted, the rename to `fab-` is the signal that its styling
   is now everyone's problem, not just checkout's.
5. **Theme tokens only** — `--global-*`, `--components-*`, `--text-*`. No literal
   colours or type sizes. A promoted component has to re-theme for ten brands on
   day one, and retrofitting that is the expensive part.
6. **Document the Figma intent** in the doc comment: is this a candidate for the
   design system, or deliberately checkout-only?

## Promoting one to Fabric / Figma

When the shape has settled and another project wants it:

1. `git mv` the folder to `src/components/`.
2. Rename `co-*` classes to `fab-*`.
3. Build the Figma component, then add the node id to
   `src/components/codeConnect.ts`.
4. Add a registry entry in `src/app/components-view/registry.tsx` so it appears in
   the Components browser with a playground.

Because of rule 2 the component has no checkout imports to unpick, so steps 1–2
are mechanical.
