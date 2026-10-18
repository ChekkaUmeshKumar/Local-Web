import { EditableText } from "@/components/canvas/EditableText";
import { useEditor } from "@/store/editor";
import { cn } from "@/lib/utils";
import type { HeadingProps } from "@/types/blocks";
import type { BlockComponentProps } from "./shared";

const TAG = { 1: "h1", 2: "h2", 3: "h3", 4: "h4" } as const;
const SIZE = {
  1: "text-4xl",
  2: "text-3xl",
  3: "text-2xl",
  4: "text-xl",
} as const;

/** Heading — h1–h4 by `level`, fully inline-editable. */
export function HeadingBlock({ block }: BlockComponentProps) {
  const props = block.props as HeadingProps;
  const updateProps = useEditor((s) => s.updateProps);

  const level = props.level ?? 2;
  const Tag = TAG[level];

  return (
    <Tag
      className={cn(
        "font-bold tracking-tight text-neutral-900",
        SIZE[level],
      )}
    >
      <EditableText
        blockId={block.id}
        value={props.text}
        onChange={(text) => updateProps(block.id, { text })}
      />
    </Tag>
  );
}
