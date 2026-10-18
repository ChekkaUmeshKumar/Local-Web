import { EditableText } from "@/components/canvas/EditableText";
import { useEditor } from "@/store/editor";
import type { LinkProps } from "@/types/blocks";
import type { BlockComponentProps } from "./shared";

/** Link — inline text link. */
export function LinkBlock({ block }: BlockComponentProps) {
  const props = block.props as LinkProps;
  const updateProps = useEditor((s) => s.updateProps);

  return (
    <a
      href={props.href}
      onClick={(e) => e.preventDefault()} // canvas is not a browser
      className="inline-block text-sm font-medium text-blue-600 underline underline-offset-4"
    >
      <EditableText
        blockId={block.id}
        value={props.label}
        onChange={(label) => updateProps(block.id, { label })}
      />
    </a>
  );
}
