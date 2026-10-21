/**
 * The site generator — turns the project's BlockNode tree into clean
 * HTML/CSS/JS. ONE code path for preview (Phase 4) and export (Phase 5):
 * the preview renders exactly what export will write to disk, because
 * both consume these functions and the same resolveStyles().
 */

import type { Project } from "@/types/blocks";
import type { GeneratedSite, GenerateOptions } from "./shared";
import { identityAsset } from "./shared";
import { generateHtml } from "./html";
import { generateCss } from "./css";
import { generateJs } from "./js";

export type { GeneratedSite, GenerateOptions } from "./shared";
export { generateHtml } from "./html";
export { generateCss } from "./css";
export { generateJs } from "./js";

/** Everything needed to render or write the site. */
export function generateSite(project: Project, opts?: GenerateOptions): GeneratedSite {
  const resolveAsset = opts?.resolveAsset ?? identityAsset;
  return {
    html: generateHtml(project, { resolveAsset }),
    css: generateCss(project, { resolveAsset }),
    js: generateJs(),
  };
}
