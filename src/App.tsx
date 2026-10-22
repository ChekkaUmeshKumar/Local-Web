import { useEffect } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { EditorShell } from "@/components/shell/EditorShell";
import { StartScreen } from "@/components/chooser/StartScreen";
import { useEditor } from "@/store/editor";

/**
 * LocalWeb — app root. Shows the start screen until a project is open,
 * then the full editor shell. One source of truth: `projectDir !== null`.
 * The window title mirrors the project (with the dirty dot).
 */
export default function App() {
  const hasProject = useEditor((s) => s.projectDir !== null);
  const projectName = useEditor((s) => s.project.name);
  const dirty = useEditor((s) => s.dirty);

  useEffect(() => {
    const title = hasProject
      ? `${dirty ? "● " : ""}${projectName || "Untitled"} — LocalWeb`
      : "LocalWeb";
    void getCurrentWindow().setTitle(title).catch(() => {});
  }, [hasProject, projectName, dirty]);

  return (
    <TooltipProvider delayDuration={300}>
      {hasProject ? <EditorShell /> : <StartScreen />}
      <Toaster position="bottom-center" richColors />
    </TooltipProvider>
  );
}
