# 🏗️ PHASE 1 — Foundation: Empty Folder → Working Desktop App Skeleton

> **LocalWeb build plan · Part 1 of 5**
>
> 📍 Plan map: **Phase 1 — Foundation** → [Phase 2 — Editor Core](PHASE-2-EDITOR-CORE.md) → [Phase 3 — Blocks & Styling](PHASE-3-BLOCKS-AND-STYLING.md) → [Phase 4 — Templates & Preview](PHASE-4-TEMPLATES-AND-PREVIEW.md) → [Phase 5 — Export & Polish](PHASE-5-EXPORT-AND-POLISH.md)

---

## 1. Phase goal

Turn `C:\Users\chekk\Projects\Easy-Web` from an empty folder into a native desktop app that:

- opens in its own window (Tauri),
- renders the editor shell — **top bar, left panel, center canvas, right panel** — styled with Tailwind + shadcn/ui,
- has every core library installed and working together (React, TypeScript, Zustand, dnd-kit),
- and — **most important** — can read and write real files on disk via the Tauri `fs` + `dialog` plugins.

> 💡 **Why the file I/O test matters so much:** the entire product depends on one promise — *the user's website lives in a plain local folder* (`project.json` + `assets/`). That is the single riskiest capability in the stack. We prove it works in Phase 1, **before** building anything on top of it.

| | |
|---|---|
| **Estimated effort** | 3–4 focused days (beginner + AI pair) |
| **End state** | App window opens, shell renders, a test button round-trips a JSON file to disk, `npm run tauri build` produces an installer |
| **You will need** | No Rust experience. Everything is copy-paste + AI assistance. |

---

## 2. The full roadmap (so you know where this phase fits)

| Phase | File | Focus | Effort (part-time) | Exit state |
|---|---|---|---|---|
| 1. Foundation | *(this file)* | Scaffolding, shell, plugins, I/O proof | 3–4 days | App runs, files can be written & read |
| 2. Editor Core | [PHASE-2-EDITOR-CORE.md](PHASE-2-EDITOR-CORE.md) | Store, drag-drop, selection, inline text, save/open | 1.5–2.5 weeks | Build a page with blocks, save, reopen |
| 3. Blocks & Styling | [PHASE-3-BLOCKS-AND-STYLING.md](PHASE-3-BLOCKS-AND-STYLING.md) | All 8 blocks, style engine, right panel, assets | 2–3 weeks | Everything looks real and styled |
| 4. Templates & Preview | [PHASE-4-TEMPLATES-AND-PREVIEW.md](PHASE-4-TEMPLATES-AND-PREVIEW.md) | Site generator, 3 templates, device preview | 1–1.5 weeks | Template → preview at 3 device sizes |
| 5. Export & Polish | [PHASE-5-EXPORT-AND-POLISH.md](PHASE-5-EXPORT-AND-POLISH.md) | ZIP export, 10-minute test, docs, v1.0 release | 1.5–2 weeks | Shipped, documented, success metric passed |

**Realistic total: ~6–9 weeks part-time (10–15 h/week) for a beginner working with AI.** With AI assistance most *coding* is fast; budget time for debugging, environment issues, and decisions.

---

## 3. Locked decisions (never change these mid-build)

| Decision | Value |
|---|---|
| Target users | All personas — students, small businesses, freelancers, agencies |
| Platform | Desktop app (Windows first) |
| Tech | Tauri + React + TypeScript + Vite |
| UI mode | Simple only — no "advanced" toggle |
| Drag-drop | Custom React drag-drop (dnd-kit) — **not** GrapesJS |
| Storage | Local project folder: `project.json` + `assets/` |
| Export | Plain HTML/CSS/JS only |
| Forms | None — CTA links only |
| Responsive | Auto-responsive blocks, no manual breakpoints |
| Templates v1 | Portfolio, business landing, restaurant/local |
| Builder model | Prebuilt sections + drag-drop elements inside |
| Position control | Excluded from v1 |
| Business model | Open-source, free forever (MIT) |

**Out of scope for v1** (do not build, do not "sneak in"): forms, CMS, blog, auth, cloud sync, collaboration, hosting, React/Vue export, custom CSS editor, position controls, animation UI, SEO panel, multi-page, manual breakpoints, plugins, marketplace, analytics, payments. Park all of these in the roadmap doc created in Phase 5.

---

## 4. Architecture at a glance (read once, reference forever)

```
┌─────────────────────────────  LocalWeb (Tauri window)  ─────────────────────────────┐
│  WebView (React + TypeScript + Vite)                                                │
│  ┌──────────────────── Top bar: project name · preview toggle · export ──────────┐ │
│  │  Left panel      │   Canvas (React renderer)        │  Right panel            │ │
│  │  (block library) │   drag · select · inline edit     │  (styles + settings)    │ │
│  └──────────────────┴───────────────────────────────────┴─────────────────────────┘ │
│                                                                                     │
│  Zustand store  ── THE SINGLE SOURCE OF TRUTH ──  Project { pages[].tree: BlockNode[] } │
│                                                                                     │
│  Site generator (Phase 4): BlockNode tree → HTML/CSS/JS strings                     │
│      ├── used by Preview mode (live iframe)                                         │
│      └── used by Export (writes the same output to disk)                            │
│                                                                                     │
│  Tauri plugins: fs (read/write files) · dialog (pick folders/files)                 │
│      └── <user-chosen folder>/project.json  +  <user-chosen folder>/assets/          │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

**The one rule that keeps this project simple:** every UI element reads from and writes to the Zustand store. The canvas is *just a rendering of the store's block tree*. Save = serialize store → `project.json`. Open = `project.json` → store. Preview/export = store → generator. If you remember only one thing from this plan, remember this.

### Target folder structure (created across phases; Phase 1 creates the skeleton)

```
Easy-Web/
├─ src/                        # React app
│  ├─ components/
│  │  ├─ shell/                # TopBar, BlocksPanel, Canvas, InspectorPanel  (P1)
│  │  ├─ canvas/               # BlockRenderer, BlockWrapper, EditableText   (P2)
│  │  ├─ inspector/            # Style controls                             (P3)
│  │  └─ chooser/              # Start screen with templates                 (P4)
│  ├─ blocks/                  # registry + the 8 block components           (P2/P3)
│  ├─ store/                   # zustand store                               (P2)
│  ├─ templates/               # 3 template factories                        (P4)
│  ├─ export/                  # html/css/js generator                       (P4)
│  ├─ types/                   # blocks.ts data model                        (P1)
│  ├─ lib/                     # io.ts, tree.ts, resolveStyles.ts, tokens    (P1/P2/P3)
│  ├─ styles/                  # index.css, blocks.css                       (P1/P3)
│  ├─ App.tsx
│  └─ main.tsx
├─ src-tauri/                  # Rust side: config, capabilities, icons
├─ public/                     # bundled sample assets (P4)
├─ package.json
└─ vite.config.ts
```

---

## 5. Steps (work top to bottom; check boxes as you go)

### Step 0 — Prerequisites checklist

- [ ] **Node.js 20 LTS** — verify: `node -v` (v20 or newer)
- [ ] **Rust (MSVC toolchain)** — install via <https://rustup.rs>; verify: `rustc --version`
- [ ] **Visual Studio Build Tools** (C++ workload) — required by Rust on Windows. If the installer confuses you, ask your AI: *"Windows Rust MSVC build tools setup, step by step"*
- [ ] **Git** — verify: `git --version`
- [ ] **VS Code** + extensions: *Tauri*, *rust-analyzer*, *ESLint*, *Prettier*
- [ ] WebView2 runtime — preinstalled on Windows 10/11 (nothing to do, listed for completeness)

> ⚠️ **Your repo status:** git is already initialized (branch `main`, no commits) — good. But `.gitignore` currently exists as an **empty directory**, which will block creating the real file. Delete that folder and create a `.gitignore` **file** instead (Step 1.6 fixes this).

### Step 1 — Scaffold the Tauri + React + TypeScript app

```powershell
# inside C:\Users\chekk\Projects\Easy-Web (folder is empty, so scaffold in place)
npm create tauri-app@latest .
```

When prompted choose: **React · TypeScript · npm**. If the tool refuses `.` (current dir), scaffold into a temp subfolder (`npm create tauri-app@latest localweb`), then move all files up one level and delete the empty folder.

- [ ] `npm install` runs without errors
- [ ] `npm run tauri dev` opens a native window with the Tauri + React welcome page
- [ ] Understand the two halves:
  - `src/` → the React UI (where 95% of your code lives)
  - `src-tauri/` → the Rust shell. You will touch only `tauri.conf.json`, `capabilities/`, and icons. **No Rust coding required.**

- [ ] Edit `src-tauri/tauri.conf.json`: set `productName: "LocalWeb"`, window `title: "LocalWeb"`, and `identifier` (e.g. `"com.localweb.app"`).
- [ ] Delete the demo content from `src/App.tsx` and replace it with `<div>LocalWeb</div>` to confirm hot reload works.

> 💡 Confirm you are on **Tauri v2** (`"tauri": "^2"` in `src-tauri/Cargo.toml`). All instructions in this plan assume v2. When asking AI questions, always include *"Tauri v2"* in the prompt — v1 answers will mislead you.

### Step 2 — Path alias, cleanup, folder skeleton

- [ ] Add the `@/` import alias in **both** `tsconfig.json` (`compilerOptions.paths`) and `vite.config.ts` (`resolve.alias`). Restart the dev server. Verify with a test import `@/App`.
- [ ] Create the empty folder skeleton from §4 (`src/components/shell`, `src/types`, `src/lib`, `src/styles`, …). Empty folders don't exist in git — fine, they fill up soon.
- [ ] *(Optional but helpful)* Add ESLint + Prettier with default configs. Don't over-tune; defaults are fine for v1.

### Step 3 — Tailwind CSS

- [ ] Install (Tailwind v4, current): `npm install tailwindcss @tailwindcss/vite`
- [ ] Register the plugin in `vite.config.ts` and replace `src/index.css` content with `@import "tailwindcss";`
- [ ] Verify: add `class="text-3xl font-bold"` somewhere and see it styled.
- [ ] Editor chrome convention: **dark, neutral editor; light canvas.** The canvas area gets `bg-white` so it feels like a webpage; surrounding chrome uses dark neutrals.

> If the shadcn CLI offers to configure Tailwind for you, let it — following the official shadcn + Vite guide is the smoothest path.

### Step 4 — shadcn/ui

- [ ] `npx shadcn@latest init` — accept defaults (neutral palette, CSS variables).
- [ ] Add the components used across the whole build:

```powershell
npx shadcn@latest add button tooltip dialog select input label separator scroll-area toggle-group popover dropdown-menu tabs card sonner
```

- [ ] Verify: drop a `<Button variant="outline">Test</Button>` in `App.tsx`.

### Step 5 — Core libraries

- [ ] Install, and know *why* each one exists:

| Package | Why |
|---|---|
| `zustand` | The single store for project state (far simpler than Redux) |
| `zundo` | Undo/redo middleware for zustand (temporal history) — wired up in Phase 2 |
| `@dnd-kit/core` `@dnd-kit/sortable` `@dnd-kit/utilities` | Custom drag-drop for blocks and reordering |
| `nanoid` | Short unique block IDs |
| `clsx` + `tailwind-merge` | Class name helpers (shadcn pattern) |
| `lucide-react` | Icons (comes with shadcn) |
| `react-colorful` | Tiny color picker, used by the style panel in Phase 3 |
| `jszip` | Export to ZIP in Phase 5 |

### Step 6 — The data model, v0.1 (the contract)

Create `src/types/blocks.ts` with the agreed model. Phase 2 will *refine* it (typed props, style tokens) — do not over-design now.

```ts
// src/types/blocks.ts — v0.1, refined in Phase 2
export type BlockType =
  | 'navbar' | 'hero' | 'heading' | 'text'
  | 'image' | 'button' | 'link' | 'footer';

export interface BlockNode {
  id: string;              // nanoid
  type: BlockType;
  props: Record<string, unknown>;
  styles: BlockStyles;     // user style overrides; empty = block defaults
  children?: BlockNode[];  // only some blocks accept children (defined in Phase 2)
}

export interface BlockStyles {
  typography?: { fontFamily?: string; fontSize?: string; fontWeight?: number; lineHeight?: number; textAlign?: 'left' | 'center' | 'right' };
  colors?: { text?: string; background?: string };
  spacing?: { padding?: string; margin?: string };       // preset tokens only
  borders?: { radius?: string; width?: string; color?: string };
  background?: { color?: string; image?: string };
}

export interface AssetRecord { id: string; fileName: string; type: string; }

export interface Page { id: string; name: string; tree: BlockNode[]; }

export interface Project {
  version: string;         // schema version — "0.1" during development, "1.0" at release
  name: string;
  createdAt: string; updatedAt: string;
  pages: Page[];           // v1 uses exactly ONE page ("Home"); array kept for the future
  assets: AssetRecord[];
}
```

### Step 7 — App shell (static, no logic)

Build the 3-pane editor layout as dumb placeholders. This locks in the layout before any feature work.

- [ ] `src/components/shell/TopBar.tsx` — height 48px: app name, project name (static text), disabled **Preview** and **Export** buttons (shadcn `Button`, icons from lucide).
- [ ] `src/components/shell/BlocksPanel.tsx` — left panel, width 260px, dark background, title "Blocks", empty body.
- [ ] `src/components/shell/Canvas.tsx` — center, `bg-neutral-100` with a centered white "paper" (max-width ~1100px, full height, rounded border) — this simulates the future page surface.
- [ ] `src/components/shell/InspectorPanel.tsx` — right panel, width 300px, title "Styles", empty body.
- [ ] Compose in `App.tsx` with CSS grid: `grid-template-rows: 48px 1fr; grid-template-columns: 260px 1fr 300px`.
- [ ] Verify: resize the window — panels keep width, canvas flexes. No horizontal overflow/scrollbar at small sizes.

### Step 8 — Tauri plugins: `fs` + `dialog` (the critical path)

- [ ] Add both plugins (each command installs the npm package, the Rust crate, and registers permissions):

```powershell
npm run tauri add fs
npm run tauri add dialog
```

- [ ] Also enable the **asset protocol** (needed in Phase 3 to display images straight from the project folder in the webview). In `src-tauri/tauri.conf.json`:

```json
"app": {
  "security": {
    "assetProtocol": { "enable": true, "scope": ["**"] }
  }
}
```

- [ ] Set permissions in `src-tauri/capabilities/default.json`:

```json
{
  "identifier": "default",
  "windows": ["main"],
  "permissions": [
    "core:default",
    "dialog:default",
    "fs:allow-read-text-file",
    "fs:allow-write-text-file",
    "fs:allow-write-file",
    "fs:allow-read-file",
    "fs:allow-read-dir",
    "fs:allow-create-dir",
    "fs:allow-remove-file",
    "fs:allow-exists",
    { "identifier": "fs:scope", "allow": [{ "path": "**" }] }
  ]
}
```

> ⚠️ Broad `**` scope is a deliberate v1 simplification (a local-only tool touching user-chosen folders). Note it in `docs/` as a v2 hardening task. If you ever see a Tauri *"path not allowed"* error, the cause is almost always this scope — paste the exact error at your AI and it will fix the JSON.

- [ ] **IO smoke test (the Phase 1 centerpiece).** Add a temporary dev-only button in the TopBar that must: open a **folder picker**, write a JSON file into it, read it back, and toast success. Sketch:

```tsx
import { writeFile, readTextFile } from '@tauri-apps/plugin-fs';
import { open } from '@tauri-apps/plugin-dialog';

async function ioSmokeTest() {
  const dir = await open({ directory: true });   // native folder picker
  if (!dir) return;
  const path = `${dir}/localweb-io-test.json`;   // forward slashes work on Windows in Tauri APIs
  await writeFile(path, new TextEncoder().encode(JSON.stringify({ ok: true })));
  const read = await readTextFile(path);
  // toast: JSON.parse(read).ok === true ? "Disk I/O works ✔" : "Mismatch ✗"
}
```

- [ ] Verify the flow end-to-end: click → pick any folder → find `localweb-io-test.json` in Explorer → toast shows ✔.

### Step 9 — Build once, now (surfaces toolchain problems early)

- [ ] `npm run tauri build` — first run takes 5–15 minutes (Rust compiles everything). It must produce an installer under `src-tauri/target/release/bundle/`.
- [ ] Do this **now**, not in Phase 5. If the build breaks with a fresh empty app, the fix is trivial; with a finished app it is a nightmare to diagnose.

### Step 10 — Git hygiene

- [ ] Delete the accidental `.gitignore` **directory** and create a proper `.gitignore` **file** containing at minimum:

```
node_modules/
dist/
src-tauri/target/
*.local
```

- [ ] Make your first commits — small and descriptive: `chore: scaffold tauri app`, `feat: editor shell layout`, `feat: fs/dialog io smoke test`. Good commits are your safety net for the rest of the project.

---

## 6. How to verify (Phase 1 exit test)

Run through this list in order:

- [ ] `npm run tauri dev` opens the LocalWeb window in under a minute
- [ ] Shell looks right: top bar, dark left/right panels, light canvas "paper"
- [ ] A shadcn `Button` renders styled, not like raw HTML
- [ ] IO test: folder picker opens, JSON file is written, toast confirms read-back
- [ ] `npm run tauri build` produces an installer
- [ ] `git log` shows clean, small commits

## 7. Definition of Done

> **Phase 1 is done when:** the app opens as a native window with the 3-pane shell, all libraries are installed, the data model file exists, and you have personally watched the app write and read a JSON file from a folder the user picked. The riskiest unknown (local file access) is now a solved problem.

---

## 8. Risks & mitigations

| Risk | Mitigation |
|---|---|
| Rust/MSVC toolchain fails to install (common on Windows) | Follow the official Tauri prerequisites guide exactly; ask AI with the *exact* error text. This is a one-time setup pain. |
| `npm run tauri dev` is slow to start (Rust compile) | Normal. Subsequent starts are fast. Only `src/` changes trigger recompiles of the Rust side rarely. |
| Tailwind version mismatch with shadcn docs | Let the shadcn CLI drive Tailwind setup; if classes don't style, ask AI with your `package.json` versions pasted in. |
| "Path not allowed" fs errors | Scope/permissions in `capabilities/default.json` — see Step 8 warning. |
| Path alias `@/` not resolving | Must be set in **both** tsconfig and vite config, then restart the dev server. |

## 9. Tips for building with AI (applies to every phase)

1. **One task per prompt.** "Add a dnd-kit droppable to the canvas section" — not "build the editor".
2. **Paste errors verbatim.** Tauri and Rust errors are long and precise — that text is gold for the AI.
3. **Always say "Tauri v2"** in prompts, and pin the versions you use.
4. **Ask for explanations when code is unfamiliar** ("explain each part of this in 3 sentences") — you are the maintainer now.
5. **Commit after every working step.** If AI sends you down a broken path, `git reset` is your undo button.

---

➡️ **Next:** [PHASE-2-EDITOR-CORE.md](PHASE-2-EDITOR-CORE.md) — the block tree store, drag-drop, selection, inline text editing, and saving/opening `project.json`.
