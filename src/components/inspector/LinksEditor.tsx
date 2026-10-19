/**
 * LinksEditor — label + href rows with add / remove / reorder.
 * Used by the navbar and footer Settings tabs. Each committed field edit
 * is ONE updateProps call (one undo step).
 */

import { nanoid } from "nanoid";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { NavLink } from "@/types/blocks";
import { TextInputField } from "./TextInputField";

interface LinksEditorProps {
  links: NavLink[];
  onChange: (links: NavLink[]) => void;
}

export function LinksEditor({ links, onChange }: LinksEditorProps) {
  const update = (id: string, patch: Partial<NavLink>) =>
    onChange(links.map((link) => (link.id === id ? { ...link, ...patch } : link)));

  const remove = (id: string) => onChange(links.filter((link) => link.id !== id));

  const move = (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= links.length) return;
    const next = [...links];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  const add = () =>
    onChange([...links, { id: nanoid(8), label: "New link", href: "#" }]);

  return (
    <div className="flex flex-col gap-2">
      {links.map((link, i) => (
        <div key={link.id} className="flex flex-col gap-1.5 rounded-md border p-2">
          <div className="flex items-center gap-1.5">
            <TextInputField
              value={link.label}
              onChange={(label) => update(link.id, { label })}
              placeholder="Label"
              className="h-7 flex-1 text-xs"
            />
            <div className="flex shrink-0">
              <Button variant="ghost" size="icon" className="size-6" title="Move up" onClick={() => move(i, -1)}>
                <ArrowUp />
              </Button>
              <Button variant="ghost" size="icon" className="size-6" title="Move down" onClick={() => move(i, 1)}>
                <ArrowDown />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="size-6 text-red-600 hover:bg-red-50 hover:text-red-700"
                title="Remove link"
                onClick={() => remove(link.id)}
              >
                <Trash2 />
              </Button>
            </div>
          </div>
          <TextInputField
            value={link.href}
            onChange={(href) => update(link.id, { href })}
            placeholder="https://… or #section"
            className="h-7 font-mono text-[11px]"
          />
        </div>
      ))}

      <Button variant="outline" size="sm" className="w-full" onClick={add}>
        <Plus />
        Add link
      </Button>
    </div>
  );
}
