import { Fragment } from "react";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { MousePointerSquareDashed } from "lucide-react";
import { activePage } from "@/types/blocks";
import { useEditor } from "@/store/editor";
import { BlockRenderer } from "@/components/canvas/BlockRenderer";
import { DropLine, useDndUi } from "@/components/canvas/dnd";

/**
 * Canvas — the page surface. Renders the block tree from the store on a
 * white "paper" inside dark editor chrome. The paper is the ROOT drop
 * target (append at end) and each root block is a sortable item with an
 * insertion line between them.
 */
export function Canvas() {
  const tree = useEditor((s) => activePage(s.project).tree);
  const select = useEditor((s) => s.select);

  const { setNodeRef: setRootRef, isOver: isRootOver } = useDroppable({
    id: "root",
    data: { source: "container", containerParentId: null },
  });
  const { dropTarget } = useDndUi();

  const lineAtRoot = (i: number) =>
    dropTarget !== null && dropTarget.parentId === null && dropTarget.index === i;

  return (
    <main
      className="h-full min-w-0 flex-1 overflow-y-auto bg-neutral-100 p-6 dark:bg-neutral-900/40"
      onClick={(e) => {
        if (e.target === e.currentTarget) select(null); // click on empty canvas
      }}
    >
      <div className="mx-auto w-full max-w-[1100px]">
        <div
          ref={setRootRef}
          onClick={(e) => {
            if (e.target === e.currentTarget) select(null); // click on blank paper
          }}
          className={
            "min-h-[70vh] rounded-lg border bg-white p-0 shadow-sm transition-colors " +
            (isRootOver && tree.length === 0 ? "border-blue-400" : "")
          }
        >
          {tree.length === 0 ? (
            <EmptyCanvasHint />
          ) : (
            <SortableContext
              items={tree.map((b) => b.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="flex flex-col">
                {tree.map((block, i) => (
                  <Fragment key={block.id}>
                    {lineAtRoot(i) && <DropLine />}
                    <BlockRenderer block={block} parentId={null} />
                  </Fragment>
                ))}
                {lineAtRoot(tree.length) && <DropLine />}
              </div>
            </SortableContext>
          )}
        </div>
      </div>
    </main>
  );
}

/**
 * The no-tutorial onboarding card (doubles as the empty state).
 * It directly supports the 10-minute success metric.
 */
function EmptyCanvasHint() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 p-10 text-center text-neutral-400">
      <MousePointerSquareDashed className="size-8 opacity-60" />
      <p className="text-sm font-medium text-neutral-500">
        Drag a block from the left panel to begin
      </p>
      <p className="max-w-sm text-xs leading-relaxed">
        1. Drag a block &nbsp;·&nbsp; 2. Click text to edit &nbsp;·&nbsp;
        3. Preview &nbsp;·&nbsp; 4. Export
      </p>
    </div>
  );
}
