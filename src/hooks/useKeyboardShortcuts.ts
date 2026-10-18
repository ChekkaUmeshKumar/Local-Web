/**
 * Global keyboard shortcuts (editor only):
 *
 *   Ctrl+S            save (works even while typing — universal reflex)
 *   Ctrl+Z             undo        ┐ disabled while a text region is
 *   Ctrl+Shift+Z / Y   redo        ┘ being edited (Rule 4) or a field
 *   Delete / Backspace remove the selected block
 *   Escape             deselect
 *
 * While editing text, ALL of these except Ctrl+S are left to the focused
 * region — native text undo keeps working, and Delete must never nuke a
 * block out from under the caret.
 */

import { useEffect } from "react";
import { toast } from "sonner";
import { hasOpenProject, saveCurrentProject } from "@/lib/project-actions";
import { redoEditor, undoEditor, useEditor } from "@/store/editor";

function isTypingInField(): boolean {
  const el = document.activeElement;
  if (!el) return false;
  const tag = el.tagName;
  return (
    tag === "INPUT" ||
    tag === "TEXTAREA" ||
    tag === "SELECT" ||
    (tag !== undefined && (el as HTMLElement).isContentEditable)
  );
}

export function useKeyboardShortcuts() {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (!hasOpenProject()) return;

      const state = useEditor.getState();
      const mod = e.ctrlKey || e.metaKey;

      // Ctrl+S always saves — even mid-edit (best-effort; the region
      // commits on blur).
      if (mod && e.key.toLowerCase() === "s") {
        e.preventDefault();
        void saveCurrentProject();
        return;
      }

      // Everything else is deferred to the focused region / field.
      if (state.editingTextId !== null || isTypingInField()) return;

      if (mod && !e.shiftKey && e.key.toLowerCase() === "z") {
        e.preventDefault();
        undoEditor();
        return;
      }
      if ((mod && e.shiftKey && e.key.toLowerCase() === "z") || (mod && e.key.toLowerCase() === "y")) {
        e.preventDefault();
        redoEditor();
        return;
      }

      if ((e.key === "Delete" || e.key === "Backspace") && state.selectedId) {
        e.preventDefault();
        state.removeBlock(state.selectedId);
        toast("Block deleted", { description: "Ctrl+Z to undo" });
        return;
      }

      if (e.key === "Escape" && state.selectedId) {
        state.select(null);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);
}
