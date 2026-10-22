# 🎨 PHASE 3 — Blocks & Styling: The Style Engine, All 8 Blocks, the Inspector Panel

> **LocalWeb build plan · Part 3 of 5**
>
> 📍 Plan map: [Phase 1 — Foundation](PHASE-1-FOUNDATION.md) → [Phase 2 — Editor Core](PHASE-2-EDITOR-CORE.md) → **Phase 3 — Blocks & Styling** → [Phase 4 — Templates & Preview](PHASE-4-TEMPLATES-AND-PREVIEW.md) → [Phase 5 — Export & Polish](PHASE-5-EXPORT-AND-POLISH.md)

---

## 1. Phase goal

Turn the plain Phase-2 blocks into a real visual builder:

- every one of the **8 blocks looks genuinely good** with zero user styling,
- all locked **style controls** work: typography, colors, spacing (preset scale only), borders, background (solid color + image),
- the **right panel (Inspector)** is fully functional for the selected block,
- users can **upload images** into the project's `assets/` folder and place them,
- responsive behavior is **automatic** — no breakpoints anywhere in the UI (locked decision),
- canvas and future export render identically (the parity architecture below).

| | |
|---|---|
| **Estimated effort** | 2–3 weeks part-time (largest phase — follow the 4 sub-parts in order) |
| **Prerequisites** | Phase 2 Definition of Done (tree, drag-drop, inline editing, save/open) |
| **End state** | A user can style a hero — font, colors, padding, radius, background image — upload a photo, and the canvas shows a real, good-looking page |

**Work in this order:** Part A (engine) → Part B (blocks look real) → Part C (Inspector) → Part D (assets + fonts). Each part is independently testable.

---

## 2. THE core design decision: the 3-layer style architecture

Read this twice — it is the most important architecture in the project. It guarantees that **what you see in the canvas is exactly what exports**, and that **responsiveness is automatic**.

```
LAYER 1 — Base layer:  src/styles/blocks.css (static file, ships with the app)
  ├─ class-based layout + look for all 8 blocks (lw-navbar, lw-hero, lw-heading…)
  ├─ contains ALL responsive rules (one hidden system breakpoint: 768px)
  ├─ imported by the canvas  AND  copied verbatim into exported styles.css
  └─ users NEVER edit this — there is no custom CSS in v1 (locked)

LAYER 2 — Token layer:  src/styles/tokens.ts
  └─ named preset scales (spacing, font size, radius…) — the only values the UI offers
     (locked: "preset scale only" → no free-form number inputs anywhere)

LAYER 3 — Override layer:  src/lib/resolveStyles.ts
  └─ per-block user styles (BlockStyles) → resolved to CSS properties
     ├─ canvas:      <section class="lw-hero" style={resolveStyles(block)}>
     └─ export/preview (Phase 4): identical values written into .b-<id> CSS rules
     → ONE function, two consumers = guaranteed canvas/export parity
```

**Falling back is the trick:** an unset style key is simply *omitted* from resolved CSS → the block falls back to its Layer-1 class defaults. "Reset to default" = delete the key. This keeps the model tiny (no inherited style graphs) and predictable.

### Token scales (Layer 2 — lock these exact values)

**Spacing** (padding & margin):

| Token | none | xs | sm | md | lg | xl | 2xl |
|---|---|---|---|---|---|---|---|
| px | 0 | 8 | 16 | 24 | 40 | 64 | 96 |

**Font size:**

| Token | sm | base | lg | xl | 2xl |
|---|---|---|---|---|---|
| rem | 0.875 | 1 | 1.25 | 1.5 | 2.25 |

**Border radius:** none=0 · sm=4px · md=8px · lg=16px · full=9999px
**Border width:** none=0 · thin=1px · medium=2px · thick=4px
**Font weight:** 400 · 500 · 600 · 700
**Line height:** slider 1.0–2.0, step 0.05 (stored unitless)

**Font families (curated 8 — nothing else is offered):**

| Token | What it is |
|---|---|
| `system` | `system-ui, -apple-system, Segoe UI, Roboto, sans-serif` |
| `serif` | `Georgia, 'Times New Roman', serif` |
| `mono` | `ui-monospace, Consolas, monospace` |
| `inter` | Google Font — Inter (modern neutral) |
| `poppins` | Google Font — Poppins (friendly geometric) |
| `playfair` | Google Font — Playfair Display (elegant headings) |
| `merriweather` | Google Font — Merriweather (readable serif) |
| `lora` | Google Font — Lora (warm editorial) |

```ts
// src/styles/tokens.ts
export const SPACING: Record<SpacingToken, string> = { none: '0', xs: '8px', sm: '16px', md: '24px', lg: '40px', xl: '64px', '2xl': '96px' };
export const FONT_SIZES: Record<FontSizeToken, string> = { sm: '0.875rem', base: '1rem', lg: '1.25rem', xl: '1.5rem', '2xl': '2.25rem' };
export const RADIUS = { none: '0', sm: '4px', md: '8px', lg: '16px', full: '9999px' } as const;
export const BORDER_WIDTH = { none: '0', thin: '1px', medium: '2px', thick: '4px' } as const;
export const FONT_STACKS: Record<FontFamilyToken, string> = { /* table above */ };
```

### The resolver (Layer 3)

```ts
// src/lib/resolveStyles.ts — ONE function, two consumers (canvas + generator)
import type { CSSProperties } from 'react';

export function resolveStyles(s: BlockStyles = {}): CSSProperties {
  const out: CSSProperties = {};
  const t = s.typography, c = s.colors, sp = s.spacing, b = s.borders, bg = s.background;
  if (t?.fontFamily) out.fontFamily = FONT_STACKS[t.fontFamily];
  if (t?.fontSize)    out.fontSize   = FONT_SIZES[t.fontSize];
  if (t?.fontWeight)  out.fontWeight = t.fontWeight;
  if (t?.lineHeight)  out.lineHeight = t.lineHeight;
  if (t?.textAlign)   out.textAlign  = t.textAlign;
  if (c?.text)        out.color      = c.text;
  if (sp?.padding)   out.padding    = SPACING[sp.padding];
  if (sp?.margin)    out.margin     = SPACING[sp.margin];
  if (b?.width)       out.borderWidth = BORDER_WIDTH[b.width];
  if (b?.color)       out.borderColor = b.color;
  if (b?.radius)      out.borderRadius = RADIUS[b.radius];
  if (b?.width && b?.width !== 'none') out.borderStyle = 'solid';
  if (bg?.color)      out.background = bg.color;
  if (bg?.image)      out.backgroundImage = `url("${bg.image}")`;
  return out;                       // unset keys omitted → base class applies
}
```

> The generator (Phase 4) consumes the **same function**, formatting the result as a `.b-<id> { … }` rule. If it resolves here, it exports there. No drift is possible by construction.

---

## 3. Part A — Base layer CSS (`src/styles/blocks.css`)

- [ ] A small **reset** at the top (also reused verbatim in export): box-sizing border-box, `img { max-width: 100% }`, margin reset, link color inherit, focus-visible outline for a11y.
- [ ] One class per block type with its **default look**: sensible modern neutral palette, generous spacing, no JavaScript needed.
- [ ] **All responsive rules live here and only here.** One system breakpoint (locked: no manual breakpoints in the UI):

```css
/* blocks.css pattern */
.lw-hero { display: flex; flex-direction: column; align-items: center;
           gap: 24px; padding: 96px 24px; background: #f8fafc; text-align: center; }
.lw-hero .lw-heading { font-size: clamp(2rem, 5vw, 3.5rem); }  /* auto-scaling text */

@media (max-width: 768px) {
  .lw-hero { padding: 48px 16px; }
  .lw-navbar .lw-navbar__links { display: none; }   /* hamburger appears via script.js (P4) */
  .lw-footer { flex-direction: column; align-items: center; }
}
```

- [ ] Patterns to prefer (they make blocks auto-responsive for free): flexbox with `flex-wrap`, `clamp()` for hero/heading sizes, `max-width: 100%` images, single-column stacking under 768px.
- [ ] Canvas imports this file (`import '@/styles/blocks.css'`) — so resizing the app window already shows responsive behavior.

## 4. Part B — Make every block real (spec sheets)

For each block: final markup (the generator in Phase 4 emits **this exact structure**), default props, and what's inline-editable. Implement + eyeball each before moving on.

| Block | Markup skeleton (classes) | Default props | Inline-editable |
|---|---|---|---|
| **navbar** | `<header class="lw-navbar"><a class="lw-navbar__brand">brand</a><nav class="lw-navbar__links">a…</nav><button class="lw-navbar__toggle"/></header>` | brand "Your Brand", 3 links | brand only (links via Settings tab) |
| **hero** | `<section class="lw-hero"><div class="lw-hero__inner">children…</div></section>` | — (children from registry) | children's text |
| **heading** | `<h1..h4 class="lw-heading">` | level 2, sample line | ✏️ text |
| **text** | `<p class="lw-text">` per line | two short sentences | ✏️ text |
| **image** | `<figure class="lw-image"><img></figure>` | src "", alt "Describe this image" | — (Settings) |
| **button** | `<a class="lw-btn">label</a>` — an **anchor, never a `<button>`** (locked: no forms, CTA links only) | label "Get started", href "#", newTab false | ✏️ label |
| **link** | `<a class="lw-link">label</a>` | label "Read more", href "#" | ✏️ label |
| **footer** | `<footer class="lw-footer"><span class="lw-footer__brand">…</span><nav>links</nav><p class="lw-footer__copy">…</p></footer>` | brand, "© 2026 Your Name", 2–3 links | brand, copyright line |

- [ ] Implement each with its `blocks.css` defaults: navbar (white bg, border-bottom, 16px padding), hero (from §3 example), heading (`clamp` sizes by level), text (`max-width: 65ch`, auto margins), image (rounded, centered, max-width), button (padding `12px 24px`, radius `md`, weight 600, blue `#2563eb`, hover darken via class), footer (dark `#0f172a`, light text, responsive stack).
- [ ] Verify every block against the Phase-2 default content — nothing should look broken even in a blank project.
- [ ] Confirm: dragging the app window narrow flips every block into its `≤768px` look. (This is "auto-responsive" — the locked decision — working end to end.)

## 5. Part C — The Inspector (right panel)

Layout: when a block is selected, show a header (block label + short id) and two tabs: **Style** · **Settings**. Nothing selected → a short hint ("Select a block to style it") + project name field.

### 5.1 Style tab — controls map 1:1 to `BlockStyles` (locked control set, nothing more)

| Section | Control(s) | Writes to |
|---|---|---|
| Typography | Font family `Select` (8 tokens) · Size `ToggleGroup` chips (sm/base/lg/xl/2xl) · Weight `Select` (400–700) · Line height `Slider` 1.0–2.0 · Align `ToggleGroup` (left/center/right icons) | `typography.*` |
| Colors | Text color `ColorField` | `colors.text` |
| Spacing | Padding chips (none…2xl) · Margin chips (none…2xl) | `spacing.*` |
| Borders | Radius chips (none/sm/md/lg/full) · Width chips (none/thin/medium/thick) · Color `ColorField` | `borders.*` |
| Background | Solid `ColorField` · Image picker (from assets / upload) | `background.*` |

- [ ] **`ColorField` component** (used 4×): swatch button → `Popover` containing `react-colorful` + hex `Input` + **"None"** button (clears the key = fall back to default).
- [ ] Every control change = one `updateStyles` call (deep-merged patch; "None"/unselect = delete the key).
- [ ] **"Reset to default" button** at the bottom of the Style tab: removes all user keys for the block (via a confirmation-free single action; undo protects the user).
- [ ] Controls show the **current state** of the selected block: if the key is unset, the control shows the *effective default* dimmed/ghosted (simplest: show as unselected and note "default" in the section header).

### 5.2 Settings tab (per-type props)

| Block | Settings |
|---|---|
| heading | Level `ToggleGroup` (H1–H4) |
| image | **Choose image** button · Alt text `Input` |
| button | Label `Input` · Href `Input` · Open in new tab `Switch` |
| link | Label `Input` · Href `Input` |
| navbar | Brand `Input` · Links list editor (label + href rows, add/remove/reorder) |
| footer | Brand `Input` · Copyright `Input` · Links list editor |
| hero / text | (no extra settings — content lives on the canvas) |

- [ ] The links list editor: small array editor component — rows of two inputs + delete icon, "Add link" button. One store action per change (`updateProps`).

## 6. Part D — Asset pipeline & fonts

### 6.1 Image upload flow (the only "import" feature in v1)

```
[Choose image] → dialog.open(png/jpg/webp/svg) → validate (≤ 5 MB, allowed ext)
  → copy file to <projectDir>/assets/<slug>-<6charhash>.<ext>
  → add AssetRecord to project.assets
  → set block props.src = "assets/<filename>"     (relative, always)
```

- [ ] Implement in `src/lib/io.ts` (`importAsset(sourcePath, projectDir): Promise<AssetRecord>`). Slugify the original name (`photo of my cat!.jpg` → `photo-of-my-cat-a3f9c2.jpg`).
- [ ] **Canvas display** (webview can't load `file://` directly): use the asset protocol enabled in Phase 1:

```tsx
import { convertFileSrc } from '@tauri-apps/api/core';
<img src={convertFileSrc(`${projectDir}/assets/${fileName}`)} />;
```

- [ ] **Path rule (memorize):** stored `props.src` is always relative (`assets/…`). Only the canvas converts to absolute via `convertFileSrc`. Preview and export use the relative path untouched. (Write one helper `displaySrc(src)` so this logic exists in exactly one place.)
- [ ] Small **asset manager dialog**: grid of thumbnails, filename, "used ×N" badge (via `walk(tree)`), delete (only when unused). Reached from the Inspector's background/image pickers.
- [ ] Also allow **background image** (hero etc.) via the same flow, stored in `background.image` as a relative `assets/…` path.

### 6.2 Fonts in the canvas

- [ ] Canvas: load the Google fonts once via `@import` in `index.css` (fonts render instantly while editing; requires internet — acceptable, note it).
- [ ] Preview/export (Phase 4) will emit `<link>` tags only for fonts actually used — decided now so the generator API can rely on it.

---

## 7. How to verify (Phase 3 exit test)

1. New blank project → add **hero** → it looks genuinely good with zero styling (photo-free but well-spaced, centered, clamp-scaled title)
2. Select hero → Style tab: set font `playfair`, size `2xl`, align `center`, background `#0f172a`, text color `#f8fafc`, padding `xl`, radius `lg` — canvas updates live after every click
3. Press **Reset to default** → hero returns to pristine defaults; `Ctrl+Z` restores your styling
4. Select the hero's heading → change weight to 600 and size `xl` → only that heading changes (per-block styles, no inheritance surprises)
5. **Settings → Choose image** on an image block → pick a JPG → it appears on canvas; check `assets/` in Explorer contains the copied file; `project.json` lists the AssetRecord and `props.src` is relative
6. Set a **background image** on the hero → shows behind content, still readable
7. Narrow the app window slowly → at some point every block reflows (nav links hide, footer stacks, hero title shrinks) — **with zero user action**
8. Style a `button`: radius `full`, borders `thin` color `#2563eb`, background `none` (ColorField "None") → it becomes an outline pill button
9. Save → open `project.json` → the styles you set are human-readable token values (`"padding": "xl"`), not raw px — tokens all the way down
10. Reopen the project → all styles and images intact

## 8. Definition of Done

> **Phase 3 is done when:** all 8 blocks look production-quality with no styling, every locked style control works from the right panel on every block, images upload into `assets/` and survive save/reopen, and the page reflows automatically when the window narrows. The canvas now renders user styles through `resolveStyles` — the exact function export will use.

## 9. Risks & mitigations

| Risk | Mitigation |
|---|---|
| Canvas/export drift (styled differently) | Impossible by construction — one resolver, one base CSS file. If they ever differ, it's a bug in *wiring*, not design. |
| Style sprawl ("just one more control…") | The control table in §5.1 is the locked ceiling. New controls = v2 roadmap items. |
| Color contrast disasters (white text on white bg) | v1 accepts this (real tools do too). Ship a `title` tooltip "check readability" on color fields; full contrast checking → v2 backlog. |
| `contentEditable` + styled text conflicts (caret invisible on dark bg) | Set `caret-color: currentColor` in the base CSS. |
| Big images bloat projects | 5 MB hard limit + toast. Auto-compression is a v2 item — document it. |
| Asset protocol scope errors on other machines | Already enabled with `**` scope in Phase 1; if a user hits it, the error text names the scope — searchable. |

## 10. Tips for building with AI (this phase)

1. Build **one block end-to-end** (hero) with AI first — resolver + base CSS + inspector wiring. Only then say *"now replicate this pattern for the remaining 7 blocks"* — pattern-first beats seven divergent one-offs.
2. Ask AI to keep `blocks.css` under ~300 lines and factor shared rules (`max-width: 65ch` for text, shared focus styles).
3. When a control misbehaves, paste the `BlockStyles` JSON of the block (from `project.json`) — the AI can spot token typos instantly.

---

➡️ **Next:** [PHASE-4-TEMPLATES-AND-PREVIEW.md](PHASE-4-TEMPLATES-AND-PREVIEW.md) — the site generator (tree → HTML/CSS/JS), the start screen with 3 templates, and device preview (desktop/tablet/mobile).
