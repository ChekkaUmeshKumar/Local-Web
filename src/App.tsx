import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { TopBar } from "@/components/shell/TopBar";
import { BlocksPanel } from "@/components/shell/BlocksPanel";
import { Canvas } from "@/components/shell/Canvas";
import { InspectorPanel } from "@/components/shell/InspectorPanel";

/**
 * LocalWeb editor shell (Phase 1: static layout, no logic).
 *
 *   ┌────────────── Top bar (48px) ───────────────┐
 *   │ BlocksPanel │ Canvas (flex) │ InspectorPanel │
 *   └─────────────┴───────────────┴────────────────┘
 */
export default function App() {
  return (
    <TooltipProvider delayDuration={300}>
      <div className="grid h-screen w-screen grid-cols-[260px_minmax(0,1fr)_300px] grid-rows-[48px_minmax(0,1fr)] overflow-hidden bg-background text-foreground">
        <TopBar />
        <BlocksPanel />
        <Canvas />
        <InspectorPanel />
      </div>
      <Toaster position="bottom-center" richColors />
    </TooltipProvider>
  );
}
