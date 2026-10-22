# LocalWeb — Roadmap

v1 is deliberately small. Everything below is *consciously parked* —
each item has a reason, and none is a promise.

## v1.1 candidates (small, high-value)

- **Real app icon** — drop a 1024px PNG into `src-tauri/icons/` sources and regenerate.
- **2–3 more templates** (event page, personal link-in-bio, local services).
- **Image auto-compression** on import (big photos → fast sites, automatically).
- **Contrast hints** on color pickers ("light text on light background").

## v2 ideas

- **Multi-page** — the data model already carries `pages[]`; the UI does not.
- **More blocks** — gallery, features grid, pricing, testimonials. Forms come
  last (spam/CGI hosting story first).
- **Themes** — palette + font presets applied across all blocks at once.
- **Anchor links** — block ids as `href="#id"` targets generated in export.
- **Custom CSS escape hatch** for advanced users (kept out of v1 on purpose).
- **macOS & Linux builds** — the stack is cross-platform; CI runners + testing are the work.
- **i18n** — editor UI strings + template copy in more languages.
- **SEO panel** — title/meta per project (v1 already writes a sane `<title>`).

## Consciously not doing (philosophy, revisit before violating)

- Cloud sync, accounts, collaboration — local-first is the product.
- Hosting — export + any static host is a solved problem.
- Plugin system / marketplace — until there's a plugin API worth locking.
- Position controls / manual breakpoints — auto-responsive is the promise.
- Analytics / telemetry — none. Ever.
