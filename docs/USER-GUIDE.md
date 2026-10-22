# LocalWeb — User Guide

Build your first website in five steps. No coding, no accounts, no tutorials.

## The 5 steps

### 1. Start a project
Open LocalWeb and pick a starting point:
- **A template** — Portfolio, Business Landing, or Restaurant/Local. Each is a complete page; you just replace the text and images.
- **Blank project** — start from an empty page.
- **Open existing…** — continue a project you saved earlier.

Your project is a plain folder on your computer — inside it you'll find `project.json` (the page) and `assets/` (your images).

### 2. Add blocks
Drag blocks from the left panel onto the page. Sections (Navbar, Hero, Footer) stack as the page's backbone; elements (Heading, Text, Image, Button, Link) can sit inside them or directly on the page.

### 3. Edit content
- **Click once** on a block to select it (a small toolbar appears with move/duplicate/delete).
- **Click text** on a selected block to edit it — type, then press Enter (or click away).
- The right panel has two tabs:
  - **Style** — fonts, sizes, colors, spacing, borders and backgrounds with ready-made presets.
  - **Settings** — links, image files, alt text, navbar/footer link lists.

### 4. Preview
Click **Preview** (or press **Ctrl+P**) and switch between desktop, tablet and mobile. Your page reflows automatically — you never need to think about breakpoints. The preview shows exactly what your exported site will look like.

### 5. Export
Click **Export** (or press **Ctrl+E**), choose a ZIP or a folder, and save it. Unzip it and **double-click `index.html`** — that's your website. It's plain HTML, CSS and JS: open it from any folder, or upload the contents to any host (Netlify, GitHub Pages, your own server) and you're live.

## Keyboard shortcuts

| Shortcut | Action |
|---|---|
| Ctrl+S | Save |
| Ctrl+P | Toggle preview |
| Ctrl+E | Export |
| Ctrl+Z / Ctrl+Shift+Z | Undo / redo |
| Delete | Remove the selected block |
| Esc | Deselect |

## FAQ

**Where are my projects stored?**
Wherever you chose when creating the project. A project is just a folder — copy it, back it up, or put it in Dropbox.

**How do I add my own images?**
Select an image block → Settings tab → **Choose image…**. The file is copied into your project's `assets/` folder automatically (max 5 MB). You can also set an image as a section's background in Style → Background.

**I closed the app without saving.**
The window title shows a ● dot when there are unsaved changes. Get in the habit of Ctrl+S — it's instant. LocalWeb also keeps a `project.backup.json` from your last save.

**My project file is corrupted.**
LocalWeb detects this, keeps a copy of the broken file, and offers to restore the backup from your last save — one click.

**Why doesn't my exported site have a form/contact field?**
v1 uses links (mailto:, tel:, https://) as calls-to-action. Forms are on the roadmap.

## Troubleshooting

- **"Image is missing from the assets folder"** when exporting — the file was moved or deleted outside the app. Re-choose the image in Settings, or export anyway (the image is skipped).
- **An image doesn't show on the canvas** — pick it again via Settings → Choose image…; the app copies it into the project.
- **Port 1420 in use** during development (`tauri dev`) — a previous dev instance is still running; close it (or kill the `node` process holding the port) and retry.
