/**
 * SettingsTab — per-type props editing (everything that is NOT a style):
 *
 *   heading: level H1–H4
 *   image:   alt text (file picker arrives with the asset pipeline)
 *   button:  label · href · open-in-new-tab
 *   link:    label · href
 *   navbar:  brand · links list editor
 *   footer:  brand · copyright · links list editor
 *   hero / text: content lives on the canvas (click to edit)
 */

import { Images } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type {
  BlockNode,
  ButtonProps,
  FooterProps,
  HeadingProps,
  ImageProps,
  LinkProps,
  NavLink,
} from "@/types/blocks";
import { useEditor } from "@/store/editor";
import { LinksEditor } from "./LinksEditor";
import { TextInputField } from "./TextInputField";

interface SettingsTabProps {
  block: BlockNode;
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <Label className="shrink-0 text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

export function SettingsTab({ block }: SettingsTabProps) {
  const updateProps = useEditor((s) => s.updateProps);

  switch (block.type) {
    /* ── heading ─────────────────────────────────────────────── */
    case "heading": {
      const props = block.props as HeadingProps;
      return (
        <div className="flex flex-col gap-4 px-4 py-4">
          <Row label="Level">
            <ToggleGroup
              type="single"
              value={String(props.level ?? 2)}
              onValueChange={(v) => updateProps(block.id, { level: Number(v || 2) })}
              variant="outline"
              size="sm"
            >
              {[1, 2, 3, 4].map((level) => (
                <ToggleGroupItem key={level} value={String(level)} className="h-7 px-2.5 text-[11px]">
                  H{level}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </Row>
        </div>
      );
    }

    /* ── image ───────────────────────────────────────────────── */
    case "image": {
      const props = block.props as ImageProps;
      return (
        <div className="flex flex-col gap-4 px-4 py-4">
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            disabled
            title="File picking arrives with the asset pipeline (this phase)"
          >
            <Images />
            {props.src ? "Replace image…" : "Choose image…"}
          </Button>
          <div className="flex flex-col gap-2">
            <Label className="text-xs text-muted-foreground">Alt text</Label>
            <TextInputField
              value={props.alt}
              onChange={(alt) => updateProps(block.id, { alt })}
              placeholder="Describe the image"
              className="h-8 text-xs"
            />
          </div>
        </div>
      );
    }

    /* ── button ──────────────────────────────────────────────── */
    case "button": {
      const props = block.props as ButtonProps;
      return (
        <div className="flex flex-col gap-4 px-4 py-4">
          <div className="flex flex-col gap-2">
            <Label className="text-xs text-muted-foreground">Label</Label>
            <TextInputField
              value={props.label}
              onChange={(label) => updateProps(block.id, { label })}
              className="h-8 text-xs"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label className="text-xs text-muted-foreground">Link (href)</Label>
            <TextInputField
              value={props.href}
              onChange={(href) => updateProps(block.id, { href })}
              placeholder="https://… or #section"
              className="h-8 font-mono text-[11px]"
            />
          </div>
          <Row label="Open in new tab">
            <Switch
              checked={Boolean(props.newTab)}
              onCheckedChange={(newTab) => updateProps(block.id, { newTab })}
            />
          </Row>
        </div>
      );
    }

    /* ── link ────────────────────────────────────────────────── */
    case "link": {
      const props = block.props as LinkProps;
      return (
        <div className="flex flex-col gap-4 px-4 py-4">
          <div className="flex flex-col gap-2">
            <Label className="text-xs text-muted-foreground">Label</Label>
            <TextInputField
              value={props.label}
              onChange={(label) => updateProps(block.id, { label })}
              className="h-8 text-xs"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label className="text-xs text-muted-foreground">Link (href)</Label>
            <TextInputField
              value={props.href}
              onChange={(href) => updateProps(block.id, { href })}
              placeholder="https://… or #section"
              className="h-8 font-mono text-[11px]"
            />
          </div>
        </div>
      );
    }

    /* ── navbar ──────────────────────────────────────────────── */
    case "navbar": {
      const props = block.props as { brand: string; links: NavLink[] };
      return (
        <div className="flex flex-col gap-4 px-4 py-4">
          <div className="flex flex-col gap-2">
            <Label className="text-xs text-muted-foreground">Brand</Label>
            <TextInputField
              value={props.brand}
              onChange={(brand) => updateProps(block.id, { brand })}
              className="h-8 text-xs"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label className="text-xs text-muted-foreground">Links</Label>
            <LinksEditor
              links={props.links}
              onChange={(links) => updateProps(block.id, { links })}
            />
          </div>
        </div>
      );
    }

    /* ── footer ───────────────────────────────────────────────── */
    case "footer": {
      const props = block.props as FooterProps;
      return (
        <div className="flex flex-col gap-4 px-4 py-4">
          <div className="flex flex-col gap-2">
            <Label className="text-xs text-muted-foreground">Brand</Label>
            <TextInputField
              value={props.brand}
              onChange={(brand) => updateProps(block.id, { brand })}
              className="h-8 text-xs"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label className="text-xs text-muted-foreground">Copyright</Label>
            <TextInputField
              value={props.text}
              onChange={(text) => updateProps(block.id, { text })}
              className="h-8 text-xs"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label className="text-xs text-muted-foreground">Links</Label>
            <LinksEditor
              links={props.links}
              onChange={(links) => updateProps(block.id, { links })}
            />
          </div>
        </div>
      );
    }

    /* ── hero / text ──────────────────────────────────────────── */
    default:
      return (
        <div className="px-4 py-6 text-center text-xs leading-relaxed text-muted-foreground">
          Content lives on the canvas.
          <br />
          Click text there to edit it.
        </div>
      );
  }
}
