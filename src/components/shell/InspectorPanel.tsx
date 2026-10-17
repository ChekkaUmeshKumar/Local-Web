import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

/**
 * Right panel — the Inspector.
 * Phase 3 fills it with the style controls (Typography / Colors / Spacing /
 * Borders / Background) and the per-block Settings tab.
 */
export function InspectorPanel() {
  return (
    <aside className="flex h-full w-[300px] shrink-0 flex-col border-l bg-background">
      <div className="px-4 py-3">
        <h2 className="text-sm font-semibold tracking-tight">Styles</h2>
        <p className="text-xs text-muted-foreground">
          Select a block to style it (Phase 3)
        </p>
      </div>
      <Separator />
      <ScrollArea className="flex-1">
        <div className="p-4 text-xs text-muted-foreground">
          Nothing selected.
        </div>
      </ScrollArea>
    </aside>
  );
}
