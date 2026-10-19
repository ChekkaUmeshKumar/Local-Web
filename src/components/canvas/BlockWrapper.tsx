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
import { REGISTRY } from "@/blocks/registry";
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
          className="absolute -top-3 right-2 z-30 flex items-center gap-0.5 rounded-md border bg-white p-0.5 text-neutral-700 shadow-md"
          onClick={(e) => e.stopPropagation()} // keep selection when using tools
        >
          {/* Always show WHAT is selected — the #1 builder confusion fix. */}
          <span className="px-1.5 text-[10px] font-semibold text-neutral-500">
            {REGISTRY[block.type].label}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="size-6 hover:bg-neutral-100 hover:text-neutral-900"
            title="Move up"
            onClick={() => nudge(-1)}
          >
            <ArrowUp />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-6 hover:bg-neutral-100 hover:text-neutral-900"
            title="Move down"
            onClick={() => nudge(1)}
          >
            <ArrowDown />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-6 hover:bg-neutral-100 hover:text-neutral-900"
            title="Duplicate"
            onClick={() => duplicateBlock(block.id)}
          >
            <Copy />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-6 text-red-600 hover:bg-red-50 hover:text-red-700"
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
