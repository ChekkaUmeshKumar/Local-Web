/**
 * Project lifecycle orchestration: io (disk) + store (hydrate) + toasts.
 * Shared by the start screen, the top bar and the keyboard shortcuts so
 * every entry point behaves identically.
 */

import { toast } from "sonner";
import { open as openFileDialog } from "@tauri-apps/plugin-dialog";
import { activePage } from "@/types/blocks";
import { useEditor } from "@/store/editor";
import type { TemplateDef } from "@/templates/types";
import {
  addRecentProject,
  CorruptedProjectError,
  createProjectFromSeed,
  createProjectOnDisk,
  openProjectFromDisk,
  parentDir,
  projectFilePath,
  restoreBackupToMain,
  saveProjectToDisk,
} from "@/lib/io";

/** True when the user has a project open. */
export function hasOpenProject(): boolean {
  return useEditor.getState().projectDir !== null;
}

/** Ctrl+S / Save button: write the current project and clear the dirty dot. */
export async function saveCurrentProject(): Promise<boolean> {
  const { project, projectDir } = useEditor.getState();
  if (!projectDir) return false;

  try {
    await saveProjectToDisk(project, projectDir);
    useEditor.getState().markSaved();
    toast.success("Saved", { description: "project.json updated" });
    return true;
  } catch (err) {
    toast.error("Save failed", { description: String(err) });
    return false;
  }
}

/** Create a new project folder on disk and open it in the editor. */
export async function createProjectFlow(name: string, parentDir: string): Promise<boolean> {
  try {
    const { project, dir } = await createProjectOnDisk(name, parentDir);
    useEditor.getState().hydrate(project, dir);
    await addRecentProject({ name: project.name, dir, updatedAt: new Date().toISOString() });
    toast.success("Project created", { description: dir });
    return true;
  } catch (err) {
    toast.error("Couldn't create the project", {
      description: err instanceof Error ? err.message : String(err),
    });
    return false;
  }
}

/** Create a project pre-filled from a template (sample assets included). */
export async function createTemplateProjectFlow(
  name: string,
  parentDir: string,
  template: TemplateDef,
): Promise<boolean> {
  try {
    const { project, dir } = await createProjectFromSeed(name, parentDir, template.create(name));
    useEditor.getState().hydrate(project, dir);
    await addRecentProject({ name: project.name, dir, updatedAt: new Date().toISOString() });
    toast.success(`${template.name} project created`, {
      description: "Everything is editable — make it yours.",
    });
    return true;
  } catch (err) {
    toast.error("Couldn't create the project", {
      description: err instanceof Error ? err.message : String(err),
    });
    return false;
  }
}

/** Open flow: pick a project.json via dialog → load → hydrate. */
export async function openProjectFlow(): Promise<boolean> {
  const jsonPath = await openFileDialog({
    multiple: false,
    title: "Open a LocalWeb project",
    filters: [{ name: "LocalWeb project", extensions: ["json"] }],
  });
  if (typeof jsonPath !== "string") return false; // cancelled
  return loadAndHydrate(jsonPath);
}

/** Open a specific project.json path (recents use this). */
export async function loadAndHydrate(jsonPath: string): Promise<boolean> {
  try {
    const loaded = await openProjectFromDisk(jsonPath);
    useEditor.getState().hydrate(loaded.project, loaded.dir);
    await addRecentProject({
      name: loaded.project.name,
      dir: loaded.dir,
      updatedAt: new Date().toISOString(),
    });
    return true;
  } catch (err) {
    if (err instanceof CorruptedProjectError && err.backupAvailable) {
      // The last save's backup survives — offer a one-click restore.
      toast.error("Project file is corrupted", {
        description: "A backup from the last save exists.",
        action: {
          label: "Restore backup",
          onClick: () => void restoreBackupAndOpen(jsonPath),
        },
      });
      return false;
    }
    toast.error("Couldn't open the project", {
      description: err instanceof Error ? err.message : String(err),
    });
    return false;
  }
}

/** Restore the rotated backup over the corrupted file, then open it. */
export async function restoreBackupAndOpen(jsonPath: string): Promise<void> {
  try {
    await restoreBackupToMain(parentDir(jsonPath));
    toast.success("Backup restored");
    await loadAndHydrate(jsonPath);
  } catch (err) {
    toast.error("Couldn't restore the backup", {
      description: err instanceof Error ? err.message : String(err),
    });
  }
}

/** Convenience for dialogs: the full path of the current project file. */
export function currentProjectFilePath(): string | null {
  const dir = useEditor.getState().projectDir;
  return dir ? projectFilePath(dir) : null;
}

/** Convenience: the active tree (v1 = pages[0]). */
export function currentTree() {
  return activePage(useEditor.getState().project).tree;
}
