/**
 * New project dialog: name + parent folder → creates
 * `<parent>/<slug>/project.json` + `assets/` and opens it.
 */

import { useState } from "react";
import { FolderOpen, Loader2 } from "lucide-react";
import { open as openDirectoryDialog } from "@tauri-apps/plugin-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createProjectFlow } from "@/lib/project-actions";

interface NewProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NewProjectDialog({ open, onOpenChange }: NewProjectDialogProps) {
  const [name, setName] = useState("My Website");
  const [parentDir, setParentDir] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const pickFolder = async () => {
    const dir = await openDirectoryDialog({
      directory: true,
      title: "Choose where to create your project",
    });
    if (typeof dir === "string") setParentDir(dir);
  };

  const handleCreate = async () => {
    const trimmed = name.trim();
    if (!trimmed || !parentDir || busy) return;
    setBusy(true);
    const ok = await createProjectFlow(trimmed, parentDir);
    setBusy(false);
    if (ok) {
      onOpenChange(false);
      setName("My Website"); // reset for next time
      setParentDir(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>New project</DialogTitle>
          <DialogDescription>
            Creates a new folder with a <code className="text-xs">project.json</code> and an{" "}
            <code className="text-xs">assets</code> folder inside.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-1">
          <div className="flex flex-col gap-2">
            <Label htmlFor="project-name">Project name</Label>
            <Input
              id="project-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Website"
              autoFocus
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label>Location</Label>
            <Button
              variant="outline"
              onClick={() => void pickFolder()}
              className="w-full justify-start gap-2 font-normal"
            >
              <FolderOpen className="shrink-0" />
              <span className={parentDir ? "truncate" : "truncate text-muted-foreground"}>
                {parentDir ?? "Choose a folder…"}
              </span>
            </Button>
            {parentDir && (
              <p className="break-all text-xs text-muted-foreground">
                The project folder will be created inside this location.
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => void handleCreate()}
            disabled={!name.trim() || !parentDir || busy}
          >
            {busy && <Loader2 className="animate-spin" />}
            Create project
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
