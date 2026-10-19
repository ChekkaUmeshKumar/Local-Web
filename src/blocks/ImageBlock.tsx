import { Image as ImageIcon } from "lucide-react";
import { useBlockStyles } from "@/lib/useBlockStyles";
import { displaySrc } from "@/lib/display-src";
import { useEditor } from "@/store/editor";
import type { ImageProps } from "@/types/blocks";
import type { BlockComponentProps } from "./shared";

/** Image — file picking arrives with the asset pipeline (Inspector · Phase 3). */
export function ImageBlock({ block }: BlockComponentProps) {
  const props = block.props as ImageProps;
  const projectDir = useEditor((s) => s.projectDir);
  const style = useBlockStyles(block);

  return (
    <figure className="lw-image" style={style}>
      {props.src ? (
        <img src={displaySrc(props.src, projectDir)} alt={props.alt} />
      ) : (
        <figcaption className="lw-image__placeholder">
          <ImageIcon className="size-6" />
          Image — choose a file in Settings
        </figcaption>
      )}
    </figure>
  );
}
