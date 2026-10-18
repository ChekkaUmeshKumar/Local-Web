/**
 * Start screen — shown when no project is open. v1 Phase 2 ships the
 * minimal version (new / open / recents); the three template cards slot
 * in here during Phase 4.
 */

import { useEffect, useState } from "react";
import { Clock, FilePlus2, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { loadRecents, projectFilePath, type RecentProject } from "@/lib/io";
import { loadAndHydrate, openProjectFlow } from "@/lib/project-actions";
import { NewProjectDialog } from "./NewProjectDialog";

export function StartScreen() {
  const [newOpen, setNewOpen] = useState(false);
  const [recents, setRecents] = useState<RecentProject[]>([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void loadRecents().then(setRecents);
  }, []);

  const handleOpen = async () => {
    setBusy(true);
    await openProjectFlow();
    setBusy(false);
  };

  const handleRecent = async (recent: RecentProject) => {
    setBusy(true);
    await loadAndHydrate(projectFilePath(recent.dir));
    setBusy(false);
  };

  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center gap-10 bg-background p-8 text-foreground">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">LocalWeb</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Build a website in minutes — free, local, yours.
        </p>
      </div>

      <div className="w-full max-w-xl">
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            className="h-24 flex-col gap-2 text-sm"
            onClick={() => setNewOpen(true)}
          >
            <FilePlus2 className="size-5" />
            New blank project
          </Button>
          <Button
            variant="outline"
            className="h-24 flex-col gap-2 text-sm"
            onClick={() => void handleOpen()}
            disabled={busy}
          >
            <FolderOpen className="size-5" />
            Open existing…
          </Button>
        </div>

        <p className="pt-3 text-center text-xs text-muted-foreground">
          Templates — portfolio · business · restaurant — arrive in Phase 4
        </p>

        {recents.length > 0 && (
          <section className="pt-6">
            <h2 className="flex items-center gap-1.5 px-1 pb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              <Clock className="size-3" />
              Recent projects
            </h2>
            <div className="flex flex-col gap-1.5">
              {recents.map((recent) => (
                <button
                  key={recent.dir}
                  onClick={() => void handleRecent(recent)}
                  disabled={busy}
                  className="flex items-center justify-between gap-4 rounded-md border bg-card px-4 py-3 text-left transition-colors hover:bg-accent disabled:opacity-50"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{recent.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{recent.dir}</p>
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {new Date(recent.updatedAt).toLocaleDateString()}
                  </span>
                </button>
              ))}
            </div>
          </section>
        )}
      </div>

      <NewProjectDialog open={newOpen} onOpenChange={setNewOpen} />
    </div>
  );
}
