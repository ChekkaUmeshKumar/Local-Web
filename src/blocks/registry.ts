/**
 * The block registry — ONE place that describes every block type:
 * the left panel, the canvas, default content, and (Phase 3) the inspector
 * all read from this table. Adding a block in a future version starts here.
 *
 * Builder model (locked): the page is a stack of SECTIONS at the root;
 * ELEMENTS live inside sections (hero / footer accept children) or at root.
 */

import { nanoid } from "nanoid";
import {
  Heading,
  Image as ImageIcon,
  Link2,
  MousePointerClick,
  PanelBottom,
  PanelTop,
  Sparkles,
  Type,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type {
  BlockNode,
  BlockProps,
  BlockType,
  FooterProps,
  NavbarProps,
} from "@/types/blocks";

export interface BlockMeta {
  type: BlockType;
  label: string;
  icon: LucideIcon;
  group: "section" | "element";
  /** Sections with acceptsChildren render a child drop zone on the canvas. */
  acceptsChildren: boolean;
  /** Content shown when the block is added — the canvas must never look broken. */
  defaultProps: BlockProps;
  /** Prebuilt sections: blocks auto-added as children on creation. */
  defaultChildren?: BlockType[];
}

const navLinks = () => [
  { id: nanoid(8), label: "Home", href: "#" },
  { id: nanoid(8), label: "About", href: "#" },
  { id: nanoid(8), label: "Contact", href: "#" },
];

const footerLinks = () => [
  { id: nanoid(8), label: "Privacy", href: "#" },
  { id: nanoid(8), label: "Contact", href: "#" },
];

export const REGISTRY: Record<BlockType, BlockMeta> = {
  navbar: {
    type: "navbar",
    label: "Navbar",
    icon: PanelTop,
    group: "section",
    acceptsChildren: false,
    defaultProps: { brand: "Your Brand", links: navLinks() },
  },
  hero: {
    type: "hero",
    label: "Hero",
    icon: Sparkles,
    group: "section",
    acceptsChildren: true,
    defaultProps: {},
    defaultChildren: ["heading", "text", "button"],
  },
  heading: {
    type: "heading",
    label: "Heading",
    icon: Heading,
    group: "element",
    acceptsChildren: false,
    defaultProps: { text: "A headline that sells", level: 2 },
  },
  text: {
    type: "text",
    label: "Text",
    icon: Type,
    group: "element",
    acceptsChildren: false,
    defaultProps: {
      text: "Welcome to your new site.\nReplace this with your own story.",
    },
  },
  image: {
    type: "image",
    label: "Image",
    icon: ImageIcon,
    group: "element",
    acceptsChildren: false,
    defaultProps: { src: "", alt: "Describe this image" },
  },
  button: {
    type: "button",
    label: "Button",
    icon: MousePointerClick,
    group: "element",
    acceptsChildren: false,
    defaultProps: { label: "Get started", href: "#", newTab: false },
  },
  link: {
    type: "link",
    label: "Link",
    icon: Link2,
    group: "element",
    acceptsChildren: false,
    defaultProps: { label: "Read more", href: "#" },
  },
  footer: {
    type: "footer",
    label: "Footer",
    icon: PanelBottom,
    group: "section",
    acceptsChildren: true,
    defaultProps: { brand: "Your Brand", text: "© 2026 Your Name", links: footerLinks() },
  },
};

/** Create a block instance: fresh id, cloned defaults, prebuilt children. */
export function createBlock(type: BlockType): BlockNode {
  const meta = REGISTRY[type];
  const block: BlockNode = {
    id: nanoid(10),
    type,
    props: structuredClone(meta.defaultProps) as BlockProps,
    styles: {},
  };

  // NavLink ids must be unique per instance (edited as lists later).
  if (block.type === "navbar" || block.type === "footer") {
    const props = block.props as NavbarProps | FooterProps;
    props.links = props.links.map((link) => ({ ...link, id: nanoid(8) }));
  }

  if (meta.defaultChildren) {
    block.children = meta.defaultChildren.map((childType) => createBlock(childType));
  }
  return block;
}

export function isSection(type: BlockType): boolean {
  return REGISTRY[type].group === "section";
}

export function acceptsChildren(type: BlockType): boolean {
  return REGISTRY[type].acceptsChildren;
}
