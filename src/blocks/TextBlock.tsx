import { EditableText } from "@/components/canvas/EditableText";
import { resolveStyles } from "@/lib/resolveStyles";
import { useEditor } from "@/store/editor";
import type { TextProps } from "@/types/blocks";
import type { BlockComponentProps } from "./shared";

/**
 * Text — one copy block; "\n" separates paragraphs and renders as line
 * breaks via `.lw-text { white-space: pre-line }` (base CSS) — canvas and
 * export render identically from the same stored string.
 */
export function TextBlock({ block }: BlockComponentProps) {
  const props = block.props as TextProps;
  const updateProps = useEditor((s) => s.updateProps);

  return (
    <div className="lw-text" style={resolveStyles(block.styles)}>
      <EditableText
        blockId={block.id}
        value={props.text}
        onChange={(text) => updateProps(block.id, { text })}
        multiline
        className="block min-h-[1em]"
      />
    </div>
  );
}
