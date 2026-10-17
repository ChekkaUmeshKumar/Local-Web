/**
 * Center canvas — the page surface.
 * Phase 2 renders the actual block tree here; for now it shows the
 * empty-canvas hint on a white "paper" (light surface inside dark chrome,
 * mimicking a webpage).
 */
export function Canvas() {
  return (
    <main className="h-full min-w-0 flex-1 overflow-hidden bg-neutral-100 p-6 dark:bg-neutral-900/40">
      <div className="mx-auto h-full w-full max-w-[1100px] overflow-y-auto rounded-lg border bg-white shadow-sm">
        <div className="flex h-full min-h-[400px] flex-col items-center justify-center gap-2 p-10 text-center text-neutral-400">
          <p className="text-sm font-medium text-neutral-500">
            Your page will appear here
          </p>
          <p className="max-w-sm text-xs leading-relaxed">
            1. Drag a block from the left panel &nbsp;·&nbsp; 2. Click text to
            edit &nbsp;·&nbsp; 3. Preview &nbsp;·&nbsp; 4. Export
          </p>
        </div>
      </div>
    </main>
  );
}
