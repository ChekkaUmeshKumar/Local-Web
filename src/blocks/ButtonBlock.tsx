import { EditableText } from "@/components/canvas/EditableText";
import { useBlockStyles } from "@/lib/useBlockStyles";
import { useEditor } from "@/store/editor";
import type { ButtonProps } from "@/types/blocks";
import type { BlockComponentProps } from "./shared";

/**
 * Button — an ANCHOR, never a form submit (locked: no forms, CTA links only).
 */
export function ButtonBlock({ block }: BlockComponentProps) {
  const props = block.props as ButtonProps;
  const updateProps = useEditor((s) => s.updateProps);
  const style = useBlockStyles(block);

  return (
    <a
      className="lw-btn"
      href={props.href}
      style={style}
      onClick={(e) => e.preventDefault()} // canvas is not a browser
      {...(props.newTab ? { target: "_blank", rel: "noreferrer" } : {})}
    >
      <EditableText
        blockId={block.id}
        value={props.label}
        onChange={(label) => updateProps(block.id, { label })}
      />
    </a>
  );
}
