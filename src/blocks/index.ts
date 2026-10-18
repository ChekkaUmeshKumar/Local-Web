import type { ComponentType } from "react";
import type { BlockType } from "@/types/blocks";
import { NavbarBlock } from "./NavbarBlock";
import { HeroBlock } from "./HeroBlock";
import { HeadingBlock } from "./HeadingBlock";
import { TextBlock } from "./TextBlock";
import { ImageBlock } from "./ImageBlock";
import { ButtonBlock } from "./ButtonBlock";
import { LinkBlock } from "./LinkBlock";
import { FooterBlock } from "./FooterBlock";
import type { BlockComponentProps } from "./shared";

/** BlockType → canvas component. The renderer reads only this map. */
export const BLOCK_COMPONENTS: Record<BlockType, ComponentType<BlockComponentProps>> = {
  navbar: NavbarBlock,
  hero: HeroBlock,
  heading: HeadingBlock,
  text: TextBlock,
  image: ImageBlock,
  button: ButtonBlock,
  link: LinkBlock,
  footer: FooterBlock,
};
