/**
 * generateCss — the flattened styles for the exported site:
 *
 *   1. Base layer: reset + block defaults + ALL responsive rules — the
 *      verbatim blocks.css the canvas renders (one source of truth via a
 *      ?raw import), so canvas and export can never drift.
 *   2. Per-block overrides: the SAME resolveStyles() the canvas uses,
 *      serialized into `.b-<id> { … }` rules. Blocks with no user styles
 *      emit no rule at all — the base class already has them covered.
 */

import blocksCss from "@/styles/blocks.css?raw";
import type { Project } from "@/types/blocks";
import { REGISTRY } from "@/blocks/registry";
import { walk } from "@/lib/tree";
import { resolveStyles } from "@/lib/resolveStyles";
import { identityAsset, treeOf, type GenerateOptions } from "./shared";

export function generateCss(project: Project, opts?: GenerateOptions): string {
  const resolveAsset = opts?.resolveAsset ?? identityAsset;

  const parts: string[] = [
    "/* styles.css — generated with LocalWeb */",
    "",
    "/* ─── Base layer: reset, block defaults and responsive rules ───",
    "     (identical to what the editor canvas renders) ─── */",
    blocksCss,
    "",
    "/* ─── Per-block overrides (styled in the editor) ─── */",
  ];

  walk(treeOf(project), (block) => {
    const style = resolveStyles(block.styles, { resolveAsset });
    const rules = styleToCss(style);
    if (rules === "") return; // unstyled block: base class is enough

    parts.push(`/* ${REGISTRY[block.type].label} */`);
    parts.push(`.b-${block.id} {`);
    parts.push(rules);
    parts.push("}");
    parts.push("");
  });

  return parts.join("\n").trimEnd() + "\n";
}

/** camelCase → kebab-case; CSS custom properties pass through untouched. */
function styleToCss(style: Record<string, string | number | undefined>): string {
  return Object.entries(style)
    .filter(([, value]) => value !== undefined && value !== null && value !== "")
    .map(([key, value]) => {
      const prop = key.startsWith("--")
        ? key
        : key.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
      return `  ${prop}: ${value};`;
    })
    .join("\n");
}
