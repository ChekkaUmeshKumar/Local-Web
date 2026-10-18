import { EditableText } from "@/components/canvas/EditableText";
import { useEditor } from "@/store/editor";
import type { TextProps } from "@/types/blocks";
import type { BlockComponentProps } from "./shared";

/** Text — one block of copy; "\n" separates paragraphs. */
export function TextBlock({ block }: BlockComponentProps) {
  const props = block.props as TextProps;
  const updateProps = useEditor((s) => s.updateProps);

  return (
    <p className="whitespace-pre-line text-base leading-relaxed text-neutral-600">
      <EditableText
        blockId={block.id}
        value={props.text}
        onChange={(text) => updateProps(block.id, { text })}
        multiline
        className="block min-h-[1em] max-w-[65ch]"
      />
    </p>
  );
}
