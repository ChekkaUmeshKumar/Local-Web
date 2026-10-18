/**
 * BlockRenderer — recursively renders one block and, for sections that
 * accept children, their inner drop zone. It holds no state of its own —
 * it is just a projection of the store's tree.
 */

import { Fragment, type ReactNode } from "react";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { BLOCK_COMPONENTS } from "@/blocks";
import { REGISTRY } from "@/blocks/registry";
import { cn } from "@/lib/utils";
import type { BlockNode } from "@/types/blocks";
import { DropLine, useDndUi } from "./dnd";
import { BlockWrapper } from "./BlockWrapper";

interface BlockRendererProps {
  block: BlockNode;
  parentId: string | null;
}

export function BlockRenderer({ block, parentId }: BlockRendererProps) {
  const meta = REGISTRY[block.type];
  const Component = BLOCK_COMPONENTS[block.type];

  const content: ReactNode = meta.acceptsChildren ? (
    <SectionDropZone block={block} />
  ) : (
    <Component block={block} />
  );

  return (
    <BlockWrapper block={block} parentId={parentId}>
      {content}
    </BlockWrapper>
  );
}

/**
 * The inner drop zone of a section (hero / footer): a droppable area plus a
 * SortableContext over its children, with the insertion indicator between
 * them. Sections without children (navbar) never render this.
 */
function SectionDropZone({ block }: { block: BlockNode }) {
  const children = block.children ?? [];
  const { setNodeRef, isOver } = useDroppable({
    id: `${block.id}:container`,
    data: { source: "container", containerParentId: block.id },
  });
  const { dropTarget } = useDndUi();

  const lineAt = (i: number) =>
    dropTarget !== null && dropTarget.parentId === block.id && dropTarget.index === i;
  const isEmpty = children.length === 0;

  return (
    <SortableContext items={children.map((c) => c.id)} strategy={verticalListSortingStrategy}>
      <div
        ref={setNodeRef}
        className={cn(
          "flex w-full flex-col gap-4",
          isEmpty &&
            "min-h-24 items-center justify-center rounded border border-dashed border-neutral-300",
          isEmpty && isOver && "border-blue-400 bg-blue-50/50",
        )}
      >
        {isEmpty ? (
          <span className="select-none text-xs text-neutral-400">Drop elements here</span>
        ) : (
          <>
            {children.map((child, i) => (
              <Fragment key={child.id}>
                {lineAt(i) && <DropLine />}
                <BlockRenderer block={child} parentId={block.id} />
              </Fragment>
            ))}
            {lineAt(children.length) && <DropLine />}
          </>
        )}
      </div>
    </SortableContext>
  );
}
