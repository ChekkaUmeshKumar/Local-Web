/**
 * ColorField — swatch → popover (react-colorful + hex input + None).
 * Used for text, border and background colors.
 * `undefined` = "use the block default" (key removed from styles).
 */

import { useState } from "react";
import { HexColorPicker } from "react-colorful";
import "react-colorful/dist/index.css";
import { X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const HEX_RE = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i;

interface ColorFieldProps {
  value: string | undefined;
  onChange: (hex: string | undefined) => void;
  label?: string;
}

export function ColorField({ value, onChange, label }: ColorFieldProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(value ?? "#2563eb");

  const handleOpenChange = (o: boolean) => {
    if (o) {
      setDraft(value ?? "#2563eb");
    } else {
      // Commit on close if a valid, changed color was picked/typed.
      const trimmed = draft.trim();
      if (HEX_RE.test(trimmed) && trimmed.toLowerCase() !== (value ?? "").toLowerCase()) {
        onChange(trimmed.toLowerCase());
      }
    }
    setOpen(o);
  };

  return (
    <div className="flex min-w-0 items-center gap-2">
      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <button
            type="button"
            title="Pick a color — check readability against the background"
            className={cn(
              "flex size-8 shrink-0 items-center justify-center rounded-md border shadow-sm transition-colors hover:border-foreground/40",
              !value && "text-muted-foreground",
            )}
            style={value ? { backgroundColor: value } : undefined}
          >
            {!value && <span className="text-xs">—</span>}
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-60" align="start">
          <div className="flex flex-col gap-3">
            <HexColorPicker color={draft} onChange={setDraft} className="w-full" />
            <div className="flex items-center gap-2">
              <Input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                className="h-8 font-mono text-xs"
                spellCheck={false}
              />
              <Button
                size="sm"
                className="h-8"
                disabled={!HEX_RE.test(draft.trim())}
                onClick={() => {
                  onChange(draft.trim().toLowerCase());
                  setOpen(false);
                }}
              >
                Set
              </Button>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground"
              onClick={() => {
                onChange(undefined);
                setOpen(false);
              }}
            >
              None — use block default
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      {label && <span className="shrink-0 text-xs text-muted-foreground">{label}</span>}

      {value ? (
        <>
          <span className="min-w-0 truncate font-mono text-[11px] text-muted-foreground">
            {value}
          </span>
          <button
            type="button"
            title="Clear — use default"
            onClick={() => onChange(undefined)}
            className="shrink-0 text-muted-foreground transition-colors hover:text-foreground"
          >
            <X className="size-3.5" />
          </button>
        </>
      ) : (
        <span className="text-[11px] text-muted-foreground/70">default</span>
      )}
    </div>
  );
}
