/**
 * Shared types + constants for the site generator.
 * (Standalone so html/css/js modules can import them without cycles.)
 */

import type { Project } from "@/types/blocks";

export interface GeneratedSite {
  html: string;
  css: string;
  js: string;
}

export interface GenerateOptions {
  /**
   * Maps a stored relative path ("assets/foo.png") to a loadable URL.
   *   preview: (rel) => convertFileSrc(projectDir + "/" + rel)
   *   export:  identity — relative paths, so the site works over file://
   */
  resolveAsset: (relative: string) => string;
}

/** The export default: paths stay exactly as stored. */
export const identityAsset = (relative: string): string => relative;

/** Exact tags the PREVIEW replaces with inline <style>/<script> blocks. */
export const STYLES_PLACEHOLDER = '<link rel="stylesheet" href="styles.css">';
export const SCRIPT_PLACEHOLDER = '<script src="script.js"></script>';

/** Lucide-style hamburger icon (export output has no icon libraries). */
export const MENU_ICON_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="18" y2="18"/></svg>';

/**
 * Escape a string for safe interpolation into HTML text/attribute context.
 * Entities are built by concatenation so they can never be "optimized"
 * into raw characters. e.g. AMP + "amp;" = "&" + "amp;".
 */
const AMP = String.fromCharCode(38); // &

export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, AMP + "amp;")
    .replace(/</g, AMP + "lt;")
    .replace(/>/g, AMP + "gt;")
    .replace(/"/g, AMP + "quot;")
    .replace(/'/g, AMP + "#39;");
}

/** The tree being generated (v1 = the single active page). */
export function treeOf(project: Project): import("@/types/blocks").BlockNode[] {
  return project.pages[0].tree;
}
