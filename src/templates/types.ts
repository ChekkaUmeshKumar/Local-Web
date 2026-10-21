/**
 * Templates are DATA, not code: each one is a factory that returns a full
 * starter project (typed BlockNode[] — the compiler enforces the model)
 * plus the sample files to copy into the project's assets/ folder.
 *
 * Blocks are built with createBlock() from the registry (never hand-rolled
 * nodes), so template trees are exactly what dragging blocks would produce.
 */

import { createBlock } from "@/blocks/registry";
import { createEmptyProject } from "@/lib/tree";
import type { AssetRecord, BlockNode, BlockProps, BlockStyles, BlockType, Project } from "@/types/blocks";

export type TemplateId = "portfolio" | "business" | "restaurant";

/** A bundled sample image (SVG source embedded at build time via ?raw). */
export interface SampleFile {
  fileName: string;
  content: string;
  type: string;
}

export interface TemplateDef {
  id: TemplateId;
  name: string;
  tagline: string;
  /** Inline SVG wireframe for the chooser card. */
  thumbnail: string;
  create(name: string): { project: Project; sampleFiles: SampleFile[] };
}

/** Concise builder for template trees: defaults + targeted overrides. */
export function b(
  type: BlockType,
  options: {
    props?: Record<string, unknown>;
    styles?: BlockStyles;
    children?: BlockNode[];
  } = {},
): BlockNode {
  const base = createBlock(type);
  const block: BlockNode = {
    ...base,
    props: { ...base.props, ...options.props } as BlockProps,
  };
  if (options.styles) block.styles = options.styles;
  if (options.children) block.children = options.children;
  return block;
}

/** Wrap the tree + asset records into a ready-to-open project. */
export function templateProject(
  name: string,
  tree: BlockNode[],
  assets: AssetRecord[],
): Project {
  const project = createEmptyProject(name);
  project.pages[0].tree = tree;
  project.assets = assets;
  return project;
}
