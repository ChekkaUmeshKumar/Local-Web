import { EditableText } from "@/components/canvas/EditableText";
import { resolveStyles } from "@/lib/resolveStyles";
import { useEditor } from "@/store/editor";
import type { LinkProps } from "@/types/blocks";
import type { BlockComponentProps } from "./shared";

/** Link — inline text link. */
export function LinkBlock({ block }: BlockComponentProps) {
  const props = block.props as LinkProps;
  const updateProps = useEditor((s) => s.updateProps);

  return (
    <a
      className="lw-link"
      href={props.href}
      style={resolveStyles(block.styles)}
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
