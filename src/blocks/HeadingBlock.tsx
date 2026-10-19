import { EditableText } from "@/components/canvas/EditableText";
import { useBlockStyles } from "@/lib/useBlockStyles";
import { useEditor } from "@/store/editor";
import type { HeadingProps } from "@/types/blocks";
import type { BlockComponentProps } from "./shared";

const TAG = { 1: "h1", 2: "h2", 3: "h3", 4: "h4" } as const;

/** Heading — h1–h4 by `level`, clamp-scaled by the base CSS. Fully inline-editable. */
export function HeadingBlock({ block }: BlockComponentProps) {
  const props = block.props as HeadingProps;
  const updateProps = useEditor((s) => s.updateProps);
  const style = useBlockStyles(block);

  const Tag = TAG[props.level ?? 2];

  return (
    <Tag className="lw-heading" style={style}>
      <EditableText
        blockId={block.id}
        value={props.text}
        onChange={(text) => updateProps(block.id, { text })}
      />
    </Tag>
  );
}
