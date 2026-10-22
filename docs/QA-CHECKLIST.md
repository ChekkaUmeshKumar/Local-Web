# QA Checklist — v1.0 Release

Automated cells run on every `npm test` (115+ tests). This list is the
**interactive** part of the matrix — run it on the release build before
publishing. Copy it into the release notes when green.

## Install & launch

- [ ] Installer runs cleanly on a fresh Windows 10 VM (no dev tools)
- [ ] Installer runs cleanly on a fresh Windows 11 VM
- [ ] App launches with the default Tauri icon; start screen shows 3 templates

## Display

- [ ] 100% scaling: no clipped panels, canvas scrolls, preview scales to fit
- [ ] 150% scaling: same checks
- [ ] Resize the window very narrow: editor reflows, no dead zones, preview
      shows the zoom %

## Projects

- [ ] New blank project → hint card appears once, "Got it" persists across restarts
- [ ] Each template: create → page looks finished → edit text → style hero → save
- [ ] 30-block page: dragging stays smooth, Ctrl+S < 100 ms (feels instant)

## Assets

- [ ] Import a normal image → shows on canvas + preview + export
- [ ] Import attempt with a >5 MB file → clear error toast
- [ ] Delete an image file from assets/ in Explorer → export warns and offers skip
- [ ] Same image used in two blocks → exports once, referenced twice

## Data safety

- [ ] Save → corrupt project.json by hand → open → "Restore backup" toast →
      project opens intact (backup was the last save)
- [ ] Undo ×50 across adds/removes/styles — nothing corrupts
- [ ] Type text in a heading → Ctrl+S mid-edit → Ctrl+Z still behaves

## Export

- [ ] ZIP mode, all 3 templates + blank: unzip → double-click index.html →
      looks exactly like the preview (fonts, colors, images, mobile menu)
- [ ] Folder mode: same check
- [ ] Re-export after edits: identical structure, updated content
- [ ] Devtools device mode on file://: hamburger works at mobile width

## 10-Minute Test

- [ ] At least one first-time user passes (see USABILITY-LOG.md)
