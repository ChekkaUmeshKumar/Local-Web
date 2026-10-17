import { toast } from "sonner";
import { Eye, Package, Save } from "lucide-react";
import { open } from "@tauri-apps/plugin-dialog";
import { readTextFile, writeFile } from "@tauri-apps/plugin-fs";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

/**
 * DEV-ONLY Phase 1 smoke test (removed in Phase 2 when real save/load lands).
 * Proves the app can: pick a folder → write a JSON file → read it back.
 * This is the riskiest capability in the product — verified before any
 * feature work is built on top of it.
 */
async function ioSmokeTest() {
  try {
    const dir = await open({ directory: true, title: "Pick a test folder" });
    if (!dir || typeof dir !== "string") return;

    const path = `${dir}/localweb-io-test.json`;
    const payload = { ok: true, testedAt: new Date().toISOString() };

    await writeFile(path, new TextEncoder().encode(JSON.stringify(payload)));
    const read = await readTextFile(path);
    const parsed = JSON.parse(read) as { ok: boolean };

    if (parsed.ok === true) {
      toast.success("Disk I/O works ✔", {
        description: `Wrote and read back ${path}`,
      });
    } else {
      toast.error("IO test failed", { description: "Read-back mismatch." });
    }
  } catch (err) {
    toast.error("IO test failed", {
      description: String(err),
    });
  }
}

export function TopBar() {
  return (
    <header className="col-span-3 flex h-12 shrink-0 items-center gap-3 border-b bg-background px-4">
      {/* App identity */}
      <span className="text-sm font-semibold tracking-tight">LocalWeb</span>
      <span className="text-border">/</span>

      {/* Project name — static placeholder until Phase 2 wiring */}
      <span className="text-sm text-muted-foreground">Untitled project</span>
      <span className="size-1.5 rounded-full bg-amber-500" title="Unsaved changes" />

      <div className="flex-1" />

      {/* DEV-ONLY: Phase 1 IO smoke test */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size="sm"
            variant="ghost"
            className="font-mono text-xs text-muted-foreground"
            onClick={() => void ioSmokeTest()}
          >
            IO test
          </Button>
        </TooltipTrigger>
        <TooltipContent>Phase 1 check: write & read a JSON file</TooltipContent>
      </Tooltip>

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

      {/* Save — disabled placeholder until Phase 2 */}
      <Tooltip>
        <TooltipTrigger asChild>
          <span>
            <Button size="sm" variant="ghost" disabled>
              <Save />
            </Button>
          </span>
        </TooltipTrigger>
        <TooltipContent>Save (Ctrl+S) arrives in Phase 2</TooltipContent>
      </Tooltip>
    </header>
  );
}
