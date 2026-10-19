/**
 * AssetManagerDialog — the mini asset manager: thumbnail grid with
 * "used ×N" badges and delete (only when unused). Reached from the
 * image settings and the background image picker.
 */

import { Loader2, Trash2, Upload } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { activePage } from "@/types/blocks";
import type { AssetRecord } from "@/types/blocks";
import { displaySrc } from "@/lib/display-src";
import { useEditor } from "@/store/editor";
import { countAssetUsage, pickAndImportAsset, removeUnusedAsset } from "@/lib/asset-actions";
import { useState } from "react";

interface AssetManagerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AssetManagerDialog({ open, onOpenChange }: AssetManagerDialogProps) {
  const assets = useEditor((s) => s.project.assets);
  const tree = useEditor((s) => activePage(s.project).tree);
  const projectDir = useEditor((s) => s.projectDir);
  const [busy, setBusy] = useState(false);

  const usage = (record: AssetRecord) => countAssetUsage(tree, record.fileName);

  const handleUpload = async () => {
    setBusy(true);
    await pickAndImportAsset();
    setBusy(false);
  };

  const handleDelete = async (record: AssetRecord) => {
    setBusy(true);
    await removeUnusedAsset(record);
    setBusy(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Project images</DialogTitle>
          <DialogDescription>
            Stored in the project's <code className="text-xs">assets/</code> folder. Images in
            use can't be deleted.
          </DialogDescription>
        </DialogHeader>

        {assets.length === 0 ? (
          <div className="flex h-40 flex-col items-center justify-center gap-2 rounded-md border border-dashed text-center text-muted-foreground">
            <p className="text-sm">No images yet</p>
            <p className="text-xs">Upload one from an image block or a background picker.</p>
          </div>
        ) : (
          <div className="grid max-h-96 grid-cols-3 gap-3 overflow-y-auto">
            {assets.map((record) => {
              const used = usage(record);
              return (
                <div
                  key={record.id}
                  className="flex flex-col gap-1.5 rounded-md border p-2"
                >
                  <img
                    src={displaySrc(`assets/${record.fileName}`, projectDir)}
                    alt={record.fileName}
                    className="h-24 w-full rounded-sm bg-neutral-100 object-cover"
                  />
                  <div className="flex items-center justify-between gap-1">
                    <div className="min-w-0">
                      <p className="truncate text-[11px]" title={record.fileName}>
                        {record.fileName}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {used > 0 ? `used ×${used}` : "unused"}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-6 shrink-0 text-red-600 hover:bg-red-50 hover:text-red-700"
                      title={used > 0 ? "In use — remove it from its block first" : "Delete image"}
                      disabled={busy || used > 0}
                      onClick={() => void handleDelete(record)}
                    >
                      <Trash2 />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <DialogFooter>
          <Button onClick={() => void handleUpload()} disabled={busy}>
            {busy ? <Loader2 className="animate-spin" /> : <Upload />}
            Upload image
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
