import type { ReactNode } from "react";
import type { BlockNode } from "@/types/blocks";

/**
 * Props every canvas block component receives. These are PURE display
 * components — editor chrome (selection, drag handles, toolbars) lives in
 * BlockWrapper, which renders each of these inside itself.
 */
export interface BlockComponentProps {
  block: BlockNode;
  /** Pre-wrapped child blocks (only for sections that accept children). */
  children?: ReactNode;
}
