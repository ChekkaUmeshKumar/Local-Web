# Contributing to LocalWeb

Thanks for your interest! LocalWeb is a small, deliberately focused tool —
read this first and you'll be productive in minutes.

## Dev setup

```bash
git clone https://github.com/ChekkaUmeshKumar/Local-Web.git
cd Local-Web
npm install
npm run tauri dev    # the app opens as a native window
npm test            # vitest — 115+ tests
```

Prerequisites: Node 20+, Rust MSVC, Git. First `tauri dev` compiles Rust (~5 min); later starts are fast.

## Commands

| Command | What it does |
|---|---|
| `npm run tauri dev` | Run the app in dev mode (hot reload) |
| `npm test` | Run the whole test suite |
| `npx tsc --noEmit` | Typecheck only |
| `npm run build` | Typecheck + production frontend bundle |
| `npm run tauri build` | Full release build + installers |

## Architecture in 60 seconds

- **One source of truth**: the page is a `BlockNode[]` tree in a Zustand store (`src/store/editor.ts`). The canvas, the save file and the generator all read the same tree.
- **One style pipeline**: user styles are tokens resolved by `resolveStyles()` (`src/lib/resolveStyles.ts`) — used by the canvas now and by the generator, so preview/export can never drift.
- **One generator**: `src/export/` turns the tree into HTML/CSS/JS strings. Preview renders them in an iframe; export writes them to a ZIP.
- Read [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the full picture.

## Conventions

- **Every tree change goes through a pure helper** in `src/lib/tree.ts` — the store actions are one-liners on top of them, and undo/redo snapshots stay cheap.
- **Preset tokens only** in style controls (locked product decision — no free-form numbers, no custom CSS in v1).
- **Tests where they earn their keep**: tree helpers, resolver, generator (golden snapshot), templates, export. UI wiring is verified by the exit-test checklist.
- **Commits**: small, present-tense, scoped — `feat(inspector): …`, `fix(dnd): …`, `docs: …`.

## Good first issues

Look for the `good first issue` label. Ideas that fit the v1 scope (see the [roadmap](docs/ROADMAP.md) for what's deliberately out) are the fastest to land.

## Reporting bugs

Open an issue with: Windows version, steps to reproduce, what you expected, what happened. A screenshot of the canvas plus the `project.json` (it's small) usually solves it instantly.
