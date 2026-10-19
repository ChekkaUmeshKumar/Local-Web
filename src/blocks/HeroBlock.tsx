import { useBlockStyles } from "@/lib/useBlockStyles";
import type { BlockComponentProps } from "./shared";

/**
 * Hero — prebuilt section shell. Content lives in its children (the
 * SectionDropZone renders inside lw-hero__inner). Spec-sheet markup:
 * section.lw-hero > div.lw-hero__inner > children
 */
export function HeroBlock({ block, children }: BlockComponentProps) {
  const style = useBlockStyles(block);
  return (
    <section className="lw-hero" style={style}>
      <div className="lw-hero__inner">{children}</div>
    </section>
  );
}
