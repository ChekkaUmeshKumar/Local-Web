/**
 * New project dialog: name + parent folder → creates
 * `<parent>/<slug>/project.json` + `assets/` and opens it.
 * In template mode, the project comes pre-filled with the template's
 * tree and its bundled sample assets.
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
import { createProjectFlow, createTemplateProjectFlow } from "@/lib/project-actions";
import type { TemplateDef } from "@/templates/types";

interface NewProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** When set, the new project starts from this template. */
  template?: TemplateDef | null;
}

export function NewProjectDialog({ open, onOpenChange, template = null }: NewProjectDialogProps) {
  const [name, setName] = useState("My Website");
  const [parentDir, setParentDir] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const defaultName = template ? template.name : "My Website";
  // Follow the selected template when it changes (cards reuse one dialog).
  const [lastTemplate, setLastTemplate] = useState<TemplateDef | null>(template);
  if (template !== lastTemplate) {
    setLastTemplate(template);
    setName(defaultName);
  }

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
    const ok = template
      ? await createTemplateProjectFlow(trimmed, parentDir, template)
      : await createProjectFlow(trimmed, parentDir);
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
          <DialogTitle>{template ? `New ${template.name} project` : "New project"}</DialogTitle>
          <DialogDescription>
            {template ? (
              <>
                Starts from the {template.name} template — everything stays editable.{" "}
                <span className="hidden">
                  <code className="text-xs">project.json</code>
                </span>
              </>
            ) : (
              <>
                Creates a new folder with a <code className="text-xs">project.json</code> and an{" "}
                <code className="text-xs">assets</code> folder inside.
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-1">
          <div className="flex flex-col gap-2">
            <Label htmlFor="project-name">Project name</Label>
            <Input
              id="project-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={defaultName}
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
            {template ? "Create from template" : "Create project"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
