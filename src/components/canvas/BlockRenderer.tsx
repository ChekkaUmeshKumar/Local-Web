/**
 * BlockRenderer — recursively renders one block and (for sections that
 * accept children) its wrapped children. The canvas renders this for every
 * root block; it holds no state of its own — it is just a projection of the
 * store's tree.
 */

import { BLOCK_COMPONENTS } from "@/blocks";
import { REGISTRY } from "@/blocks/registry";
import type { BlockNode } from "@/types/blocks";
import { BlockWrapper } from "./BlockWrapper";

interface BlockRendererProps {
  block: BlockNode;
  parentId: string | null;
}

export function BlockRenderer({ block, parentId }: BlockRendererProps) {
  const Component = BLOCK_COMPONENTS[block.type];
  const meta = REGISTRY[block.type];

  const children = meta.acceptsChildren
    ? block.children?.map((child) => (
        <BlockRenderer key={child.id} block={child} parentId={block.id} />
      ))
    : undefined;

  return (
    <BlockWrapper block={block} parentId={parentId}>
      <Component block={block}>{children}</Component>
    </BlockWrapper>
  );
}
