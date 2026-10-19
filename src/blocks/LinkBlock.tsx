import { EditableText } from "@/components/canvas/EditableText";
import { useBlockStyles } from "@/lib/useBlockStyles";
import { useEditor } from "@/store/editor";
import type { LinkProps } from "@/types/blocks";
import type { BlockComponentProps } from "./shared";

/** Link — inline text link. */
export function LinkBlock({ block }: BlockComponentProps) {
  const props = block.props as LinkProps;
  const updateProps = useEditor((s) => s.updateProps);
  const style = useBlockStyles(block);

  return (
    <a
      className="lw-link"
      href={props.href}
      style={style}
      onClick={(e) => e.preventDefault()} // canvas is not a browser
    >
      <EditableText
        blockId={block.id}
        value={props.label}
        onChange={(label) => updateProps(block.id, { label })}
      />
    </a>
  );
}
