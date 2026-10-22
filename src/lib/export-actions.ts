/**
 * Export orchestration: format dialogs + export lib + toasts.
 * Shared by the ExportDialog's Export button.
 */

import { toast } from "sonner";
import { open as openDirectoryDialog, save as saveDialog } from "@tauri-apps/plugin-dialog";
import { slugify } from "@/lib/io";
import { useEditor } from "@/store/editor";
import { exportFolder, exportZip } from "@/lib/export";

/**
 * Ask for the destination, then write the site.
 * `skipAssets` carries the consciously-skipped missing images.
 */
export async function runExportFlow(
  mode: "zip" | "folder",
  skipAssets: Set<string> = new Set(),
): Promise<boolean> {
  const { project, projectDir } = useEditor.getState();
  if (!projectDir) return false;

  const target =
    mode === "zip"
      ? await saveDialog({
          defaultPath: `${slugify(project.name)}.zip`,
          filters: [{ name: "ZIP archive", extensions: ["zip"] }],
        })
      : await openDirectoryDialog({
          directory: true,
          title: "Choose where to export the site folder",
        });

  if (typeof target !== "string" || target.length === 0) return false; // cancelled

  try {
    if (mode === "zip") {
      await exportZip(project, projectDir, target, skipAssets);
      toast.success("Exported!", {
        description: "Unzip and open index.html — that's your site.",
      });
    } else {
      await exportFolder(project, projectDir, target, skipAssets);
      toast.success("Exported!", {
        description: "Open the folder and double-click index.html.",
      });
    }
    return true;
  } catch (err) {
    toast.error("Couldn't export the site", {
      description: err instanceof Error ? err.message : String(err),
    });
    return false;
  }
}
