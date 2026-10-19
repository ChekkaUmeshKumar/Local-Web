import { EditableText } from "@/components/canvas/EditableText";
import { useBlockStyles } from "@/lib/useBlockStyles";
import { useEditor } from "@/store/editor";
import type { FooterProps } from "@/types/blocks";
import type { BlockComponentProps } from "./shared";

/**
 * Footer — brand + links row on top, children slot (drop zone) and the
 * copyright line below. Links are edited in the Settings tab.
 */
export function FooterBlock({ block, children }: BlockComponentProps) {
  const props = block.props as FooterProps;
  const updateProps = useEditor((s) => s.updateProps);
  const style = useBlockStyles(block);

  return (
    <footer className="lw-footer" style={style}>
      <div className="lw-footer__top">
        <span className="lw-footer__brand">
          <EditableText
            blockId={block.id}
            region="brand"
            value={props.brand}
            onChange={(brand) => updateProps(block.id, { brand })}
          />
        </span>

        <nav className="lw-footer__links">
          {props.links.map((link) => (
            <a key={link.id} href={link.href} onClick={(e) => e.preventDefault()}>
              {link.label}
            </a>
          ))}
        </nav>
      </div>

      <div className="lw-footer__body">
        {children}
        <span className="lw-footer__copy">
          <EditableText
            blockId={block.id}
            region="text"
            value={props.text}
            onChange={(text) => updateProps(block.id, { text })}
          />
        </span>
      </div>
    </footer>
  );
}
