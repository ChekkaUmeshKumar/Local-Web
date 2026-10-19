import { resolveStyles } from "@/lib/resolveStyles";
import type { BlockComponentProps } from "./shared";

/**
 * Hero — prebuilt section shell. Content lives in its children (the
 * SectionDropZone renders inside lw-hero__inner). Spec-sheet markup:
 * section.lw-hero > div.lw-hero__inner > children
 */
export function HeroBlock({ block, children }: BlockComponentProps) {
  return (
    <section className="lw-hero" style={resolveStyles(block.styles)}>
      <div className="lw-hero__inner">{children}</div>
    </section>
  );
}
