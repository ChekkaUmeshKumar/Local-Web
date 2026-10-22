/**
 * AboutDialog — version, license and the GitHub link.
 */

import { useEffect, useState } from "react";
import { ExternalLink } from "lucide-react";
import { getVersion } from "@tauri-apps/api/app";
import { openUrl } from "@tauri-apps/plugin-opener";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const GITHUB_URL = "https://github.com/ChekkaUmeshKumar/Local-Web";

interface AboutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AboutDialog({ open, onOpenChange }: AboutDialogProps) {
  const [version, setVersion] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      void getVersion()
        .then(setVersion)
        .catch(() => setVersion(null));
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>LocalWeb</DialogTitle>
          <DialogDescription>
            A free, open-source visual website builder — drag blocks, edit
            content, export a clean static site.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3 py-2">
          <p className="text-sm text-muted-foreground">
            Version {version ?? "…"}
          </p>
          <p className="text-xs leading-relaxed text-muted-foreground">
            MIT License © 2026 ChekkaUmeshKumar.
            <br />
            Free forever — your sites live in plain folders on your machine.
          </p>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => void openUrl(GITHUB_URL).catch(() => {})}
          >
            <ExternalLink />
            View on GitHub
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
