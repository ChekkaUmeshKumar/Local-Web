import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { EditorShell } from "@/components/shell/EditorShell";
import { StartScreen } from "@/components/chooser/StartScreen";
import { useEditor } from "@/store/editor";

/**
 * LocalWeb — app root. Shows the start screen until a project is open,
 * then the full editor shell. One source of truth: `projectDir !== null`.
 */
export default function App() {
  const hasProject = useEditor((s) => s.projectDir !== null);

  return (
    <TooltipProvider delayDuration={300}>
      {hasProject ? <EditorShell /> : <StartScreen />}
      <Toaster position="bottom-center" richColors />
    </TooltipProvider>
  );
}
