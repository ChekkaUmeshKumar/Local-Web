/**
 * Asset orchestration: file dialog + importAsset + store + toasts.
 * Shared by the image settings, background image picker and the
 * asset manager dialog.
 */

import { toast } from "sonner";
import { open as openFileDialog } from "@tauri-apps/plugin-dialog";
import { activePage } from "@/types/blocks";
import type { AssetRecord, BlockNode } from "@/types/blocks";
import { walk } from "@/lib/tree";
import {
  deleteAssetFromDisk,
  importAsset,
  IMAGE_DIALOG_FILTERS,
} from "@/lib/io";
import { useEditor } from "@/store/editor";

/** How many blocks reference this asset? (props.src + background.image) */
export function countAssetUsage(tree: BlockNode[], fileName: string): number {
  let count = 0;
  walk(tree, (block) => {
    const src = (block.props as { src?: string }).src;
    if (typeof src === "string" && src.endsWith(`/${fileName}`)) count++;

    const bg = block.styles.background?.image;
    if (typeof bg === "string" && bg.endsWith(`/${fileName}`)) count++;
  });
  return count;
}

/**
 * File dialog → validate → copy into assets/ → store record.
 * Returns the record (callers build the relative "assets/<name>" reference)
 * or null when the user cancelled.
 */
export async function pickAndImportAsset(): Promise<AssetRecord | null> {
  const { projectDir } = useEditor.getState();
  if (!projectDir) return null;

  const source = await openFileDialog({
    multiple: false,
    title: "Choose an image",
    filters: IMAGE_DIALOG_FILTERS,
  });
  if (typeof source !== "string") return null; // cancelled

  try {
    const record = await importAsset(source, projectDir);
    useEditor.getState().addAsset(record);
    toast.success("Image imported", { description: record.fileName });
    return record;
  } catch (err) {
    toast.error("Couldn't import the image", {
      description: err instanceof Error ? err.message : String(err),
    });
    return null;
  }
}

/**
 * Delete an asset (file + record) — only when nothing references it.
 * Returns true when deleted.
 */
export async function removeUnusedAsset(record: AssetRecord): Promise<boolean> {
  const s = useEditor.getState();
  if (!s.projectDir) return false;

  const usage = countAssetUsage(activePage(s.project).tree, record.fileName);
  if (usage > 0) {
    toast.error("Image is in use", {
      description: `Used by ${usage} block${usage === 1 ? "" : "s"} — remove it there first.`,
    });
    return false;
  }

  try {
    await deleteAssetFromDisk(s.projectDir, record.fileName);
    s.removeAsset(record.fileName);
    toast.success("Image deleted", { description: record.fileName });
    return true;
  } catch (err) {
    toast.error("Couldn't delete the image", { description: String(err) });
    return false;
  }
}
