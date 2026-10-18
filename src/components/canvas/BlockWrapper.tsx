/**
 * BlockWrapper — the editor chrome around ONE block instance on the canvas:
 * hover outline, selection outline, floating mini-toolbar, and (since it is
 * also a sortable item) drag support for moving blocks around.
 *
 * Selection UX: first click anywhere on the block selects it. Entering
 * text-edit mode is driven by EditableText (second click on a text region)
 * — it stops propagation, so this wrapper only handles plain clicks.
 */

import type { ReactNode } from "react";
import { toast } from "sonner";
import { ArrowDown, ArrowUp, Copy, Trash2 } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { activePage } from "@/types/blocks";
import type { BlockNode } from "@/types/blocks";
import { findBlock } from "@/lib/tree";
import { useEditor } from "@/store/editor";

interface BlockWrapperProps {
  block: BlockNode;
  parentId: string | null;
  children: ReactNode;
}

export function BlockWrapper({ block, parentId, children }: BlockWrapperProps) {
  const selectedId = useEditor((s) => s.selectedId);
  const select = useEditor((s) => s.select);
  const removeBlock = useEditor((s) => s.removeBlock);
  const duplicateBlock = useEditor((s) => s.duplicateBlock);
  const moveBlock = useEditor((s) => s.moveBlock);
  const editingTextId = useEditor((s) => s.editingTextId);

  const isSelected = selectedId === block.id;

  // Typing and dragging must not fight each other.
  const isEditingThisText =
    editingTextId !== null && editingTextId.split("#")[0] === block.id;

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({
      id: block.id,
      data: { source: "tree", blockType: block.type, parentId },
      disabled: isEditingThisText,
    });

  const nudge = (dir: -1 | 1) => {
    const tree = activePage(useEditor.getState().project).tree;
    const loc = findBlock(tree, block.id);
    if (!loc) return;
    const siblings =
      loc.parentId === null
        ? tree
        : (findBlock(tree, loc.parentId)?.block.children ?? []);
    const target = loc.index + dir;
    if (target < 0 || target >= siblings.length) return; // parent boundary
    moveBlock(block.id, loc.parentId, target);
  };

  const handleDelete = () => {
    removeBlock(block.id);
    toast("Block deleted", { description: "Ctrl+Z to undo" });
  };

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      {...attributes}
      {...listeners}
      className={cn(
        "group relative touch-none",
        isSelected
          ? "outline-2 outline-solid outline-blue-500 outline-offset-2"
          : "hover:outline-1 hover:outline-dashed hover:outline-neutral-400 hover:outline-offset-2",
        isDragging && "opacity-40",
      )}
      onClick={(e) => {
        e.stopPropagation();
        select(block.id);
      }}
    >
      {children}

      {isSelected && (
        <div
          className="absolute -top-3 right-2 z-30 flex items-center gap-0.5 rounded-md border bg-white p-0.5 shadow-md"
          onClick={(e) => e.stopPropagation()} // keep selection when using tools
        >
          <Button
            variant="ghost"
            size="icon"
            className="size-6"
            title="Move up"
            onClick={() => nudge(-1)}
          >
            <ArrowUp />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-6"
            title="Move down"
            onClick={() => nudge(1)}
          >
            <ArrowDown />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-6"
            title="Duplicate"
            onClick={() => duplicateBlock(block.id)}
          >
            <Copy />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-6 text-red-600"
            title="Delete"
            onClick={handleDelete}
          >
            <Trash2 />
          </Button>
        </div>
      )}
    </div>
  );
}
