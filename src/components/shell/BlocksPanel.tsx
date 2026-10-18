import { useDraggable } from "@dnd-kit/core";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { REGISTRY } from "@/blocks/registry";
import type { BlockType } from "@/types/blocks";

/**
 * Left panel — the block library. Cards are drag SOURCES; the drop rules
 * (who can land where) are enforced by resolveTarget in canvas/dnd.tsx,
 * not by hiding cards — users see everything and the canvas guides them.
 */

const SECTIONS = Object.values(REGISTRY)
  .filter((meta) => meta.group === "section")
  .map((meta) => meta.type);

const ELEMENTS = Object.values(REGISTRY)
  .filter((meta) => meta.group === "element")
  .map((meta) => meta.type);

function BlockCard({ type }: { type: BlockType }) {
  const meta = REGISTRY[type];
  const Icon = meta.icon;
  const { setNodeRef, listeners, attributes, isDragging } = useDraggable({
    id: `panel:${type}`,
    data: { source: "panel", blockType: type },
  });

  return (
    <button
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={cn(
        "flex h-20 cursor-grab flex-col items-center justify-center gap-1.5 rounded-md border bg-card text-xs text-muted-foreground transition-colors hover:border-foreground/25 hover:text-foreground active:cursor-grabbing",
        isDragging && "opacity-40",
      )}
    >
      <Icon className="size-4" />
      {meta.label}
    </button>
  );
}

function Group({ title, types }: { title: string; types: BlockType[] }) {
  return (
    <section>
      <h3 className="px-1 pb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </h3>
      <div className="grid grid-cols-2 gap-2">
        {types.map((type) => (
          <BlockCard key={type} type={type} />
        ))}
      </div>
    </section>
  );
}

export function BlocksPanel() {
  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r bg-background">
      <div className="px-4 py-3">
        <h2 className="text-sm font-semibold tracking-tight">Blocks</h2>
        <p className="text-xs text-muted-foreground">Drag onto the canvas</p>
      </div>
      <Separator />
      <ScrollArea className="flex-1">
        <div className="flex flex-col gap-4 p-3">
          <Group title="Sections" types={SECTIONS} />
          <Group title="Elements" types={ELEMENTS} />
        </div>
      </ScrollArea>
    </aside>
  );
}
