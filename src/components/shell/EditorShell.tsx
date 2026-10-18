/**
 * EditorShell — the full editor: one DndContext wrapping the panel (drag
 * sources) and the canvas (drop targets), the 3-pane grid, and the drag
 * overlay ghost. DnD handlers resolve every hover through resolveTarget
 * (the locked drop rules) and commit once on dragEnd.
 */

import {
  DndContext,
  DragOverlay,
  PointerSensor,
  pointerWithin,
  useSensor,
  useSensors,
  type DragOverEvent,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { REGISTRY } from "@/blocks/registry";
import { activePage, type BlockType } from "@/types/blocks";
import { useEditor } from "@/store/editor";
import {
  DndUiProvider,
  isBelowOverCenter,
  resolveTarget,
  useDndUi,
  type ActiveDrag,
} from "@/components/canvas/dnd";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { TopBar } from "./TopBar";
import { BlocksPanel } from "./BlocksPanel";
import { Canvas } from "./Canvas";
import { InspectorPanel } from "./InspectorPanel";

export function EditorShell() {
  return (
    <DndUiProvider>
      <EditorShellInner />
    </DndUiProvider>
  );
}

function EditorShellInner() {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
  );
  const { dropTarget, setDropTarget, activeDrag, setActiveDrag } = useDndUi();
  useKeyboardShortcuts();

  const readDragged = (data: Record<string, unknown> | undefined): ActiveDrag | null => {
    if (!data) return null;
    if (data.source === "panel" && typeof data.blockType === "string") {
      return { source: "panel", blockType: data.blockType as BlockType };
    }
    if (data.source === "tree" && typeof data.id === "string" && typeof data.blockType === "string") {
      return { source: "tree", id: data.id, blockType: data.blockType as BlockType };
    }
    return null;
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveDrag(readDragged(event.active.data.current));
  };

  const handleDragOver = (event: DragOverEvent) => {
    const dragged = readDragged(event.active.data.current);
    const tree = activePage(useEditor.getState().project).tree;
    const below = isBelowOverCenter(event.active, event.over);
    setDropTarget(resolveTarget(dragged, event.over, tree, below));
  };

  const handleDragEnd = (_event: DragEndEvent) => {
    // Commit exactly what the insertion line promised.
    const store = useEditor.getState();
    if (activeDrag && dropTarget) {
      if (activeDrag.source === "panel") {
        store.addBlock(activeDrag.blockType, dropTarget.parentId, dropTarget.index);
      } else {
        store.moveBlock(activeDrag.id, dropTarget.parentId, dropTarget.index);
      }
    }
    setDropTarget(null);
    setActiveDrag(null);
  };

  const handleDragCancel = () => {
    setDropTarget(null);
    setActiveDrag(null);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={pointerWithin}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="grid h-screen w-screen grid-cols-[260px_minmax(0,1fr)_300px] grid-rows-[48px_minmax(0,1fr)] overflow-hidden bg-background text-foreground">
        <TopBar />
        <BlocksPanel />
        <Canvas />
        <InspectorPanel />
      </div>

      <DragOverlay>
        {activeDrag && <DragGhost type={activeDrag.blockType} />}
      </DragOverlay>
    </DndContext>
  );
}

function DragGhost({ type }: { type: BlockType }) {
  const meta = REGISTRY[type];
  const Icon = meta.icon;
  return (
    <div className="flex items-center gap-2 rounded-md border bg-white px-3 py-2 text-xs font-medium text-neutral-700 shadow-lg">
      <Icon className="size-4" />
      {meta.label}
    </div>
  );
}
