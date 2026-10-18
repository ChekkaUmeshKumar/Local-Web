import { EditableText } from "@/components/canvas/EditableText";
import { useEditor } from "@/store/editor";
import type { FooterProps } from "@/types/blocks";
import type { BlockComponentProps } from "./shared";

/**
 * Footer — brand + links row on top, children slot (drop zone) and the
 * copyright line below. Links are edited in the panel (Phase 3).
 */
export function FooterBlock({ block, children }: BlockComponentProps) {
  const props = block.props as FooterProps;
  const updateProps = useEditor((s) => s.updateProps);

  return (
    <footer className="bg-neutral-900 px-6 py-8 text-neutral-400">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <EditableText
          blockId={block.id}
          region="brand"
          value={props.brand}
          onChange={(brand) => updateProps(block.id, { brand })}
          className="text-sm font-semibold text-neutral-100"
        />
        <nav className="flex items-center gap-5">
          {props.links.map((link) => (
            <a
              key={link.id}
              href={link.href}
              onClick={(e) => e.preventDefault()} // canvas is not a browser
              className="text-xs text-neutral-400 hover:text-neutral-100"
            >
              {link.label}
            </a>
          ))}
        </nav>
      </div>

      <div className="mt-5 flex flex-col items-start gap-4">
        {children}
        <EditableText
          blockId={block.id}
          region="text"
          value={props.text}
          onChange={(text) => updateProps(block.id, { text })}
          className="text-xs text-neutral-500"
        />
      </div>
    </footer>
  );
}
