import { EditableText } from "@/components/canvas/EditableText";
import { useEditor } from "@/store/editor";
import type { ButtonProps } from "@/types/blocks";
import type { BlockComponentProps } from "./shared";

/**
 * Button — an ANCHOR, never a form submit (locked: no forms, CTA links only).
 */
export function ButtonBlock({ block }: BlockComponentProps) {
  const props = block.props as ButtonProps;
  const updateProps = useEditor((s) => s.updateProps);

  return (
    <a
      href={props.href}
      onClick={(e) => e.preventDefault()} // canvas is not a browser
      className="inline-block rounded-md bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white"
    >
      <EditableText
        blockId={block.id}
        value={props.label}
        onChange={(label) => updateProps(block.id, { label })}
      />
    </a>
  );
}
