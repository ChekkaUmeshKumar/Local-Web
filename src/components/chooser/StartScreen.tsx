/**
 * Start screen — the first thing every user sees. Three template cards
 * (the moment of "wow"), plus blank/open and recents.
 */

import { useEffect, useState } from "react";
import { Clock, FilePlus2, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { loadRecents, projectFilePath, type RecentProject } from "@/lib/io";
import { loadAndHydrate, openProjectFlow } from "@/lib/project-actions";
import { TEMPLATES } from "@/templates";
import type { TemplateDef } from "@/templates/types";
import { NewProjectDialog } from "./NewProjectDialog";

export function StartScreen() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [template, setTemplate] = useState<TemplateDef | null>(null);
  const [recents, setRecents] = useState<RecentProject[]>([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void loadRecents().then(setRecents);
  }, []);

  const openBlank = () => {
    setTemplate(null);
    setDialogOpen(true);
  };

  const openTemplate = (picked: TemplateDef) => {
    setTemplate(picked);
    setDialogOpen(true);
  };

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
    <div className="flex h-screen w-screen flex-col items-center justify-center gap-10 overflow-y-auto bg-background p-8 text-foreground">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">LocalWeb</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Build a website in minutes — free, local, yours.
        </p>
      </div>

      {/* Templates — the headline feature of the start screen */}
      <div className="w-full max-w-4xl">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {TEMPLATES.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => openTemplate(t)}
              disabled={busy}
              className="group flex flex-col rounded-lg border bg-card p-3 text-left transition-all hover:-translate-y-0.5 hover:border-foreground/25 hover:shadow-lg disabled:opacity-50"
            >
              <div
                className="mb-3 overflow-hidden rounded-md border"
                // Our own static SVG wireframes — trusted content.
                dangerouslySetInnerHTML={{ __html: t.thumbnail }}
              />
              <p className="text-sm font-semibold">{t.name}</p>
              <p className="min-h-8 text-xs leading-4 text-muted-foreground">{t.tagline}</p>
              <p className="pt-2 text-xs font-medium text-foreground/60 transition-colors group-hover:text-foreground">
                Use template →
              </p>
            </button>
          ))}
        </div>
      </div>

      <div className="w-full max-w-xl">
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            className="h-20 flex-col gap-2 text-sm"
            onClick={openBlank}
            disabled={busy}
          >
            <FilePlus2 className="size-5" />
            Blank project
          </Button>
          <Button
            variant="outline"
            className="h-20 flex-col gap-2 text-sm"
            onClick={() => void handleOpen()}
            disabled={busy}
          >
            <FolderOpen className="size-5" />
            Open existing…
          </Button>
        </div>

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

      <NewProjectDialog open={dialogOpen} onOpenChange={setDialogOpen} template={template} />
    </div>
  );
}
