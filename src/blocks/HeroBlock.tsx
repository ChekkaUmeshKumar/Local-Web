import type { BlockComponentProps } from "./shared";

/**
 * Hero — prebuilt section. All content lives in its children
 * (heading + text + button by default); this component only provides
 * the section shell and the children slot (drop zone added by renderer).
 */
export function HeroBlock({ children }: BlockComponentProps) {
  return (
    <section className="flex flex-col items-center justify-center gap-4 bg-neutral-50 px-6 py-16 text-center">
      <div className="flex w-full max-w-2xl flex-col items-center gap-4">
        {children}
      </div>
    </section>
  );
}
