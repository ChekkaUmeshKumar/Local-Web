/**
 * Layer 2 of the style architecture — the token scales.
 *
 * These are the ONLY values style controls may offer (locked:
 * "preset scale only" — no free-form number inputs anywhere in the UI).
 * Token → CSS value mapping lives here and ONLY here, so the canvas
 * (via resolveStyles) and the export generator (Phase 4, same function)
 * can never disagree.
 */

import type {
  BorderWidthToken,
  FontFamilyToken,
  FontSizeToken,
  FontWeightToken,
  RadiusToken,
  SpacingToken,
} from "@/types/blocks";

/* ── values ─────────────────────────────────────────────────────── */

export const SPACING: Record<SpacingToken, string> = {
  none: "0",
  xs: "8px",
  sm: "16px",
  md: "24px",
  lg: "40px",
  xl: "64px",
  "2xl": "96px",
};

export const FONT_SIZES: Record<FontSizeToken, string> = {
  sm: "0.875rem",
  base: "1rem",
  lg: "1.25rem",
  xl: "1.5rem",
  "2xl": "2.25rem",
};

export const RADIUS: Record<RadiusToken, string> = {
  none: "0",
  sm: "4px",
  md: "8px",
  lg: "16px",
  full: "9999px",
};

export const BORDER_WIDTH: Record<BorderWidthToken, string> = {
  none: "0",
  thin: "1px",
  medium: "2px",
  thick: "4px",
};

/** Google fonts fall back to system stacks when offline. */
export const FONT_STACKS: Record<FontFamilyToken, string> = {
  system: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
  serif: "Georgia, 'Times New Roman', serif",
  mono: "ui-monospace, 'Cascadia Mono', Consolas, monospace",
  inter: "'Inter', system-ui, sans-serif",
  poppins: "'Poppins', system-ui, sans-serif",
  playfair: "'Playfair Display', Georgia, serif",
  merriweather: "'Merriweather', Georgia, serif",
  lora: "'Lora', Georgia, serif",
};

/* ── UI metadata (orders + labels for the Inspector controls) ────── */

export const SPACING_ORDER: SpacingToken[] = ["none", "xs", "sm", "md", "lg", "xl", "2xl"];
export const FONT_SIZE_ORDER: FontSizeToken[] = ["sm", "base", "lg", "xl", "2xl"];
export const RADIUS_ORDER: RadiusToken[] = ["none", "sm", "md", "lg", "full"];
export const BORDER_WIDTH_ORDER: BorderWidthToken[] = ["none", "thin", "medium", "thick"];
export const FONT_WEIGHTS: FontWeightToken[] = [400, 500, 600, 700];

export const FONT_FAMILY_OPTIONS: Array<{ value: FontFamilyToken; label: string }> = [
  { value: "system", label: "System" },
  { value: "serif", label: "Serif" },
  { value: "mono", label: "Mono" },
  { value: "inter", label: "Inter" },
  { value: "poppins", label: "Poppins" },
  { value: "playfair", label: "Playfair Display" },
  { value: "merriweather", label: "Merriweather" },
  { value: "lora", label: "Lora" },
];

/** Line-height slider bounds (stored unitless on the block). */
export const LINE_HEIGHT_MIN = 1;
export const LINE_HEIGHT_MAX = 2;
export const LINE_HEIGHT_STEP = 0.05;
