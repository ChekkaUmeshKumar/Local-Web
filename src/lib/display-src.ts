/**
 * displaySrc — the ONE place that maps a stored image reference to a
 * browser-loadable URL (the path rule, memorized):
 *
 *   - stored values are ALWAYS relative ("assets/foo.png") in project.json
 *   - only the CANVAS converts to the asset-protocol URL (convertFileSrc)
 *   - preview and export (Phase 4) use the relative path untouched
 */

import { convertFileSrc } from "@tauri-apps/api/core";

export function displaySrc(src: string, projectDir: string | null): string {
  if (!src) return "";

  // Absolute URLs / data URIs pass through untouched.
  if (/^(https?:|data:|blob:)/i.test(src)) return src;

  // Relative project path → asset protocol URL for the canvas.
  const dir = (projectDir ?? "").replace(/\\/g, "/").replace(/\/+$/, "");
  return convertFileSrc(dir ? `${dir}/${src}` : src);
}
