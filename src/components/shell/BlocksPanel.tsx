import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

/**
 * Left panel — the block library.
 * Phase 2 turns the placeholder list into draggable block cards
 * (Sections: navbar / hero / footer · Elements: heading / text / image / button / link).
 */
export function BlocksPanel() {
  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r bg-background">
      <div className="px-4 py-3">
        <h2 className="text-sm font-semibold tracking-tight">Blocks</h2>
        <p className="text-xs text-muted-foreground">
          Drag onto the canvas (Phase 2)
        </p>
      </div>
      <Separator />
      <ScrollArea className="flex-1">
        <div className="grid grid-cols-2 gap-2 p-3">
          {["Navbar", "Hero", "Footer", "Heading", "Text", "Image", "Button", "Link"].map(
            (label) => (
              <div
                key={label}
                className="flex h-20 items-center justify-center rounded-md border border-dashed text-xs text-muted-foreground"
              >
                {label}
              </div>
            ),
          )}
        </div>
      </ScrollArea>
    </aside>
  );
}
