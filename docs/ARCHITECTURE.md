# LocalWeb — Architecture

The whole app follows one rule: **one source of truth, one style pipeline,
one generator.** If you understand those three, you understand LocalWeb.

## 1. One source of truth: the BlockNode tree

A page is a tree of typed nodes (`src/types/blocks.ts`):

```
Page { tree: BlockNode[] }
BlockNode { id, type, props, styles, children? }
```

- The **Zustand store** (`src/store/editor.ts`) holds the project; every change
  goes through a store action, which is a one-liner over a **pure immutable
  helper** in `src/lib/tree.ts` (insert/remove/move/clone/walk).
- The **canvas** is just a rendering of the tree — it holds no state.
- A **project on disk** is a serialization of the tree: `project.json`.
- Undo/redo (zundo) snapshots `project` only — never UI state.

Sections (navbar/hero/footer) live at the root; elements
(heading/text/image/button/link) sit inside them or at root.

## 2. One style pipeline: tokens → resolveStyles()

Three layers guarantee **the canvas always matches the export**:

1. **Base layer** — `src/styles/blocks.css`: class-based defaults (`lw-*`)
   and *all* responsive rules (one hidden 768px breakpoint). Imported by the
   canvas AND embedded verbatim in every export.
2. **Token layer** — `src/styles/tokens.ts`: the preset scales (spacing,
   sizes, radius, fonts). The UI offers nothing else (locked product
   decision: no custom CSS, no free-form numbers in v1).
3. **Override layer** — `src/lib/resolveStyles.ts`: one function maps a
   block's user styles to CSS properties. Unset keys are *omitted*, so
   blocks fall back to the base layer ("reset to default" = delete the key).
   It also emits `--lw-text-color` / `--lw-font-family` so a section's
   text color and font cascade into its content.

The canvas consumes it via `useBlockStyles()` (with asset-protocol URLs);
the generator consumes the same function with relative paths.

## 3. One generator: preview = export

`src/export/` turns the tree into HTML/CSS/JS strings:

- **html.ts** — semantic markup mirroring the canvas components exactly,
  each block root carrying `lw-*` + its unique `b-<id>` hook; Google-font
  `<link>`s only for fonts actually used.
- **css.ts** — blocks.css (embedded via a Vite `?raw` import) plus
  `.b-<id> { … }` override rules serialized from `resolveStyles()`.
- **js.ts** — ~30 lines of vanilla JS: mobile nav toggle + smooth anchors.
- **generator.ts** — the single `generateSite(project, { resolveAsset })` API.
  Preview passes the asset-protocol converter; export passes identity.
  Because both render the same strings, *if the preview looks right, the
  export is right*.

## Storage format

```
MyWebsite/
├─ project.json        ← the whole project (tree + assets list)
├─ project.backup.json ← rotated on every save (crash safety)
└─ assets/             ← imported images; props reference them
                         relatively ("assets/foo.png") — always
```

Projects are versioned (`version` field). `src/lib/migrate.ts` upgrades old
files — breaking changes to the schema are never shipped without a hop.

## Editing UX notes worth knowing

- **Inline editing** (`EditableText`) follows four contentEditable rules —
  the big one: never write state into a focused element (it resets the
  caret); commit on blur/Enter, so one edit = one undo step.
- **Drag & drop** (dnd-kit): one resolver (`resolveTarget` in
  `canvas/dnd.tsx`) enforces the locked drop rules — sections → root only;
  elements → root or hero/footer.
- **Selection clarity**: the floating toolbar shows the block type, and the
  inspector offers "select the parent section" when you're inside one.

## Where the plan lives

The five phase documents in [`docs/plan/`](plan/) are the project's build
history — written before each phase, executed task by task, and kept as
contributor onboarding material.
