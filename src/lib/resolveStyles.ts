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

export function resolveStyles(s: BlockStyles = {}): CSSProperties {
  const out: CSSProperties = {};

  const t = s.typography;
  if (t?.fontFamily) out.fontFamily = FONT_STACKS[t.fontFamily];
  if (t?.fontSize) out.fontSize = FONT_SIZES[t.fontSize];
  if (t?.fontWeight) out.fontWeight = t.fontWeight;
  if (t?.lineHeight) out.lineHeight = t.lineHeight;
  if (t?.textAlign) out.textAlign = t.textAlign;

  if (s.colors?.text) out.color = s.colors.text;

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
    out.backgroundImage = `url("${bg.image}")`;
    out.backgroundSize = "cover";
    out.backgroundPosition = "center";
  }

  return out;
}
