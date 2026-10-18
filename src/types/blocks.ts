/**
 * LocalWeb data model — v0.2 (Phase 2 contract; final for v1).
 *
 * The single source of truth for the whole app:
 *   - the Zustand store holds a Project
 *   - the canvas renders the active Page's tree of BlockNodes
 *   - project.json on disk is a serialized Project
 *   - the preview/export generator (Phase 4) consumes the same tree
 *
 * Standing rule: any future change to this shape goes through a
 * migration function keyed on `version` (see SCHEMA_VERSION) — old
 * project files must never silently break.
 */

/** Schema version written into project.json on disk. */
export const SCHEMA_VERSION = "0.1";

/** The 8 block types of v1 (locked — do not extend in v1). */
export type BlockType =
  | "navbar"
  | "hero"
  | "heading"
  | "text"
  | "image"
  | "button"
  | "link"
  | "footer";

/* ───────────────────────── Style tokens ─────────────────────────
 * The preset scales below are the ONLY values style controls may set.
 * Token → CSS value mapping lives in src/styles/tokens.ts (Phase 3).
 */

export type FontFamilyToken =
  | "system"
  | "serif"
  | "mono"
  | "inter"
  | "poppins"
  | "playfair"
  | "merriweather"
  | "lora";

export type FontSizeToken = "sm" | "base" | "lg" | "xl" | "2xl";

export type FontWeightToken = 400 | 500 | 600 | 700;

export type AlignToken = "left" | "center" | "right";

export type SpacingToken = "none" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl";

export type RadiusToken = "none" | "sm" | "md" | "lg" | "full";

export type BorderWidthToken = "none" | "thin" | "medium" | "thick";

/**
 * User style OVERRIDES for a block. `{}` means "use the block's base
 * defaults" (defined in src/styles/blocks.css — Phase 3). Unset keys fall
 * back to the base layer; that is how "reset to default" works.
 *
 * Note (v0.2 decision): background color lives here in `background.color`,
 * grouped with `background.image` — there is no `colors.background` (the
 * original draft had both; one concept, one field).
 */
export interface BlockStyles {
  typography?: {
    fontFamily?: FontFamilyToken;
    fontSize?: FontSizeToken;
    fontWeight?: FontWeightToken;
    lineHeight?: number; // unitless, 1.0 – 2.0
    textAlign?: AlignToken;
  };
  colors?: {
    text?: string; // hex
  };
  spacing?: {
    padding?: SpacingToken;
    margin?: SpacingToken;
  };
  borders?: {
    radius?: RadiusToken;
    width?: BorderWidthToken;
    color?: string; // hex
  };
  background?: {
    color?: string; // hex
    image?: string; // relative "assets/…" path
  };
}

/* ───────────────────────── Per-block props ───────────────────────── */

export interface NavLink {
  id: string;
  label: string;
  href: string;
}

export interface NavbarProps {
  brand: string;
  links: NavLink[];
}

/** Hero content comes from its children — no props of its own. */
export interface HeroProps {}

export interface HeadingProps {
  text: string;
  level: 1 | 2 | 3 | 4;
}

/** One text block; "\n" separates paragraphs. */
export interface TextProps {
  text: string;
}

export interface ImageProps {
  src: string; // "assets/…" (Phase 3) or full URL
  alt: string;
}

export interface ButtonProps {
  label: string;
  href: string; // CTA link — buttons are anchors, never form submits (locked: no forms)
  newTab?: boolean;
}

export interface LinkProps {
  label: string;
  href: string;
}

export interface FooterProps {
  brand: string;
  text: string; // copyright line
  links: NavLink[];
}

export type BlockProps =
  | NavbarProps
  | HeroProps
  | HeadingProps
  | TextProps
  | ImageProps
  | ButtonProps
  | LinkProps
  | FooterProps;

/* ───────────────────────── Tree ───────────────────────── */

/**
 * One node in the page tree.
 *
 * Builder model (locked): the page is a vertical stack of SECTIONS
 * (navbar / hero / footer) at the root; ELEMENTS (heading / text / image /
 * button / link) live inside sections (hero, footer accept children) or
 * directly at the root. `children` is present only on blocks whose
 * registry entry has `acceptsChildren: true`.
 */
export interface BlockNode {
  id: string; // nanoid(10)
  type: BlockType;
  props: BlockProps;
  styles: BlockStyles; // {} = block defaults
  children?: BlockNode[];
}

/** One uploaded file inside the project's assets/ folder. */
export interface AssetRecord {
  id: string;
  /** File name inside assets/ — the stored reference is always relative. */
  fileName: string;
  /** MIME type, e.g. "image/png". */
  type: string;
}

/** v1 has exactly one page ("Home"); the array is kept for the future. */
export interface Page {
  id: string;
  name: string;
  tree: BlockNode[];
}

/** Root of project.json — the whole app state on disk. */
export interface Project {
  version: string; // SCHEMA_VERSION at write time
  name: string;
  createdAt: string; // ISO date
  updatedAt: string; // ISO date
  pages: Page[];
  assets: AssetRecord[];
}

/** The active page (v1 = pages[0]). */
export function activePage(project: Project): Page {
  return project.pages[0];
}
