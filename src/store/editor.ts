/**
 * The editor store — the single source of truth.
 *
 * Rules that keep this project sane:
 *   1. Every change goes through a store action. Components never hold
 *      editor state of their own.
 *   2. Every tree mutation is a one-liner over a pure helper (src/lib/tree.ts).
 *   3. Undo/redo (zundo) tracks `project` ONLY — selection, editing state
 *      and UI flags never pollute history (see `partialize` + `equality`).
 *
 * Text-edit history note: commits are atomic (EditableText commits once on
 * blur/Enter, never per keystroke), so each committed edit is exactly ONE
 * history entry. While text is being edited, global undo/redo shortcuts are
 * disabled instead of pausing the tracker — pausing would skip the commit
 * itself from history (Rule 4 of the contentEditable rules).
 */

import { create, useStore } from "zustand";
import { temporal } from "zundo";
import type { TemporalState } from "zundo";
import type {
  AssetRecord,
  BlockNode,
  BlockProps,
  BlockStyles,
  BlockType,
  Project,
} from "@/types/blocks";
import { activePage } from "@/types/blocks";
import {
  applyStylesPatch,
  cloneWithNewIds,
  createEmptyProject,
  findBlock,
  insertBlock,
  mapActiveTree,
  moveBlock as moveBlockInTree,
  removeBlock as removeBlockFromTree,
  updateNode,
} from "@/lib/tree";
import { createBlock } from "@/blocks/registry";

export interface EditorState {
  project: Project;
  /** Absolute path of the project folder; null = no project open (start screen). */
  projectDir: string | null;
  selectedId: string | null;
  /** Editing region key: `<blockId>` or `<blockId>#<region>`; null = not editing. */
  editingTextId: string | null;
  dirty: boolean;

  // ── actions ──
  addBlock: (type: BlockType, parentId: string | null, index: number) => void;
  moveBlock: (id: string, parentId: string | null, index: number) => void;
  removeBlock: (id: string) => void;
  duplicateBlock: (id: string) => void;
  updateProps: (id: string, patch: Partial<BlockProps>) => void;
  updateStyles: (id: string, patch: BlockStyles) => void;
  select: (id: string | null) => void;
  setEditingText: (key: string | null) => void;
  setProjectName: (name: string) => void;
  /** Replace the whole project (New/Open). Resets history. */
  hydrate: (project: Project, dir: string) => void;
  markSaved: () => void;

  // ── assets ──
  /** Append an AssetRecord after importAsset succeeded on disk. */
  addAsset: (record: AssetRecord) => void;
  /** Remove an AssetRecord (file already deleted from disk by the caller). */
  removeAsset: (fileName: string) => void;
}

/** Only `project` participates in undo/redo — UI state never does. */
type TrackedState = Pick<EditorState, "project">;

/** Apply a tree mutation: new project, fresh updatedAt, dirty, plus extras. */
function commit(
  s: EditorState,
  tree: BlockNode[],
  extra: Partial<EditorState> = {},
): Partial<EditorState> {
  return {
    project: { ...mapActiveTree(s.project, () => tree), updatedAt: new Date().toISOString() },
    dirty: true,
    ...extra,
  };
}

/** Drop selection/editing state that no longer points at a real block. */
function pruneStaleSelection() {
  const s = useEditor.getState();
  const tree = activePage(s.project).tree;
  const next: Partial<EditorState> = {};

  if (s.selectedId && !findBlock(tree, s.selectedId)) next.selectedId = null;
  if (s.editingTextId) {
    const editingBlockId = s.editingTextId.split("#")[0];
    if (!findBlock(tree, editingBlockId)) next.editingTextId = null;
  }
  if (Object.keys(next).length > 0) useEditor.setState(next);
}

export const useEditor = create<EditorState>()(
  temporal(
    (set) => ({
      project: createEmptyProject(""),
      projectDir: null,
      selectedId: null,
      editingTextId: null,
      dirty: false,

      addBlock: (type, parentId, index) =>
        set((s) => {
          const block = createBlock(type);
          const tree = insertBlock(activePage(s.project).tree, block, parentId, index);
          return commit(s, tree, { selectedId: block.id });
        }),

      moveBlock: (id, parentId, index) =>
        set((s) => {
          const current = activePage(s.project).tree;
          const tree = moveBlockInTree(current, id, parentId, index);
          if (tree === current) return {}; // no-op
          return commit(s, tree);
        }),

      removeBlock: (id) =>
        set((s) => {
          const current = activePage(s.project).tree;
          const tree = removeBlockFromTree(current, id);
          if (tree === current) return {}; // nothing was removed
          const editingBlockId = s.editingTextId?.split("#")[0] ?? null;
          const editingStillThere = editingBlockId ? findBlock(tree, editingBlockId) !== null : true;
          return commit(s, tree, {
            selectedId: s.selectedId === id ? null : s.selectedId,
            editingTextId: editingStillThere ? s.editingTextId : null,
          });
        }),

      duplicateBlock: (id) =>
        set((s) => {
          const loc = findBlock(activePage(s.project).tree, id);
          if (!loc) return {};
          const clone = cloneWithNewIds(loc.block);
          const tree = insertBlock(activePage(s.project).tree, clone, loc.parentId, loc.index + 1);
          return commit(s, tree, { selectedId: clone.id });
        }),

      updateProps: (id, patch) =>
        set((s) => {
          const tree = updateNode(activePage(s.project).tree, id, (block) => ({
            ...block,
            props: { ...block.props, ...patch } as BlockProps,
          }));
          if (tree === activePage(s.project).tree) return {};
          return commit(s, tree);
        }),

      updateStyles: (id, patch) =>
        set((s) => {
          const tree = updateNode(activePage(s.project).tree, id, (block) =>
            applyStylesPatch(block, patch),
          );
          if (tree === activePage(s.project).tree) return {};
          return commit(s, tree);
        }),

      select: (id) => set((s) => (s.selectedId === id ? {} : { selectedId: id })),

      setEditingText: (key) => set({ editingTextId: key }),

      setProjectName: (name) =>
        set((s) => ({
          project: { ...s.project, name, updatedAt: new Date().toISOString() },
          dirty: true,
        })),

      hydrate: (project, dir) => {
        set({ project, projectDir: dir, selectedId: null, editingTextId: null, dirty: false });
        useEditor.temporal.getState().clear(); // history belongs to the previous project
      },

      markSaved: () => set({ dirty: false }),

      addAsset: (record) =>
        set((s) => ({
          project: {
            ...s.project,
            assets: [...s.project.assets, record],
            updatedAt: new Date().toISOString(),
          },
          dirty: true,
        })),

      removeAsset: (fileName) =>
        set((s) => ({
          project: {
            ...s.project,
            assets: s.project.assets.filter((a) => a.fileName !== fileName),
            updatedAt: new Date().toISOString(),
          },
          dirty: true,
        })),
    }),
    {
      limit: 50,
      partialize: (state): TrackedState => ({ project: state.project }),
      // Reference equality on the partialized slice: no-ops and pure UI
      // changes (selection, editing) never create history entries.
      equality: (past, current) => past.project === current.project,
    },
  ),
);

/* ── undo / redo ─────────────────────────────────────────────────── */

/** Undo one step, then prune selection/editing that may now dangle. */
export function undoEditor() {
  useEditor.temporal.getState().undo();
  pruneStaleSelection();
}

/** Redo one step, then prune selection/editing that may now dangle. */
export function redoEditor() {
  useEditor.temporal.getState().redo();
  pruneStaleSelection();
}

/** Reactive undo/redo for the TopBar (re-renders when history changes). */
export function useUndoRedo() {
  const pastCount = useStore(
    useEditor.temporal,
    (s: TemporalState<TrackedState>) => s.pastStates.length,
  );
  const futureCount = useStore(
    useEditor.temporal,
    (s: TemporalState<TrackedState>) => s.futureStates.length,
  );
  return {
    undo: undoEditor,
    redo: redoEditor,
    canUndo: pastCount > 0,
    canRedo: futureCount > 0,
  };
}
