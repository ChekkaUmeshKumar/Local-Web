/**
 * InspectorPanel — the right panel. Shows the selected block's header
 * (label + short id + group) and the Style / Settings tabs. Nothing
 * selected → a short hint + project name.
 */

import { useMemo } from "react";
import { REGISTRY } from "@/blocks/registry";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { activePage } from "@/types/blocks";
import { findBlock } from "@/lib/tree";
import { useEditor } from "@/store/editor";
import { StyleTab } from "@/components/inspector/StyleTab";
import { SettingsTab } from "@/components/inspector/SettingsTab";

export function InspectorPanel() {
  const selectedId = useEditor((s) => s.selectedId);
  const tree = useEditor((s) => activePage(s.project).tree);
  const projectName = useEditor((s) => s.project.name);

  const block = useMemo(
    () => (selectedId ? (findBlock(tree, selectedId)?.block ?? null) : null),
    [selectedId, tree],
  );

  if (!block) {
    return (
      <aside className="flex h-full w-[300px] shrink-0 flex-col border-l bg-background">
        <div className="px-4 py-3">
          <h2 className="text-sm font-semibold tracking-tight">Styles</h2>
          <p className="pt-1 text-xs text-muted-foreground">
            Select a block on the canvas to style it.
          </p>
        </div>
        <Separator />
        <div className="p-4 text-xs text-muted-foreground">
          Project: <span className="text-foreground">{projectName}</span>
        </div>
      </aside>
    );
  }

  const meta = REGISTRY[block.type];

  return (
    <aside className="flex h-full w-[300px] shrink-0 flex-col border-l bg-background">
      <div className="flex items-center justify-between gap-2 px-4 py-3">
        <div className="min-w-0">
          <h2 className="truncate text-sm font-semibold">{meta.label}</h2>
          <p className="font-mono text-[10px] text-muted-foreground">
            {block.id.slice(0, 6)}
          </p>
        </div>
        <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 text-[10px] uppercase text-muted-foreground">
          {meta.group}
        </span>
      </div>
      <Separator />

      <Tabs defaultValue="style" className="flex min-h-0 flex-1 flex-col">
        <TabsList className="mx-4 mt-3 grid w-auto grid-cols-2">
          <TabsTrigger value="style">Style</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="style" className="mt-3 min-h-0 flex-1">
          <ScrollArea className="h-full">
            <StyleTab block={block} />
          </ScrollArea>
        </TabsContent>

        <TabsContent value="settings" className="mt-3 min-h-0 flex-1">
          <ScrollArea className="h-full">
            <SettingsTab block={block} />
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </aside>
  );
}
