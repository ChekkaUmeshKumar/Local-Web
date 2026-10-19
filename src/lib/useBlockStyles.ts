/**
 * useBlockStyles — the CANVAS-side consumer of resolveStyles.
 * Converts stored relative asset paths to asset-protocol URLs so
 * background images actually render inside the editor. The export
 * generator (Phase 4) calls resolveStyles directly with relative paths.
 */

import { useMemo } from "react";
import type { CSSProperties } from "react";
import type { BlockNode } from "@/types/blocks";
import { resolveStyles } from "@/lib/resolveStyles";
import { displaySrc } from "@/lib/display-src";
import { useEditor } from "@/store/editor";

export function useBlockStyles(block: BlockNode): CSSProperties {
  const projectDir = useEditor((s) => s.projectDir);

  return useMemo(
    () =>
      resolveStyles(block.styles, {
        resolveAsset: (rel) => displaySrc(rel, projectDir),
      }),
    [block.styles, projectDir],
  );
}
