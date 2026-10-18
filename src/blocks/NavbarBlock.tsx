import { EditableText } from "@/components/canvas/EditableText";
import { useEditor } from "@/store/editor";
import type { NavbarProps } from "@/types/blocks";
import type { BlockComponentProps } from "./shared";

/** Navbar — brand + link row. Links are edited in the panel (Phase 3). */
export function NavbarBlock({ block }: BlockComponentProps) {
  const props = block.props as NavbarProps;
  const updateProps = useEditor((s) => s.updateProps);

  return (
    <header className="flex items-center justify-between border-b border-neutral-200 bg-white px-6 py-4">
      <EditableText
        blockId={block.id}
        region="brand"
        value={props.brand}
        onChange={(brand) => updateProps(block.id, { brand })}
        className="font-semibold text-neutral-900"
      />
      <nav className="flex items-center gap-6">
        {props.links.map((link) => (
          <a
            key={link.id}
            href={link.href}
            onClick={(e) => e.preventDefault()} // canvas is not a browser
            className="text-sm text-neutral-600 hover:text-neutral-900"
          >
            {link.label}
          </a>
        ))}
      </nav>
    </header>
  );
}
