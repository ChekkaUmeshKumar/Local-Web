import { Image as ImageIcon } from "lucide-react";
import type { ImageProps } from "@/types/blocks";
import type { BlockComponentProps } from "./shared";

/** Image — file picker arrives in Phase 3; for now an honest placeholder. */
export function ImageBlock({ block }: BlockComponentProps) {
  const props = block.props as ImageProps;

  if (!props.src) {
    return (
      <figure className="flex h-48 w-full max-w-lg items-center justify-center rounded-md border-2 border-dashed border-neutral-300 bg-neutral-50">
        <figcaption className="flex flex-col items-center gap-2 text-xs text-neutral-400">
          <ImageIcon className="size-6" />
          Image — pick a file in Phase 3
        </figcaption>
      </figure>
    );
  }

  return (
    <img
      src={props.src}
      alt={props.alt}
      className="max-h-96 w-auto max-w-full rounded-md object-cover"
    />
  );
}
