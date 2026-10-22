# LocalWeb

**A free, open-source desktop app where anyone can drag blocks, edit content, and export a clean static website — in under 10 minutes, no tutorial needed.**

> 🎬 **TODO(release): record a 10–15s GIF of the core flow** (template → edit → preview → export) and drop it here.

![Version](https://img.shields.io/badge/version-1.0.0-blue) ![License](https://img.shields.io/badge/license-MIT-green) ![Platform](https://img.shields.io/badge/platform-Windows-lightgrey)

## What it is

LocalWeb is a tiny website builder that runs entirely on your machine. No accounts, no subscriptions, no cloud — your site lives in a plain folder, and one click exports a dependency-free static website you can open from any folder or upload to any host.

- 🧱 **Drag-and-drop blocks** — navbar, hero, headings, text, images, buttons, links, footer
- ✍️ **Click text to edit** — everything is editable right on the canvas
- 🎨 **Style controls** — typography, colors, spacing, borders and backgrounds with preset scales (no CSS knowledge needed)
- 📱 **Auto-responsive** — every block adapts to phones and tablets automatically; no breakpoints to manage
- 🖼️ **Three templates** — Portfolio, Business Landing, and Restaurant/Local, each a complete page with real copy
- 👀 **Live preview** — desktop, tablet and mobile, powered by the same generator as the export (what you see is what ships)
- 📦 **Clean export** — a ZIP with `index.html`, `styles.css`, `script.js` and `assets/`; no frameworks, no build step, works from `file://`
- 💾 **Local-first storage** — a project is just a folder: `project.json` + `assets/` — with automatic backups

## Install

Download the latest installer from [**Releases**](https://github.com/ChekkaUmeshKumar/Local-Web/releases) (Windows MSI/EXE), install, and open LocalWeb.

## Build from source

Prerequisites: [Node.js](https://nodejs.org) 20+, [Rust](https://rustup.rs) (MSVC toolchain), Git.

```bash
git clone https://github.com/ChekkaUmeshKumar/Local-Web.git
cd Local-Web
npm install
npm run tauri dev      # run the app in dev mode
npm run tauri build    # produce the installers
npm test               # run the test suite (vitest)
```

## Tech stack

Tauri 2 · React 19 · TypeScript · Vite · Tailwind CSS 4 · shadcn/ui · Zustand (+ zundo) · dnd-kit · JSZip

## Documentation

- [User guide](docs/USER-GUIDE.md) — build your first site in 5 steps
- [Architecture](docs/ARCHITECTURE.md) — how it works and why
- [Roadmap](docs/ROADMAP.md) — what's next
- [Contributing](CONTRIBUTING.md) — dev setup and conventions

## License

[MIT](LICENSE) © 2026 ChekkaUmeshKumar — free forever.
