import { MousePointerSquareDashed } from "lucide-react";
import { activePage } from "@/types/blocks";
import { useEditor } from "@/store/editor";
import { BlockRenderer } from "@/components/canvas/BlockRenderer";

/**
 * Canvas — the page surface. Renders the block tree from the store on a
 * white "paper" inside dark editor chrome. Clicking the empty paper
 * deselects.
 */
export function Canvas() {
  const tree = useEditor((s) => activePage(s.project).tree);
  const select = useEditor((s) => s.select);

  return (
    <main
      className="h-full min-w-0 flex-1 overflow-y-auto bg-neutral-100 p-6 dark:bg-neutral-900/40"
      onClick={(e) => {
        if (e.target === e.currentTarget) select(null); // click on empty canvas
      }}
    >
      <div className="mx-auto w-full max-w-[1100px]">
        <div className="min-h-[70vh] rounded-lg border bg-white p-0 shadow-sm">
          {tree.length === 0 ? (
            <EmptyCanvasHint />
          ) : (
            <div className="flex flex-col">
              {tree.map((block) => (
                <BlockRenderer key={block.id} block={block} parentId={null} />
              ))}
            </div>
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
