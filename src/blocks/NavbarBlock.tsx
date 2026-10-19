import { Menu } from "lucide-react";
import { EditableText } from "@/components/canvas/EditableText";
import { resolveStyles } from "@/lib/resolveStyles";
import { useEditor } from "@/store/editor";
import type { NavbarProps } from "@/types/blocks";
import type { BlockComponentProps } from "./shared";

/**
 * Navbar — brand + links row + (hidden ≤768px toggle; wired in Phase 4).
 * Links are edited in the Settings tab. Spec-sheet markup:
 * header.lw-navbar > a.lw-navbar__brand + nav.lw-navbar__links + button.lw-navbar__toggle
 */
export function NavbarBlock({ block }: BlockComponentProps) {
  const props = block.props as NavbarProps;
  const updateProps = useEditor((s) => s.updateProps);

  return (
    <header className="lw-navbar" style={resolveStyles(block.styles)}>
      <a className="lw-navbar__brand" href="#" onClick={(e) => e.preventDefault()}>
        <EditableText
          blockId={block.id}
          region="brand"
          value={props.brand}
          onChange={(brand) => updateProps(block.id, { brand })}
        />
      </a>

      <nav className="lw-navbar__links">
        {props.links.map((link) => (
          <a key={link.id} href={link.href} onClick={(e) => e.preventDefault()}>
            {link.label}
          </a>
        ))}
      </nav>

      <button
        type="button"
        className="lw-navbar__toggle"
        aria-label="Toggle menu"
        onClick={(e) => e.preventDefault()}
      >
        <Menu className="size-5" />
      </button>
    </header>
  );
}
