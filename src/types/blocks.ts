/**
 * LocalWeb data model — v0.1 (Phase 1 contract).
 *
 * This is the single source of truth for the whole app:
 *   - the Zustand store holds a Project
 *   - the canvas renders the Page.tree of BlockNodes
 *   - project.json on disk is a serialized Project
 *   - the preview/export generator consumes the same tree
 *
 * Phase 2 refines this file into v0.2 (typed per-block props + style tokens).
 * Rule: ONLY refine via a migration path — `version` in project.json exists for that.
 */

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

/** One node in the page tree. */
export interface BlockNode {
  /** nanoid(10) */
  id: string;
  type: BlockType;
  /**
   * Block-specific content (heading text, image src, hrefs…).
   * Loose in v0.1; per-type interfaces land in Phase 2.
   */
  props: Record<string, unknown>;
  /**
   * User style OVERRIDES. An empty object means "use the block's
   * base defaults" (defined in src/styles/blocks.css — Phase 3).
   */
  styles: BlockStyles;
  /** Present only on blocks that accept children (defined in Phase 2 registry). */
  children?: BlockNode[];
}

/** Style overrides a user can set from the right panel (locked control set). */
export interface BlockStyles {
  typography?: {
    fontFamily?: string;
    fontSize?: string; // preset token, e.g. "lg"
    fontWeight?: number; // 400 | 500 | 600 | 700
    lineHeight?: number; // unitless, 1.0 – 2.0
    textAlign?: "left" | "center" | "right";
  };
  colors?: {
    text?: string; // hex
  };
  spacing?: {
    padding?: string; // preset tokens only — "none" | "xs" | … | "2xl"
    margin?: string; // preset tokens only
  };
  borders?: {
    radius?: string; // preset token
    width?: string; // preset token: none | thin | medium | thick
    color?: string; // hex
  };
  background?: {
    color?: string; // hex
    image?: string; // relative "assets/…" path
  };
}

/** One uploaded file inside the project's assets/ folder. */
export interface AssetRecord {
  id: string;
  /** File name inside assets/ — the stored reference. Always relative. */
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
  /** Schema version — "0.1" during development, "1.0" at release. */
  version: string;
  name: string;
  createdAt: string; // ISO date
  updatedAt: string; // ISO date
  pages: Page[];
  assets: AssetRecord[];
}

/** Convenience: the active page (v1 = pages[0]). */
export function activePage(project: Project): Page {
  return project.pages[0];
}
