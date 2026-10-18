/**
 * Top bar — project identity (name + dirty dot) and global actions:
 * New · Open · Save · Undo · Redo, with the Preview / Export placeholders
 * (Phase 4 / 5). All project-switching goes through a dirty guard.
 */

import { useState } from "react";
import { Eye, FilePlus2, FolderOpen, Package, Redo2, Save, Undo2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { NewProjectDialog } from "@/components/chooser/NewProjectDialog";
import { ConfirmDialog } from "@/components/shell/ConfirmDialog";
import { openProjectFlow, saveCurrentProject } from "@/lib/project-actions";
import { useEditor, useUndoRedo } from "@/store/editor";

export function TopBar() {
  const projectName = useEditor((s) => s.project.name);
  const projectDir = useEditor((s) => s.projectDir);
  const dirty = useEditor((s) => s.dirty);
  const { undo, redo, canUndo, canRedo } = useUndoRedo();

  const [newOpen, setNewOpen] = useState(false);
  const [pending, setPending] = useState<"new" | "open" | null>(null);
  const [busy, setBusy] = useState(false);

  // New / Open pass through the unsaved-changes guard first.
  const startNew = () => (dirty ? setPending("new") : setNewOpen(true));

  const startOpen = async () => {
    if (dirty) {
      setPending("open");
      return;
    }
    setBusy(true);
    await openProjectFlow();
    setBusy(false);
  };

  const handleDiscardAndContinue = async () => {
    if (pending === "new") setNewOpen(true);
    if (pending === "open") {
      setBusy(true);
      await openProjectFlow();
      setBusy(false);
    }
    setPending(null);
  };

  return (
    <header className="col-span-3 flex h-12 shrink-0 items-center gap-3 border-b bg-background px-4">
      {/* Project identity */}
      <span className="text-sm font-semibold tracking-tight">LocalWeb</span>
      <span className="text-border">/</span>
      <span className="max-w-56 truncate text-sm text-muted-foreground">
        {projectName || "Untitled project"}
      </span>
      {dirty && (
        <span className="size-1.5 shrink-0 rounded-full bg-amber-500" title="Unsaved changes" />
      )}

      <div className="flex-1" />

      {/* Global actions */}
      <Button variant="ghost" size="sm" onClick={startNew}>
        <FilePlus2 />
        New
      </Button>
      <Button variant="ghost" size="sm" onClick={() => void startOpen()} disabled={busy}>
        <FolderOpen />
        Open
      </Button>

      <Tooltip>
        <TooltipTrigger asChild>
          <span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => void saveCurrentProject()}
              disabled={projectDir === null}
            >
              <Save />
              Save
            </Button>
          </span>
        </TooltipTrigger>
        <TooltipContent>Save (Ctrl+S)</TooltipContent>
      </Tooltip>

      <Separator orientation="vertical" className="mx-1 h-6" />

      <Tooltip>
        <TooltipTrigger asChild>
          <span>
            <Button
              variant="ghost"
              size="icon"
              className="size-7"
              onClick={undo}
              disabled={!canUndo}
            >
              <Undo2 />
            </Button>
          </span>
        </TooltipTrigger>
        <TooltipContent>Undo (Ctrl+Z)</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <span>
            <Button
              variant="ghost"
              size="icon"
              className="size-7"
              onClick={redo}
              disabled={!canRedo}
            >
              <Redo2 />
            </Button>
          </span>
        </TooltipTrigger>
        <TooltipContent>Redo (Ctrl+Shift+Z)</TooltipContent>
      </Tooltip>

      <Separator orientation="vertical" className="mx-1 h-6" />

      {/* Phase 4 / 5 placeholders */}
      <Tooltip>
        <TooltipTrigger asChild>
          <span>
            <Button size="sm" variant="ghost" disabled>
              <Eye />
              Preview
            </Button>
          </span>
        </TooltipTrigger>
        <TooltipContent>Preview arrives in Phase 4</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <span>
            <Button size="sm" disabled>
              <Package />
              Export
            </Button>
          </span>
        </TooltipTrigger>
        <TooltipContent>Export arrives in Phase 5</TooltipContent>
      </Tooltip>

      {/* Dialogs */}
      <NewProjectDialog open={newOpen} onOpenChange={setNewOpen} />
      <ConfirmDialog
        open={pending !== null}
        onOpenChange={(o) => !o && setPending(null)}
        title="Discard unsaved changes?"
        description="You have unsaved changes. Save first (Ctrl+S) if you want to keep them — continuing will leave them behind."
        confirmLabel="Discard and continue"
        destructive
        onConfirm={() => void handleDiscardAndContinue()}
      />
    </header>
  );
}
