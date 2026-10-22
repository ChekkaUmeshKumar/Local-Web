/**
 * ExportDialog — the last step of the core flow:
 * summary → guards → format → destination → success toast.
 * Never silently skips anything: blockers, missing images and warnings
 * are all shown before the user confirms.
 */

import { useEffect, useState } from "react";
import { AlertTriangle, FileArchive, Folder, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { runExportChecks, type ExportCheck } from "@/lib/export";
import { runExportFlow } from "@/lib/export-actions";
import { useEditor } from "@/store/editor";

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function ExportDialog({ open, onOpenChange }: ExportDialogProps) {
  const project = useEditor((s) => s.project);
  const projectDir = useEditor((s) => s.projectDir);

  const [check, setCheck] = useState<ExportCheck | null>(null);
  const [mode, setMode] = useState<"zip" | "folder">("zip");
  const [skipMissing, setSkipMissing] = useState(false);
  const [busy, setBusy] = useState(false);

  // Fresh checks every time the dialog opens (snapshot of the current page).
  useEffect(() => {
    if (open) {
      setCheck(null);
      setSkipMissing(false);
      setMode("zip");
      void runExportChecks(project, projectDir).then(setCheck);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const canExport =
    check !== null &&
    check.hardBlockers.length === 0 &&
    (check.missingAssets.length === 0 || skipMissing) &&
    !busy;

  const handleExport = async () => {
    if (!canExport || busy) return;
    setBusy(true);
    const skip = skipMissing ? new Set<string>(check?.missingAssets ?? []) : new Set<string>();
    const ok = await runExportFlow(mode, skip);
    setBusy(false);
    if (ok) onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Export your site</DialogTitle>
          <DialogDescription>
            A clean static website — HTML, CSS, JS and your images. No dependencies,
            no build step: open index.html in any browser.
          </DialogDescription>
        </DialogHeader>

        {check === null ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {/* Summary */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-md border p-2">
                <p className="text-lg font-semibold leading-none">{check.blockCount}</p>
                <p className="pt-1 text-[10px] uppercase tracking-wider text-muted-foreground">
                  blocks
                </p>
              </div>
              <div className="rounded-md border p-2">
                <p className="text-lg font-semibold leading-none">{check.assetCount}</p>
                <p className="pt-1 text-[10px] uppercase tracking-wider text-muted-foreground">
                  images
                </p>
              </div>
              <div className="rounded-md border p-2">
                <p className="text-lg font-semibold leading-none">
                  {formatBytes(check.estimatedBytes)}
                </p>
                <p className="pt-1 text-[10px] uppercase tracking-wider text-muted-foreground">
                  est. size
                </p>
              </div>
            </div>

            {/* Hard blockers */}
            {check.hardBlockers.length > 0 && (
              <div className="rounded-md border border-red-300 bg-red-50 p-3 text-xs text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
                {check.hardBlockers.map((message) => (
                  <p key={message}>· {message}</p>
                ))}
              </div>
            )}

            {/* Missing images — opt-in skip */}
            {check.missingAssets.length > 0 && (
              <div className="rounded-md border border-amber-300 bg-amber-50 p-3 text-xs text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300">
                <p className="flex items-center gap-1.5 font-medium">
                  <AlertTriangle className="size-3.5" />
                  Missing images: {check.missingAssets.join(", ")}
                </p>
                <label className="mt-2 flex cursor-pointer items-center justify-between gap-2">
                  <span>Export anyway — these images will be skipped</span>
                  <Switch checked={skipMissing} onCheckedChange={(v) => setSkipMissing(v)} />
                </label>
              </div>
            )}

            {/* Warnings */}
            {check.warnings.length > 0 && (
              <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300">
                {check.warnings.map((message) => (
                  <p key={message}>· {message}</p>
                ))}
              </div>
            )}

            {/* Format */}
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant={mode === "zip" ? "default" : "outline"}
                onClick={() => setMode("zip")}
              >
                <FileArchive />
                ZIP archive
              </Button>
              <Button
                variant={mode === "folder" ? "default" : "outline"}
                onClick={() => setMode("folder")}
              >
                <Folder />
                Folder
              </Button>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={() => void handleExport()} disabled={!canExport}>
            {busy && <Loader2 className="animate-spin" />}
            Export
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
