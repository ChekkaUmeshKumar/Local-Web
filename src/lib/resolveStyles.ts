/**
 * Layer 3 of the style architecture — the override resolver.
 *
 * ONE function, two consumers:
 *   canvas:      <section className="lw-hero" style={resolveStyles(block.styles)}>
 *   export (P4): the same object, serialized into a `.b-<id> { … }` rule
 *
 * The trick: an unset style key is simply OMITTED from the result, so the
 * block falls back to its Layer-1 base class (src/styles/blocks.css).
 * "Reset to default" = deleting the key. Unset keys omitted here = the
 * exact same CSS inherits there — canvas/export parity by construction.
 */

import type { CSSProperties } from "react";
import type { BlockStyles } from "@/types/blocks";
import {
  BORDER_WIDTH,
  FONT_SIZES,
  FONT_STACKS,
  RADIUS,
  SPACING,
} from "@/styles/tokens";

export interface ResolveStylesOptions {
  /**
   * Maps a stored relative asset path ("assets/foo.png") to a loadable URL.
   * The canvas passes the asset-protocol converter; the export generator
   * (Phase 4) uses the relative path untouched. One resolver, two consumers.
   */
  resolveAsset?: (relative: string) => string;
}

/**
 * Resolved styles may carry CSS custom properties (–-lw-*) that let a
 * SECTION-level style cascade into its content elements (blocks.css reads
 * them with fallbacks). The generator (Phase 4) emits them identically.
 */
type ResolvedStyles = CSSProperties & Record<string, string | number | undefined>;

export function resolveStyles(s: BlockStyles = {}, opts: ResolveStylesOptions = {}): ResolvedStyles {
  const out: ResolvedStyles = {};

  const t = s.typography;
  if (t?.fontFamily) {
    out.fontFamily = FONT_STACKS[t.fontFamily];
    // Cascades into headings/text inside a section (they read the variable).
    out["--lw-font-family"] = FONT_STACKS[t.fontFamily];
  }
  if (t?.fontSize) out.fontSize = FONT_SIZES[t.fontSize];
  if (t?.fontWeight) out.fontWeight = t.fontWeight;
  if (t?.lineHeight) out.lineHeight = t.lineHeight;
  if (t?.textAlign) out.textAlign = t.textAlign;

  if (s.colors?.text) {
    out.color = s.colors.text;
    // Cascades into headings/text inside a section (they read the variable).
    out["--lw-text-color"] = s.colors.text;
  }

  const sp = s.spacing;
  if (sp?.padding) out.padding = SPACING[sp.padding];
  if (sp?.margin) out.margin = SPACING[sp.margin];

  const b = s.borders;
  if (b?.radius) out.borderRadius = RADIUS[b.radius];
  if (b?.width && b.width !== "none") {
    out.borderWidth = BORDER_WIDTH[b.width];
    out.borderStyle = "solid";
  }
  if (b?.color) out.borderColor = b.color;

  const bg = s.background;
  if (bg?.color) out.backgroundColor = bg.color;
  if (bg?.image) {
    const url = opts.resolveAsset ? opts.resolveAsset(bg.image) : bg.image;
    out.backgroundImage = `url("${url}")`;
    out.backgroundSize = "cover";
    out.backgroundPosition = "center";
  }

  return out;
}
