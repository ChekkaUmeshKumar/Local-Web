/**
 * EditableText — inline text editing on the canvas.
 *
 * The four contentEditable rules that keep React and the caret from
 * fighting (this component exists because of them):
 *
 *   RULE 1  Never write text from state while the element is focused —
 *           a re-render would reset the caret. Write only when the span
 *           is not the active element.
 *   RULE 2  Commit on blur / Enter — one store update per committed edit
 *           (never per keystroke), which is also exactly one undo step.
 *   RULE 3  Escape cancels: restore the original text, stay selected.
 *   RULE 4  Global undo/redo shortcuts are ignored while a region is
 *           being edited (see useKeyboardShortcuts) — native text undo
 *           keeps working inside the region.
 *
 * Activation UX: the first click on a block selects it (handled by
 * BlockWrapper); a second click on a text region starts editing THAT
 * region — blocks can own several regions (footer brand vs. copyright).
 */

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { useEditor } from "@/store/editor";

interface EditableTextProps {
  blockId: string;
  /** Region suffix — only for blocks with several editable spots (e.g. footer). */
  region?: string;
  value: string;
  onChange: (text: string) => void;
  /** Multiline allows Shift+Enter line breaks; Enter still commits. */
  multiline?: boolean;
  className?: string;
}

function normalize(text: string, multiline: boolean): string {
  const t = text.replace(/\r\n/g, "\n");
  if (!multiline) return t.replace(/\n/g, " ").trim();
  return t.replace(/^\n+/, "").replace(/\n+$/, "");
}

export function EditableText({
  blockId,
  region,
  value,
  onChange,
  multiline = false,
  className,
}: EditableTextProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const key = region ? `${blockId}#${region}` : blockId;

  const editing = useEditor((s) => s.editingTextId === key);
  const blockSelected = useEditor((s) => s.selectedId === blockId);
  const setEditingText = useEditor((s) => s.setEditingText);

  // RULE 1: only write text into the DOM while the span is NOT focused.
  useEffect(() => {
    if (ref.current && document.activeElement !== ref.current) {
      ref.current.innerText = value;
    }
  }, [value]);

  // Entering edit mode: focus and place the caret at the end.
  useEffect(() => {
    if (editing && ref.current) {
      ref.current.focus();
      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(ref.current);
      range.collapse(false);
      selection?.removeAllRanges();
      selection?.addRange(range);
    }
  }, [editing]);

  // RULE 2: commit once — on blur or Enter.
  const commit = () => {
    const next = normalize(ref.current?.innerText ?? value, multiline);
    if (next !== value) onChange(next);
    setEditingText(null);
  };

  // RULE 3: restore the original text and stay selected.
  const cancel = () => {
    if (ref.current) ref.current.innerText = value;
    setEditingText(null);
    ref.current?.blur();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!editing) return;
    if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation(); // don't bubble to the global deselect
      cancel();
    } else if (e.key === "Enter" && !e.shiftKey && !multiline) {
      e.preventDefault();
      commit();
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    // Second click on an already-selected block → edit THIS text region.
    if (!editing && blockSelected) {
      e.stopPropagation(); // BlockWrapper should not re-handle the click
      setEditingText(key);
    }
  };

  return (
    <span
      ref={ref}
      contentEditable={editing}
      suppressContentEditableWarning
      spellCheck={false}
      className={cn(
        "lw-editable outline-none",
        editing ? "cursor-text" : "cursor-pointer",
        className,
      )}
      onBlur={editing ? commit : undefined}
      onKeyDown={handleKeyDown}
      onClick={handleClick}
    />
  );
}
