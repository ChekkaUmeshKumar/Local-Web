# 🚀 PHASE 5 — Export & Polish: ZIP Export, the 10-Minute Test, Docs, v1.0 Release

> **LocalWeb build plan · Part 5 of 5**
>
> 📍 Plan map: [Phase 1 — Foundation](PHASE-1-FOUNDATION.md) → [Phase 2 — Editor Core](PHASE-2-EDITOR-CORE.md) → [Phase 3 — Blocks & Styling](PHASE-3-BLOCKS-AND-STYLING.md) → [Phase 4 — Templates & Preview](PHASE-4-TEMPLATES-AND-PREVIEW.md) → **Phase 5 — Export & Polish**

---

## 1. Phase goal

Ship the promise. Three things happen here:

- **Part A — Export:** one click produces a clean, dependency-free static site ZIP — `index.html`, `styles.css`, `script.js`, `assets/` — that works when double-clicked from any folder.
- **Part B — Polish & validation:** empty states, error handling, crash safety, first-run guidance, the full QA pass, and the **10-Minute Test** (the project's success metric).
- **Part C — Docs & release:** README, LICENSE, user guide, CI, installers, GitHub release. Version 1.0.0.

| | |
|---|---|
| **Estimated effort** | 1.5–2 weeks part-time |
| **Prerequisites** | Phase 4 Definition of Done (generator + preview + templates all working) |
| **End state** | A stranger downloads LocalWeb, builds a site, exports it, and puts it online — in under 10 minutes, with no tutorial. **That is the definition of v1 success.** |

---

## 2. Part A — Export pipeline

### 2.1 UX flow

```
[Export] (TopBar)
   → Export dialog: summary (blocks: N · images: N · est. size) · format: [ZIP ✓] [Folder]
   → dialog.save({ defaultPath: `<project-name>.zip` })
   → progress indicator → success toast: "Exported! Unzip and open index.html — that's your site."
```

- [ ] Export button disabled (with tooltip) when the tree is empty.
- [ ] "Folder" mode = same files written unzipped to a chosen directory (power-user convenience, near-zero extra code — `fs` writes, no zip).

### 2.2 Output (locked shape from the brief)

```
my-site/
├─ index.html      pretty-printed, semantic, <!-- Section --> comments
├─ styles.css      reset → base blocks.css → .b-<id> user rules
├─ script.js       mobile nav toggle + smooth anchors, < 1 KB, vanilla
└─ assets/         ONLY the images actually referenced (via walk(tree))
```

### 2.3 Implementation

- [ ] Reuse **`generateSite(project, { resolveAsset: r => r })`** from Phase 4 — export is "preview output + writing files". If the preview looks right, the export *is* right.
- [ ] Gather used assets by walking the tree (`props.src` + `background.image`), read each from `<projectDir>/assets/` as bytes.

```ts
import JSZip from 'jszip';

const zip = new JSZip();
zip.file('index.html', site.html);
zip.file('styles.css', site.css);
zip.file('script.js', site.js);
for (const a of usedAssets) zip.file(`assets/${a.fileName}`, assetBytes);

const buf = await zip.generateAsync({ type: 'uint8array' });
const path = await save({ defaultPath: `${project.name}.zip` });   // dialog plugin
await writeFile(path, buf);
```

- [ ] Toast failures with human sentences ("Couldn't write the file — is the folder open in Explorer?"), never raw error dumps.

### 2.4 Pre-export guards (validation, non-blocking warnings)

- [ ] **Blockers:** empty tree; an image `src` pointing to a file missing from `assets/` (offer "Remove image" or "Export anyway, image will be skipped").
- [ ] **Warnings shown in the export dialog:** any `href` that is empty; images > 2 MB ("your site will load slowly"); total export > 20 MB.
- [ ] Never silent-fail: every skipped/warned item is listed before the user confirms.

### 2.5 Output quality bar (test these, don't assume)

- [ ] Unzip → **double-click `index.html`** → it works from `file://` (no fetch, no modules, relative paths — the reason the storage/export design is what it is)
- [ ] View source: a human could mistake it for hand-written code
- [ ] Everything except user images < 100 KB total; `script.js` < 1 KB; zero external JS dependencies (Google Fonts CSS link is the only network touch, and the site degrades gracefully offline via fallback stacks)
- [ ] All 3 templates + a blank project export cleanly; mobile nav works in the exported file (open devtools device mode on `file://`)

---

## 3. Part B — Polish inventory + the 10-Minute Test

### 3.1 Polish pass (each item is small; do them all)

- [ ] **Crash safety:** on open and before every save, copy current file to `project.backup.json` (rotate: keep last one). Corrupted `project.json` → offer to restore from backup.
- [ ] **Empty states everywhere:** no project (start screen), empty canvas (Phase-2 hint card), no assets yet (asset manager), nothing selected (Inspector hint).
- [ ] **First-run helper:** the canvas hint card shows *once* per machine ("1 Drag a block · 2 Click text to edit · 3 Preview · 4 Export") with "Got it" — persisted in `appConfigDir()/localweb/settings.json`. This is the **no-tutorial safety net** behind the success metric.
- [ ] **Toasts (sonner)** for: saved, exported, asset imported, block deleted ("Ctrl+Z to undo"), errors.
- [ ] **Shortcuts (final set, documented in-app):** `Ctrl+S` save · `Ctrl+Z`/`Ctrl+Shift+Z` undo/redo · `Delete` remove block · `Esc` back out · `Ctrl+P` toggle preview · `Ctrl+E` export.
- [ ] **App identity:** real icon (1024×1024 PNG → `npm run tauri icon`), window title = `● project-name — LocalWeb` (dirty dot), About dialog (version, MIT, GitHub link).
- [ ] **Performance smoke:** 30-block project stays smooth while dragging; save stays < 100 ms.
- [ ] **Schema version** bumped to `"1.0"` + a no-op `migrate()` stub proving the migration path works.

### 3.2 QA matrix (run every cell before release)

| Axis | Cases |
|---|---|
| OS | Windows 10, Windows 11 (incl. fresh install, no dev tools) |
| Display | 100% and 150% scaling; small window (test scale-to-fit preview) |
| Projects | Blank · each of 3 templates · 30-block stress project |
| Assets | normal image · 5 MB image · image file deleted from disk (guard!) · same image used twice |
| Data safety | corrupted `project.json` (backup restore works) · undo ×50 · save during edit |
| Export | ZIP + Folder modes, all project types, re-export after edits (idempotent) |

### 3.3 🎯 THE 10-MINUTE TEST (the success metric, verbatim protocol)

**Pass condition:** a first-time user — no tutorial, no docs — drags 5+ blocks, edits text, previews, and exports a working static site in **under 10 minutes**.

- [ ] **Setup:** clean user account or VM (no dev caches), LocalWeb installed normally, screen recorder + timer running, observer silent.
- [ ] **The script (read verbatim, nothing more):** *"You run a small bakery and want a simple website. Using this app, get a finished website file you could put online. You have 10 minutes."*
- [ ] **Log:** time to first block dropped, first text edited, preview opened, export completed — plus every hesitation, wrong click, and quoted confusion.
- [ ] **Run it with 3–5 people** (friends count). Every run is a pass/fail + a friction list.
- [ ] **Iterate:** fix the top 3 frictions (hint text, confusing labels, drag sensitivity are the usual suspects), re-run, until a stranger passes. **Do not release v1 without a passing stranger.**
- [ ] Paste results + fixes into `docs/USABILITY-LOG.md` — future-you will treasure this file.

---

## 4. Part C — Docs, open-source setup, release

### 4.1 Documentation set (all required for v1.0)

| File | Contents |
|---|---|
| `README.md` | 30-second pitch · 10-second GIF of the core flow · screenshots of all 3 templates · features · **install** (download installer; build-from-source commands) · tech stack · roadmap link · MIT badge |
| `LICENSE` | MIT (locked: open-source, free forever) |
| `CONTRIBUTING.md` | dev setup, commands, code style, commit conventions, where the plan/architecture docs live, "good first issues" |
| `docs/USER-GUIDE.md` | the 5-step quickstart (open → template/blank → drag/edit → preview → export), FAQ, troubleshooting (asset errors, corrupted project) |
| `docs/ARCHITECTURE.md` | the big decisions: store/tree/resolver/generator, the 3-layer style architecture, storage format — plus this 5-phase plan linked as history |
| `docs/ROADMAP.md` | every **out-of-scope v1 item** parked with 1-line notes: multi-page, custom CSS, more blocks (forms later), themes, image auto-compression, contrast checker, more templates, i18n, macOS/Linux builds, plugin system, marketplace, SEO panel, position controls… |
| `docs/USABILITY-LOG.md` | 10-Minute Test results (§3.3) |

### 4.2 Repo & CI

- [ ] GitHub repo (`localweb`), push all history, pin the 5 phase files in the repo (they're great contributor onboarding).
- [ ] GitHub Actions on `windows-latest`: `npm ci` → typecheck (`tsc --noEmit`) → `vitest run` → `npm run tauri build` → upload `.msi`/NSIS `-setup.exe` as artifacts.
- [ ] Issue templates: bug (OS, steps, expected/actual) + feature (use-case first).

### 4.3 Release checklist (v1.0.0)

- [ ] Bump app version → `1.0.0`; schema version → `"1.0"`; golden tests green
- [ ] Full QA matrix §3.2 pass + at least one passing **stranger** on the 10-Minute Test
- [ ] `npm run tauri build` → installers from a clean checkout, **smoke-tested on a clean VM** (install → template → export)
- [ ] Tag `v1.0.0`, GitHub Release with artifacts + release notes (features, known limitations, roadmap pointer)
- [ ] README GIF recorded (ScreenToGif or similar) — 10–15 seconds, end to end
- [ ] Announce where your personas live (relevant communities, not everywhere)

---

## 5. Final Definition of Done (v1.0 sign-off)

- [ ] All **8 blocks**: draggable, inline-editable, styled, auto-responsive
- [ ] All **locked style controls** working; preset scales only; no position control anywhere
- [ ] **3 templates** + blank all produce finished-looking sites with real copy
- [ ] **Preview** at desktop/tablet/mobile renders the generator's true output
- [ ] **Export** produces a clean ZIP that works from `file://` — validated for all templates
- [ ] Projects save/open reliably; corrupted files recover from backup; undo/redo is solid
- [ ] 10-Minute Test passed by a stranger
- [ ] Docs set complete; MIT license; CI green; installers published on GitHub Releases
- [ ] Zero v1 out-of-scope features built (verify the list in Phase 1 §3 — restraint is a feature)

## 6. After v1.0 (so release day isn't the finish line)

- **Triage GitHub issues weekly** (bug fixes > new features for the first month).
- **Watch the patterns:** every "how do I…" issue = a UX bug or roadmap signal.
- **v1.1 candidates** (small, high-value): 2–3 more templates, image auto-compression, contrast hints.
- The roadmap doc — not your memory — is where every "wouldn't it be cool if" goes.

---

> **That's the whole plan.** Five phases, one source of truth (the `BlockNode` tree), one style pipeline (`resolveStyles`), one generator (preview = export), and one folder on the user's disk.
>
> When Phase 5's final checklist is green, LocalWeb does exactly what the pitch promised: *drag blocks, edit content, export a clean static website — in under 10 minutes, free forever.* 🎉
