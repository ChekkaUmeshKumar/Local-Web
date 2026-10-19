/**
 * StyleTab — the locked control set, mapped 1:1 to BlockStyles.
 * Nothing beyond this table ships in v1 (new controls = v2 roadmap).
 *
 *   Typography: family Select · size chips · weight Select · line-height
 *               Slider (commits on release) · align icons
 *   Colors:      text ColorField
 *   Spacing:    padding / margin chips (preset scale only)
 *   Borders:    radius chips · width chips · color ColorField
 *   Background: solid ColorField (image picker arrives with assets)
 *
 * Unset keys show as "default" and simply omit the CSS property —
 * the base class (blocks.css) provides the value.
 */

import { useEffect, useState } from "react";
import { AlignCenter, AlignLeft, AlignRight, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  BORDER_WIDTH_ORDER,
  FONT_FAMILY_OPTIONS,
  FONT_SIZE_ORDER,
  FONT_WEIGHTS,
  LINE_HEIGHT_MAX,
  LINE_HEIGHT_MIN,
  LINE_HEIGHT_STEP,
  RADIUS_ORDER,
  SPACING_ORDER,
} from "@/styles/tokens";
import type {
  AlignToken,
  BlockNode,
  BorderWidthToken,
  FontFamilyToken,
  FontSizeToken,
  FontWeightToken,
  RadiusToken,
  SpacingToken,
} from "@/types/blocks";
import { useEditor } from "@/store/editor";
import { ColorField } from "./ColorField";

interface StyleTabProps {
  block: BlockNode;
}

/* ── small building blocks ────────────────────────────────────────── */

function Section({ title, isDefault, children }: { title: string; isDefault: boolean; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3 px-4 py-4">
      <div className="flex items-center justify-between">
        <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </h3>
        {isDefault && (
          <span className="text-[10px] text-muted-foreground/70">default</span>
        )}
      </div>
      {children}
    </div>
  );
}

/** Chip row; clicking the active chip again UNSETS the value ("default"). */
function ChipGroup<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T | undefined;
  options: readonly T[];
  onChange: (v: T | undefined) => void;
}) {
  return (
    <ToggleGroup
      type="single"
      value={value ?? ""}
      onValueChange={(v) => onChange((v || undefined) as T | undefined)}
      variant="outline"
      size="sm"
    >
      {options.map((option) => (
        <ToggleGroupItem key={option} value={option} className="h-7 px-2.5 text-[11px]">
          {option}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <Label className="shrink-0 text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

/* ── the tab ─────────────────────────────────────────────────────── */

export function StyleTab({ block }: StyleTabProps) {
  const updateStyles = useEditor((s) => s.updateStyles);
  const styles = block.styles;
  const t = styles.typography ?? {};

  const hasTypography = Object.keys(styles.typography ?? {}).length > 0;
  const hasColors = Boolean(styles.colors?.text);
  const hasSpacing = Boolean(styles.spacing?.padding || styles.spacing?.margin);
  const hasBorders = Boolean(
    styles.borders?.radius || styles.borders?.width || styles.borders?.color,
  );
  const hasBackground = Boolean(styles.background?.color || styles.background?.image);

  const resetAll = () =>
    updateStyles(block.id, {
      typography: undefined,
      colors: undefined,
      spacing: undefined,
      borders: undefined,
      background: undefined,
    });

  return (
    <div className="pb-6">
      <Section title="Typography" isDefault={!hasTypography}>
        <Row label="Font">
          <Select
            value={t.fontFamily ?? "__default"}
            onValueChange={(v) =>
              updateStyles(block.id, {
                typography: {
                  fontFamily: v === "__default" ? undefined : (v as FontFamilyToken),
                },
              })
            }
          >
            <SelectTrigger className="h-8 w-40 text-xs">
              <SelectValue placeholder="Default" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__default" className="text-xs">Default</SelectItem>
              {FONT_FAMILY_OPTIONS.map((f) => (
                <SelectItem key={f.value} value={f.value} className="text-xs">
                  {f.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Row>

        <Row label="Size">
          <ChipGroup<FontSizeToken>
            value={t.fontSize}
            options={FONT_SIZE_ORDER}
            onChange={(fontSize) => updateStyles(block.id, { typography: { fontSize } })}
          />
        </Row>

        <Row label="Weight">
          <Select
            value={t.fontWeight !== undefined ? String(t.fontWeight) : "__default"}
            onValueChange={(v) =>
              updateStyles(block.id, {
                typography: {
                  fontWeight: v === "__default" ? undefined : (Number(v) as FontWeightToken),
                },
              })
            }
          >
            <SelectTrigger className="h-8 w-40 text-xs">
              <SelectValue placeholder="Default" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__default" className="text-xs">Default</SelectItem>
              {FONT_WEIGHTS.map((w) => (
                <SelectItem key={w} value={String(w)} className="text-xs">
                  {w}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Row>

        <LineHeightRow block={block} />

        <Row label="Align">
          <ToggleGroup
            type="single"
            value={t.textAlign ?? ""}
            onValueChange={(v) =>
              updateStyles(block.id, {
                typography: { textAlign: (v || undefined) as AlignToken | undefined },
              })
            }
            variant="outline"
            size="sm"
          >
            <ToggleGroupItem value="left" title="Left" className="size-7 p-0">
              <AlignLeft className="size-3.5" />
            </ToggleGroupItem>
            <ToggleGroupItem value="center" title="Center" className="size-7 p-0">
              <AlignCenter className="size-3.5" />
            </ToggleGroupItem>
            <ToggleGroupItem value="right" title="Right" className="size-7 p-0">
              <AlignRight className="size-3.5" />
            </ToggleGroupItem>
          </ToggleGroup>
        </Row>
      </Section>

      <Separator />

      <Section title="Colors" isDefault={!hasColors}>
        <Row label="Text">
          <ColorField
            value={styles.colors?.text}
            onChange={(text) => updateStyles(block.id, { colors: { text } })}
          />
        </Row>
      </Section>

      <Separator />

      <Section title="Spacing" isDefault={!hasSpacing}>
        <Row label="Padding">
          <ChipGroup<SpacingToken>
            value={styles.spacing?.padding}
            options={SPACING_ORDER}
            onChange={(padding) => updateStyles(block.id, { spacing: { padding } })}
          />
        </Row>
        <Row label="Margin">
          <ChipGroup<SpacingToken>
            value={styles.spacing?.margin}
            options={SPACING_ORDER}
            onChange={(margin) => updateStyles(block.id, { spacing: { margin } })}
          />
        </Row>
      </Section>

      <Separator />

      <Section title="Borders" isDefault={!hasBorders}>
        <Row label="Radius">
          <ChipGroup<RadiusToken>
            value={styles.borders?.radius}
            options={RADIUS_ORDER}
            onChange={(radius) => updateStyles(block.id, { borders: { radius } })}
          />
        </Row>
        <Row label="Width">
          <ChipGroup<BorderWidthToken>
            value={styles.borders?.width}
            options={BORDER_WIDTH_ORDER}
            onChange={(width) => updateStyles(block.id, { borders: { width } })}
          />
        </Row>
        <Row label="Color">
          <ColorField
            value={styles.borders?.color}
            onChange={(color) => updateStyles(block.id, { borders: { color } })}
          />
        </Row>
      </Section>

      <Separator />

      <Section title="Background" isDefault={!hasBackground}>
        <Row label="Solid">
          <ColorField
            value={styles.background?.color}
            onChange={(color) => updateStyles(block.id, { background: { color } })}
          />
        </Row>
        {/* Background image picker lands with the asset pipeline (same phase). */}
      </Section>

      <div className="px-4 pt-1">
        <Button
          variant="outline"
          size="sm"
          className="w-full text-muted-foreground"
          onClick={resetAll}
          title="Remove all style overrides for this block (Ctrl+Z to undo)"
        >
          <RotateCcw />
          Reset to default
        </Button>
      </div>
    </div>
  );
}

/**
 * Line height: live local value, committed once on pointer release —
 * a whole drag is ONE undo step, not one per pixel.
 */
function LineHeightRow({ block }: { block: BlockNode }) {
  const updateStyles = useEditor((s) => s.updateStyles);
  const stored = block.styles.typography?.lineHeight;
  const [draft, setDraft] = useState(stored ?? 1.5);

  useEffect(() => {
    setDraft(block.styles.typography?.lineHeight ?? 1.5);
  }, [block.id, block.styles.typography?.lineHeight]);

  return (
    <div className="flex items-center justify-between gap-3">
      <Label className="shrink-0 text-xs text-muted-foreground">Line height</Label>
      <div className="flex min-w-0 flex-1 items-center justify-end gap-2">
        <Slider
          min={LINE_HEIGHT_MIN}
          max={LINE_HEIGHT_MAX}
          step={LINE_HEIGHT_STEP}
          value={[draft]}
          onValueChange={([v]) => setDraft(v)}
          onValueCommit={([v]) => updateStyles(block.id, { typography: { lineHeight: v } })}
          className="min-w-24 max-w-36 flex-1"
        />
        <span className="w-9 text-right font-mono text-[11px] text-muted-foreground">
          {draft.toFixed(2)}
        </span>
        {stored !== undefined && (
          <button
            type="button"
            title="Reset line height"
            onClick={() => updateStyles(block.id, { typography: { lineHeight: undefined } })}
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            <RotateCcw className="size-3" />
          </button>
        )}
      </div>
    </div>
  );
}
