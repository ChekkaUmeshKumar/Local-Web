# 🧩 PHASE 2 — Editor Core: Blocks, Drag-Drop, Inline Editing, Save/Open

> **LocalWeb build plan · Part 2 of 5**
>
> 📍 Plan map: [Phase 1 — Foundation](PHASE-1-FOUNDATION.md) → **Phase 2 — Editor Core** → [Phase 3 — Blocks & Styling](PHASE-3-BLOCKS-AND-STYLING.md) → [Phase 4 — Templates & Preview](PHASE-4-TEMPLATES-AND-PREVIEW.md) → [Phase 5 — Export & Polish](PHASE-5-EXPORT-AND-POLISH.md)

---

## 1. Phase goal

Build the beating heart of LocalWeb: a working editor where a user can

- create a new project (blank) or open an existing one,
- **drag the 8 block types** from the left panel onto the canvas — into the page or inside sections,
- select blocks, move/duplicate/delete them,
- **edit text directly on the canvas** (inline editing),
- save to `project.json` and reopen the project later with everything intact,
- undo/redo mistakes.

Blocks will look plain in this phase (styling arrives in Phase 3). What matters now is that the **data flow, tree manipulation, and persistence are rock solid** — everything else in the project is built on top of them.

| | |
|---|---|
| **Estimated effort** | 1.5–2.5 weeks part-time (biggest "plumbing" phase) |
| **Prerequisites** | Phase 1 Definition of Done (shell renders, fs/dialog IO test passes) |
| **End state** | You can build a small page with blocks, edit its text, save, close the app, reopen — and everything is still there |

---

## 2. Concepts to internalize before writing code

### 2.1 One source of truth, one direction of flow

```
UI events (drag, click, type)
        │
        ▼
Store actions  ──mutate──▶  project.pages[0].tree   (BlockNode[])
        │
        ▼
Canvas re-renders from the tree  ── Save ──▶  project.json on disk
```

The canvas is **just a rendering of the tree**. It holds no state of its own. If a change happened, it happened through a store action. This rule is what keeps the project simple enough for a beginner to maintain.

### 2.2 Sections vs. elements (the builder model)

The locked decision *"prebuilt sections + drag-drop elements inside"* maps to two block groups:

- **Sections** — `navbar`, `hero`, `footer`. They live at the root of the page (the page is a vertical stack of sections). `hero` and `footer` **accept element children**; `navbar` does not (its links are a prop list, edited in the panel).
- **Elements** — `heading`, `text`, `image`, `button`, `link`. They can be dropped **inside** a section or directly at the root (rendered full-width — a plain page of stacked elements is valid).

### 2.3 Who can be dropped where (lock this table in code)

| Block | Group | Accepts children? | Valid drop targets |
|---|---|---|---|
| `navbar` | section | ❌ (links live in `props`) | root |
| `hero` | section | ✅ | root |
| `footer` | section | ✅ | root |
| `heading` `text` `image` `button` `link` | element | ❌ | root, `hero`, `footer` |

Every other combination is rejected by drag-over logic (no drop indicator, cursor snaps back). Enforcing this now prevents 90% of confusing edge cases later.

---

## 3. Refined data model (this phase's deliverable)

Phase 1 shipped `types/blocks.ts` v0.1. **Refine it now** — after this, the model is frozen for v1 and only the resolver/generator consume it.

```ts
// src/types/blocks.ts — v0.2 (final for v1)
export type BlockType =
  | 'navbar' | 'hero' | 'heading' | 'text'
  | 'image' | 'button' | 'link' | 'footer';

// ── Style tokens: the ONLY values style controls may set ──
export type FontFamilyToken = 'system' | 'serif' | 'mono'
  | 'inter' | 'poppins' | 'playfair' | 'merriweather' | 'lora';
export type FontSizeToken  = 'sm' | 'base' | 'lg' | 'xl' | '2xl';
export type FontWeightToken = 400 | 500 | 600 | 700;
export type AlignToken     = 'left' | 'center' | 'right';
export type SpacingToken   = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
export type RadiusToken    = 'none' | 'sm' | 'md' | 'lg' | 'full';
export type BorderWidthToken = 'none' | 'thin' | 'medium' | 'thick';

export interface BlockStyles {
  typography?: {
    fontFamily?: FontFamilyToken;
    fontSize?: FontSizeToken;
    fontWeight?: FontWeightToken;
    lineHeight?: number;              // 1.0 – 2.0, unitless
    textAlign?: AlignToken;
  };
  colors?: { text?: string };        // hex
  spacing?: { padding?: SpacingToken; margin?: SpacingToken };
  borders?: { radius?: RadiusToken; width?: BorderWidthToken; color?: string };
  background?: { color?: string; image?: string };  // image = relative "assets/…" path
}

// ── Per-block props (typed — Record<string, any> era is over) ──
export interface NavLink { id: string; label: string; href: string; }
export interface NavbarProps  { brand: string; links: NavLink[]; }
export interface HeroProps    { /** content comes from children */ }
export interface HeadingProps { text: string; level: 1 | 2 | 3 | 4; }
export interface TextProps    { text: string; }                 // \n = new paragraph
export interface ImageProps   { src: string; alt: string; }      // src = "assets/…" or URL
export interface ButtonProps  { label: string; href: string; newTab?: boolean; }
export interface LinkProps    { label: string; href: string; }
export interface FooterProps  { brand: string; text: string; links: NavLink[]; }

export type BlockProps =
  NavbarProps | HeroProps | HeadingProps | TextProps | ImageProps
  | ButtonProps | LinkProps | FooterProps;

export interface BlockNode {
  id: string;              // nanoid(10)
  type: BlockType;
  props: BlockProps;
  styles: BlockStyles;     // {} = "use block defaults"
  children?: BlockNode[];  // present only for blocks that accept children
}

export interface AssetRecord { id: string; fileName: string; type: string; }
export interface Page { id: string; name: string; tree: BlockNode[]; }
export interface Project {
  version: string;         // "0.1" during dev → "1.0" at release (schema version)
  name: string;
  createdAt: string; updatedAt: string;
  pages: Page[];           // v1 UI uses pages[0] only
  assets: AssetRecord[];
}
```

> 📌 **Refinement decision — background color:** the original draft had both `colors.background` and `background.color` controlling the same thing. We keep **`background.color`** (grouped with `background.image`) and drop `colors.background`. One concept, one field.

> 📌 **Migrations:** because `version` is stored in `project.json`, any future schema change gets a `migrate(old): Project` function — never a breaking surprise for users. Document this as a standing rule.

---

## 4. Steps

### Step 1 — Pure tree helpers (`src/lib/tree.ts`)

All tree manipulation happens in **pure, immutable** functions (return new arrays/objects, never mutate). This makes actions tiny, undo trivial, and React happy.

- [ ] `findBlock(tree, id): { block, parentId, index } | null`
- [ ] `insertBlock(tree, block, parentId, index): BlockNode[]` — `parentId: null` means root
- [ ] `removeBlock(tree, id): BlockNode[]`
- [ ] `cloneWithNewIds(block): BlockNode` — regenerate `nanoid()` for the block **and all descendants** (duplicate without this = corrupt saves)
- [ ] `walk(tree, fn)` — visit every node (used later for exports, asset scanning)

```ts
// example shape — AI writes the rest
export function insertBlock(tree: BlockNode[], block: BlockNode,
                            parentId: string | null, index: number): BlockNode[] {
  if (parentId === null) {
    const next = [...tree]; next.splice(index, 0, block); return next;
  }
  return tree.map(node =>
    node.id === parentId
      ? { ...node, children: spliceAt(node.children ?? [], index, block) }
      : node.children ? { ...node, children: insertBlock(node.children, block, parentId, index) } : node
  );
}
```

### Step 2 — The store (`src/store/editor.ts`)

- [ ] One Zustand store, `useEditor`, holding state + actions. **Every change goes through an action — no direct `setState` from components.** This is what makes undo work.

```ts
interface EditorState {
  project: Project;
  projectDir: string | null;      // absolute path of the project folder
  selectedId: string | null;
  editingTextId: string | null;   // block currently in inline-text mode
  dirty: boolean;
  // actions
  addBlock(type: BlockType, parentId: string | null, index: number): void;
  moveBlock(id: string, parentId: string | null, index: number): void;
  removeBlock(id: string): void;
  duplicateBlock(id: string): void;
  updateProps(id: string, patch: Partial<BlockProps>): void;
  updateStyles(id: string, patch: BlockStyles /* deep-merged, undefined clears */): void;
  select(id: string | null): void;
  setEditingText(id: string | null): void;
  hydrate(project: Project, dir: string): void;   // used by Open
  markSaved(): void;
}
```

- [ ] `updateStyles` deep-merges patches; setting a field to `undefined` **deletes the key** (falls back to block defaults — this is how "reset" works later).
- [ ] Every action sets `dirty = true` (except `hydrate`/`markSaved`).
- [ ] Every action rewrites `project.updatedAt`.

### Step 3 — Block registry (`src/blocks/registry.ts`)

One place describes each block — the left panel, canvas, defaults, and (in Phase 3) the inspector all read from it.

```ts
export interface BlockMeta {
  type: BlockType;
  label: string;                 // "Hero", "Text"…
  icon: LucideIcon;             // lucide icon for the panel
  group: 'section' | 'element';
  acceptsChildren: boolean;
  defaultProps: BlockProps;     // typed defaults incl. sample copy
  defaultChildren?: { type: BlockType }[];  // e.g. hero → heading, text, button
}

export const REGISTRY: Record<BlockType, BlockMeta> = { /* … */ };

export function createBlock(type: BlockType): BlockNode;  // nanoid + defaults + defaultChildren
```

- [ ] Sensible default content so the canvas never looks broken: heading text `"A headline that sells"`, text block with a real sentence, button `"Get started" → "#"`, navbar with 3 links, footer with `© 2026 Your Name`.
- [ ] `hero` gets `defaultChildren: [heading, text, button]` — this is what makes it feel "prebuilt".
- [ ] **All 8 blocks must be listed here with valid props** (TypeScript should enforce it — that's the point of typed props).

### Step 4 — Canvas renderer

- [ ] `src/components/canvas/BlockRenderer.tsx` — recursive: renders a `BlockNode`; if it accepts children, renders `children` (each wrapped) inside a child drop zone.
- [ ] `src/components/canvas/BlockWrapper.tsx` — wraps every block instance with editor chrome:
  - hover outline (1px dashed neutral), selected outline (`ring-2 ring-blue-500`)
  - click → `select(id)`; click again while selected → `setEditingText(id)` for text-bearing blocks
  - floating mini-toolbar on the selected block (lucide icons): ⬆ move up · ⬇ move down · ⧉ duplicate · 🗑 delete
- [ ] One React component per block type in `src/blocks/` (`NavbarBlock.tsx`, `HeroBlock.tsx`, …) — **plain, unstyled markup for now** (correct structure matters; looks come in Phase 3):
  - `heading` → `<h1|h2|…>` from `props.level`, `text` → `<p>` per line, `image` → `<img>` (placeholder box if `src` empty), `button`/`link` → `<a>`, `navbar` → brand + links row, `footer` → brand/links/copyright, `hero` → section with children slot
- [ ] Empty canvas state: centered hint card — **"1. Drag a block from the left panel · 2. Click text to edit · 3. Preview · 4. Export"** with a subtle arrow to the left panel. (This doubles as the no-tutorial onboarding — it directly serves the success metric.)

### Step 5 — Drag & drop (dnd-kit)

- [ ] Wrap the editor in a single `DndContext` (App level):
  - `PointerSensor` with `activationConstraint: { distance: 4 }` — clicks never accidentally drag
  - `DragOverlay` showing a small ghost card of the dragged item
- [ ] **Left panel cards** — `useDraggable` with data `{ kind: 'new', blockType }`. Two groups with headers: *Sections* / *Elements* (drag rules in §2.3 are enforced by the drop logic, not by hiding cards).
- [ ] **Existing blocks** — each wrapped block is a `useSortable` item with data `{ kind: 'move', id, parentId }`.
- [ ] **Drop zones**:
  - root: the canvas paper (a droppable + `SortableContext` of root children)
  - each `hero`/`footer` renders an inner `SortableContext` over its children
- [ ] **Drop logic on `dragOver`/`dragEnd`:** compute `{ parentId, index }` target → render a **2px blue insertion line** at that position while dragging → on drop:
  - `kind === 'new'` → `addBlock(blockType, parentId, index)`
  - `kind === 'move'` → `moveBlock(id, parentId, index)` (skip no-ops)
  - reject invalid pairs per §2.3 (no indicator, snap back)
- [ ] Implement in this order: (1) root-only drops, (2) reordering within root, (3) dropping into sections. Test each before the next.

### Step 6 — Inline text editing (the make-or-break feature)

Editable text must feel like typing in a document. React's `contentEditable` has famous pitfalls — follow these four rules and you're safe:

```
RULE 1  Never render text from state while the element is focused
        (set initial text once via ref; React re-render would reset the caret)
RULE 2  Commit on blur / Enter — store the text THEN, not on every keystroke
RULE 3  Escape = cancel (restore the original text, keep selection)
RULE 4  Undo shortcuts are disabled while editingTextId !== null
        (store history would otherwise fire on every commit keystroke pattern)
```

- [ ] `src/components/canvas/EditableText.tsx` implementing exactly this:

```tsx
// sketch
function EditableText({ value, onChange, multiline, className }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {                      // RULE 1: only set when NOT focused
    if (ref.current && document.activeElement !== ref.current)
      ref.current.innerText = value;
  }, [value]);
  // onBlur / Enter → onChange(ref.current.innerText)   (RULE 2)
  // Escape  → restore + blur                          (RULE 3)
  return <span ref={ref} contentEditable suppressContentEditableWarning … />;
}
```

- [ ] Single-line blocks (`heading`, `button`, `link`, `navbar.brand`): Enter commits. `text` block: `Shift+Enter` inserts a line break; Enter commits.
- [ ] Inline-editable targets in this phase: `heading.text`, `text.text`, `button.label`, `link.label`, `navbar.brand`, `footer.brand`, `footer.text`. (Navbar/footer **link lists** are edited in the right panel — arrives with the Settings tab in Phase 3.)
- [ ] Selected-vs-editing states: click = select (blue outline); click again (or double-click) = edit (caret). Escape walks back: editing → selected → deselected.

### Step 7 — Project lifecycle & persistence (`src/lib/io.ts`)

**Folder layout on disk (locked):**

```
MyWebsite/                 ← user chose this folder
├─ project.json            ← single source of truth, pretty-printed 2-space JSON
└─ assets/                 ← created with the project, filled in Phase 3
```

- [ ] **New project flow:** TopBar "New" → small dialog (project name input → "Choose folder" via `dialog.open({ directory: true })`) → create folder, write initial `project.json` (version `"0.1"`, one page `Home`, empty tree) → open it in the editor.
- [ ] **Open flow:** `dialog.open({ filters: [{ name: 'LocalWeb project', extensions: ['json'] }] })` → user picks a `project.json` → read → validate (known `version`, `pages` array exists) → `hydrate()`.
- [ ] **Corruption guard:** if parsing fails, write `project.corrupted-backup.json` next to the broken file, toast a clear error, and return to the start screen — never crash, never overwrite the user's file.
- [ ] **Save:** `JSON.stringify(project, null, 2)` → `writeFile(projectDir + '/project.json')`. Bound **Ctrl+S**. Show a **dirty dot ●** next to the project name when unsaved changes exist.
- [ ] **Recents:** keep the last 5 projects in `appConfigDir()/localweb/recent.json` (`{ name, path, updatedAt }`). The start screen lists them.
- [ ] **Start screen (minimal — template cards slot in during Phase 4):** shown when no project is open: *New blank project* · *Open existing…* · recents list.
- [ ] Always build paths with **forward slashes** via Tauri path helpers — never hand-concatenate `\`. Store only relative paths (`assets/foo.png`) inside `project.json`; absolute `projectDir` lives only in app state, never in the file.

### Step 8 — Undo/redo (safety net, small and bounded)

- [ ] Wrap the store with zundo's `temporal` middleware: `limit: 50`, `partialize` to `project` **only** (selection flickering in history is a classic bug — exclude it).
- [ ] **Pause history while `editingTextId !== null`** (Rule 4 above), resume on commit.
- [ ] Shortcuts: `Ctrl+Z` undo · `Ctrl+Shift+Z` / `Ctrl+Y` redo · buttons in the TopBar (disabled at history ends).
- [ ] Sanity-check: undoing an *add* removes the block; undoing a *style* patch restores the previous value.

### Step 9 — Selection & block actions polish

- [ ] `Delete`/`Backspace` (when not editing text) removes the selected block → toast "Block deleted · Ctrl+Z to undo".
- [ ] Move up/down buttons respect parent boundaries (a block inside `hero` can't move to root via arrows — only via drag).
- [ ] Click on empty canvas → deselect. Escape → deselect.
- [ ] Deleting a section deletes its children (confirmed by undo making it recoverable — no confirm dialog needed, keep it fast).

---

## 5. How to verify (Phase 2 exit test — run it exactly like this)

1. Launch app → start screen → **New blank project** → name `test-site`, pick a folder → editor opens, empty canvas hint visible
2. Drag **Hero** from the panel → drop on canvas → hero appears with prebuilt heading/text/button children
3. Click the hero → blue outline + mini-toolbar appear
4. Click the heading's text → caret appears → type "Bakery in Lisbon" → Enter → text committed
5. Drag **Image** → drop *inside* the hero → renders inside it; drag another image → drop at root below the hero → renders full-width
6. Select the root image → press Delete → gone → `Ctrl+Z` → back
7. Duplicate the button inside the hero → two buttons exist
8. Make 5 changes → `Ctrl+Z` ×5 → page is back to its first state → redo ×5 → forward again
9. `Ctrl+S` → dirty dot clears → open `test-site/project.json` in a text editor → pretty JSON with your content
10. **Fully close the app** → relaunch → *Open existing* → pick `test-site` → everything is back, including selection-free clean state
11. Try to drag a **navbar onto the hero** → no drop indicator, snap-back (invalid pair rejected)
12. Reopen the corrupted-file guard by hand-editing `project.json` into invalid JSON → Open → error toast, backup file created, no crash

## 6. Definition of Done

> **Phase 2 is done when:** a non-technical friend could build a page of 5+ blocks, edit all text by clicking it, save with Ctrl+S, and reopen the project tomorrow — without you explaining anything. Undo/redo never loses work, and invalid drags simply never happen.

## 7. Risks & mitigations

| Risk | Mitigation |
|---|---|
| `contentEditable` fights React (caret jumps, text resets) | The 4 rules in Step 6. If desperate: commit-on-blur only, no live state sync while focused. |
| dnd-kit nested containers get gnarly | Build incrementally (root → reorder → sections). Ask AI for the *"dnd-kit sortable multiple containers"* pattern; it's well documented. |
| Windows path bugs (`\` vs `/`) | Relative forward-slash paths in state/JSON; join via Tauri helpers only. |
| Undo history captures junk (selection, hover) | `partialize` to `project` only. |
| Duplicate blocks share IDs → corrupt trees | `cloneWithNewIds` regenerates every id recursively — test it explicitly. |
| A crash loses 30 minutes of work | Dirty dot from day one; Phase 5 adds crash-safe auto-backup to `project.backup.json`. |

## 8. Tips for building with AI (this phase)

1. **Paste the whole `tree.ts` + store file** when asking for changes — tree code breaks silently without full context.
2. Ask for **dnd-kit current-version** examples specifically; older v1 examples (`react-sortablejs`-era) will waste hours.
3. Have AI write **a tiny vitest suite for `tree.ts`** (insert/remove/clone cases) — it's the one module where a unit test is cheaper than manual testing.
4. When inline editing misbehaves, record a 10-second description of *exactly* what you typed and what happened — AI debugging of contentEditable is very prompt-sensitive.

---

➡️ **Next:** [PHASE-3-BLOCKS-AND-STYLING.md](PHASE-3-BLOCKS-AND-STYLING.md) — the style engine (tokens → CSS), the full look of all 8 blocks, the right-hand style panel, and the image/asset pipeline.
