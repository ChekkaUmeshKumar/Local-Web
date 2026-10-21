/**
 * PreviewFrame — the dress rehearsal for export.
 *
 * Renders the GENERATOR's actual output (generateSite) in a sandboxed
 * iframe — not the React canvas. If it looks right here, it exports
 * right. That is the payoff of the shared-resolver architecture.
 *
 * - Devices: desktop 1280 · tablet 768 · mobile 390 (the locked widths)
 * - Scale-to-fit: shrinks the frame when the window is narrower, with a
 *   visible zoom %
 * - Live updates: regenerates on store change, debounced ~250ms so
 *   typing stays smooth
 * - styles.css / script.js references are inlined into the srcDoc (an
 *   iframe has no files)
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { Monitor, Smartphone, Tablet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { generateSite, type GeneratedSite } from "@/export/generator";
import { SCRIPT_PLACEHOLDER, STYLES_PLACEHOLDER } from "@/export/shared";
import { displaySrc } from "@/lib/display-src";
import { useEditor } from "@/store/editor";

const DEVICES = { desktop: 1280, tablet: 768, mobile: 390 } as const;
export type Device = keyof typeof DEVICES;

/** Replace the file references with inline tags — srcdoc has no files. */
export function buildPreviewDocument(site: GeneratedSite): string {
  return site.html
    .replace(STYLES_PLACEHOLDER, `<style>\n${site.css}\n</style>`)
    .replace(SCRIPT_PLACEHOLDER, `<script>\n${site.js}\n</script>`);
}

function useDebounced<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(id);
  }, [value, delayMs]);
  return debounced;
}

interface PreviewFrameProps {
  device: Device;
  onDeviceChange: (device: Device) => void;
}

export function PreviewFrame({ device, onDeviceChange }: PreviewFrameProps) {
  const project = useEditor((s) => s.project);
  const projectDir = useEditor((s) => s.projectDir);

  const debouncedProject = useDebounced(project, 250);

  const site = useMemo(
    () =>
      generateSite(debouncedProject, {
        resolveAsset: (rel) => displaySrc(rel, projectDir),
      }),
    [debouncedProject, projectDir],
  );
  const doc = useMemo(() => buildPreviewDocument(site), [site]);

  // Measure the available width so wide devices can scale down to fit.
  const wrapRef = useRef<HTMLDivElement>(null);
  const [available, setAvailable] = useState(0);
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) =>
      setAvailable(entries[0].contentRect.width),
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const width = DEVICES[device];
  const fit = available > 0 ? Math.min(1, available / width) : 1;
  const frameWidth = Math.round(fit * width);

  return (
    <div
      ref={wrapRef}
      className="h-full min-w-0 flex-1 overflow-hidden bg-neutral-100 p-6 dark:bg-neutral-900/40"
    >
      <div className="mx-auto flex h-full flex-col" style={{ width: frameWidth }}>
        <div className="flex items-center justify-center gap-1 pb-3">
          <Button
            variant={device === "desktop" ? "secondary" : "ghost"}
            size="icon"
            className="size-7"
            title="Desktop — 1280px"
            onClick={() => onDeviceChange("desktop")}
          >
            <Monitor />
          </Button>
          <Button
            variant={device === "tablet" ? "secondary" : "ghost"}
            size="icon"
            className="size-7"
            title="Tablet — 768px"
            onClick={() => onDeviceChange("tablet")}
          >
            <Tablet />
          </Button>
          <Button
            variant={device === "mobile" ? "secondary" : "ghost"}
            size="icon"
            className="size-7"
            title="Mobile — 390px"
            onClick={() => onDeviceChange("mobile")}
          >
            <Smartphone />
          </Button>
          <span className="ml-2 font-mono text-xs text-muted-foreground">{width}px</span>
          {fit < 1 && (
            <span className="ml-1 text-xs text-muted-foreground">
              · {Math.round(fit * 100)}%
            </span>
          )}
        </div>

        <div className="min-h-0 flex-1 overflow-hidden rounded-lg border-4 border-neutral-300 bg-white shadow-lg dark:border-neutral-700">
          {/* Height compensates the uniform scale so the page fills the frame. */}
          <iframe
            title="Site preview"
            srcDoc={doc}
            sandbox="allow-scripts"
            style={{
              width,
              height: `${100 / fit}%`,
              border: "none",
              transform: `scale(${fit})`,
              transformOrigin: "top left",
            }}
          />
        </div>
      </div>
    </div>
  );
}
