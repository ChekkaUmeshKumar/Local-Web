/**
 * Pure, immutable helpers for manipulating the BlockNode tree.
 *
 * Every store action is a one-liner on top of these functions. They NEVER
 * mutate their arguments — they return new arrays/objects. This is what
 * makes undo/redo (snapshot history) and React re-rendering cheap and
 * correct. If a change happened to the tree, it went through here.
 */

import { nanoid } from "nanoid";
import type {
  BlockNode,
  BlockStyles,
  FooterProps,
  NavbarProps,
  Project,
} from "@/types/blocks";
import { SCHEMA_VERSION } from "@/types/blocks";

/** Where a block sits in the tree. `parentId: null` means root. */
export interface BlockLocation {
  block: BlockNode;
  parentId: string | null;
  index: number;
}

/** Find a block (and where it lives) anywhere in the tree. */
export function findBlock(tree: BlockNode[], id: string): BlockLocation | null {
  for (let i = 0; i < tree.length; i++) {
    const block = tree[i];
    if (block.id === id) return { block, parentId: null, index: i };
    if (block.children) {
      const found = findBlock(block.children, id);
      if (found) return { block: found.block, parentId: block.id, index: found.index };
    }
  }
  return null;
}

function clampIndex(index: number, length: number): number {
  return Math.max(0, Math.min(index, length));
}

function insertInto(list: BlockNode[], index: number, block: BlockNode): BlockNode[] {
  const next = [...list];
  next.splice(clampIndex(index, next.length), 0, block);
  return next;
}

/** Insert a block at `index` inside `parentId` (null = root of the page). */
export function insertBlock(
  tree: BlockNode[],
  block: BlockNode,
  parentId: string | null,
  index: number,
): BlockNode[] {
  if (parentId === null) return insertInto(tree, index, block);
  return tree.map((node) => {
    if (node.id === parentId) {
      return { ...node, children: insertInto(node.children ?? [], index, block) };
    }
    if (node.children) {
      return { ...node, children: insertBlock(node.children, block, parentId, index) };
    }
    return node;
  });
}

/** Remove the block with `id` (and everything inside it). */
export function removeBlock(tree: BlockNode[], id: string): BlockNode[] {
  if (tree.some((block) => block.id === id)) return tree.filter((block) => block.id !== id);
  let changed = false;
  const next = tree.map((node) => {
    if (node.children) {
      const children = removeBlock(node.children, id);
      if (children !== node.children) {
        changed = true;
        return { ...node, children };
      }
    }
    return node;
  });
  return changed ? next : tree;
}

/**
 * Move a block so it ENDS UP at `index` inside `parentId` (final position
 * in the new parent — the caller computes where the item should land).
 * No-op moves return the SAME tree reference, so callers and undo can
 * cheaply detect "nothing happened".
 */
export function moveBlock(
  tree: BlockNode[],
  id: string,
  parentId: string | null,
  index: number,
): BlockNode[] {
  const loc = findBlock(tree, id);
  if (!loc) return tree;
  if (loc.parentId === parentId && index === loc.index) return tree; // no-op

  const without = removeBlock(tree, id);
  return insertBlock(without, loc.block, parentId, index);
}

/**
 * Deep-copy a block with FRESH ids for it and every descendant (and every
 * NavLink inside navbar/footer props). Duplicating without this corrupts
 * saves — two nodes sharing one id break find/remove/undo in subtle ways.
 */
export function cloneWithNewIds(block: BlockNode): BlockNode {
  const clone = structuredClone(block);
  clone.id = nanoid(10);
  if (clone.type === "navbar" || clone.type === "footer") {
    const props = clone.props as NavbarProps | FooterProps;
    props.links = props.links.map((link) => ({ ...link, id: nanoid(8) }));
  }
  clone.children = clone.children?.map(cloneWithNewIds);
  return clone;
}

/** Visit every node depth-first. `parentId` is null for root-level blocks. */
export function walk(
  tree: BlockNode[],
  fn: (block: BlockNode, parentId: string | null) => void,
): void {
  const visit = (nodes: BlockNode[], parentId: string | null) => {
    for (const node of nodes) {
      fn(node, parentId);
      if (node.children) visit(node.children, node.id);
    }
  };
  visit(tree, null);
}

/**
 * Return a new tree where the node with `id` is replaced by
 * `updater(node)`. Returns the SAME reference when nothing was found or
 * the updater returned an identical object.
 */
export function updateNode(
  tree: BlockNode[],
  id: string,
  updater: (block: BlockNode) => BlockNode,
): BlockNode[] {
  let changed = false;
  const next = tree.map((node) => {
    if (node.id === id) {
      changed = true;
      return updater(node);
    }
    if (node.children) {
      const children = updateNode(node.children, id, updater);
      if (children !== node.children) {
        changed = true;
        return { ...node, children };
      }
    }
    return node;
  });
  return changed ? next : tree;
}

/**
 * Deep-merge a style patch onto a block:
 *   - a section object in the patch merges over the existing one
 *   - a field set to `undefined` DELETES that key (fall back to base defaults)
 *   - a section that becomes empty is removed entirely
 */
export function applyStylesPatch(block: BlockNode, patch: BlockStyles): BlockNode {
  const next: Record<string, unknown> = { ...block.styles };
  for (const key of Object.keys(patch) as (keyof BlockStyles)[]) {
    const section = patch[key];
    if (section === undefined) {
      delete next[key]; // whole section cleared
      continue;
    }
    const merged: Record<string, unknown> = {
      ...((block.styles[key] as Record<string, unknown> | undefined) ?? {}),
    };
    for (const [field, value] of Object.entries(section)) {
      if (value === undefined) delete merged[field];
      else merged[field] = value;
    }
    if (Object.keys(merged).length === 0) delete next[key];
    else next[key] = merged;
  }
  return { ...block, styles: next as BlockStyles };
}

/** Map a function over the ACTIVE page's tree (v1 = pages[0]). */
export function mapActiveTree(
  project: Project,
  fn: (tree: BlockNode[]) => BlockNode[],
): Project {
  return {
    ...project,
    pages: project.pages.map((page, i) => (i === 0 ? { ...page, tree: fn(page.tree) } : page)),
  };
}

/** A brand-new project: one empty "Home" page, versioned, no assets. */
export function createEmptyProject(name: string): Project {
  const now = new Date().toISOString();
  return {
    version: SCHEMA_VERSION,
    name,
    createdAt: now,
    updatedAt: now,
    pages: [{ id: nanoid(8), name: "Home", tree: [] }],
    assets: [],
  };
}
