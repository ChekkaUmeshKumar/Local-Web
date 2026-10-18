/**
 * Drag & drop plumbing shared by the whole editor:
 *
 *   - DndUiProvider / useDndUi: cross-component state for the current drop
 *     target (drives the 2px insertion line) and the active drag (DragOverlay).
 *   - resolveTarget: THE single function enforcing the locked drop rules
 *     (§ "who can be dropped where"):
 *
 *         navbar | hero | footer   → root only
 *         heading|text|image|button|link → root, hero, footer
 *
 *     Invalid pairs simply never produce a target — the drag snaps back.
 *
 * Drop-target resolution (pointer-wins geometry):
 *   - over "root" (the paper)            → append at end of root
 *   - over "<id>:container" (inner zone) → sections: root-adjacent to that
 *                                          section; elements: append inside
 *   - over a block                       → element: before/after it in its
 *                                          parent; section: before/after the
 *                                          block's TOP-LEVEL ancestor at root
 */

import { createContext, useContext, useState, type ReactNode } from "react";
import type { Active, Over } from "@dnd-kit/core";
import type { BlockNode, BlockType } from "@/types/blocks";
import { isSection } from "@/blocks/registry";
import { findBlock } from "@/lib/tree";

/* ── shared UI state (context) ───────────────────────────────────── */

export interface DropTarget {
  parentId: string | null;
  index: number;
}

export type ActiveDrag =
  | { source: "panel"; blockType: BlockType }
  | { source: "tree"; id: string; blockType: BlockType };

interface DndUiState {
  dropTarget: DropTarget | null;
  setDropTarget: (t: DropTarget | null) => void;
  activeDrag: ActiveDrag | null;
  setActiveDrag: (d: ActiveDrag | null) => void;
}

const DndUiContext = createContext<DndUiState | null>(null);

export function DndUiProvider({ children }: { children: ReactNode }) {
  const [dropTarget, setDropTargetState] = useState<DropTarget | null>(null);
  const [activeDrag, setActiveDrag] = useState<ActiveDrag | null>(null);

  // Avoid a re-render storm on every pointer move: skip identical targets.
  const setDropTarget = (t: DropTarget | null) =>
    setDropTargetState((prev) =>
      prev === null || t === null
        ? prev === t
          ? prev
          : t
        : prev.parentId === t.parentId && prev.index === t.index
          ? prev
          : t,
    );

  return (
    <DndUiContext.Provider value={{ dropTarget, setDropTarget, activeDrag, setActiveDrag }}>
      {children}
    </DndUiContext.Provider>
  );
}

export function useDndUi(): DndUiState {
  const ctx = useContext(DndUiContext);
  if (!ctx) throw new Error("useDndUi must be used within DndUiProvider");
  return ctx;
}

/** The 2px blue insertion line rendered between blocks during a drag. */
export function DropLine() {
  return <div aria-hidden className="relative z-20 h-0.5 w-full rounded bg-blue-500" />;
}

/* ── drop resolution ─────────────────────────────────────────────── */

/** Is the dragged item's center below the hovered item's center? */
export function isBelowOverCenter(active: Active, over: Over | null): boolean {
  const a = active.rect.current.translated;
  const o = over?.rect;
  if (!a || !o) return false;
  return a.top + a.height / 2 > o.top + o.height / 2;
}

/**
 * Compute the drop target for the current drag, or null when the hovered
 * position is invalid for the dragged block type (snap back).
 */
export function resolveTarget(
  dragged: ActiveDrag | null,
  over: Over | null,
  tree: BlockNode[],
  below: boolean,
): DropTarget | null {
  if (!dragged || !over) return null;

  const overId = String(over.id);
  const data = (over.data?.current ?? {}) as Record<string, unknown>;
  const draggedIsSection = isSection(dragged.blockType);

  // Hovering the root paper → append at the end of the page.
  if (overId === "root") return { parentId: null, index: tree.length };

  // Hovering a section's inner container zone.
  if (data.source === "container" && typeof data.containerParentId === "string") {
    const containerId = data.containerParentId;
    const section = findBlock(tree, containerId);
    if (!section) return null;

    if (draggedIsSection) {
      // Sections only ever land at root: drop before/after this section.
      return { parentId: null, index: section.index + (below ? 1 : 0) };
    }
    // Elements drop inside the section (append at end of its children).
    return { parentId: containerId, index: section.block.children?.length ?? 0 };
  }

  // Hovering a specific block (sortable).
  if (data.source === "tree") {
    const loc = findBlock(tree, overId);
    if (!loc) return null;

    if (draggedIsSection) {
      // Resolve to the hovered block's TOP-LEVEL ancestor and drop beside it.
      let topId = overId;
      let parentId = loc.parentId;
      while (parentId !== null) {
        const parentLoc = findBlock(tree, parentId);
        if (!parentLoc) break;
        topId = parentId;
        parentId = parentLoc.parentId;
      }
      const topIndex = tree.findIndex((b) => b.id === topId);
      if (topIndex === -1) return null;
      return { parentId: null, index: topIndex + (below ? 1 : 0) };
    }

    const overBlockType = data.blockType as BlockType;
    if (isSection(overBlockType) && loc.parentId === null) {
      // Pointer is on a section OUTSIDE its inner zone → root-adjacent.
      // (navbar never shows an inner zone, so this also covers it.)
      return { parentId: null, index: loc.index + (below ? 1 : 0) };
    }

    // Element beside an element (root or inside a section).
    return { parentId: loc.parentId, index: loc.index + (below ? 1 : 0) };
  }

  return null;
}
