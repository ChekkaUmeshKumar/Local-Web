import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { EditorShell } from "@/components/shell/EditorShell";

/**
 * LocalWeb — app root. The editor shell is the whole v1 interface;
 * a start screen (choose / open project) arrives with the project
 * lifecycle step and templates later.
 */
export default function App() {
  return (
    <TooltipProvider delayDuration={300}>
      <EditorShell />
      <Toaster position="bottom-center" richColors />
    </TooltipProvider>
  );
}
