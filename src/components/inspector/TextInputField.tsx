/**
 * TextInputField — inspector text input that commits on blur / Enter,
 * NOT per keystroke (one store action + one undo step per committed edit).
 */

import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";

interface TextInputFieldProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
  type?: string;
}

export function TextInputField({ value, onChange, placeholder, className, type }: TextInputFieldProps) {
  const [draft, setDraft] = useState(value);
  const ref = useRef<HTMLInputElement>(null);

  // Follow external changes (undo, reset, canvas edits) — unless the user
  // is typing in this very field right now.
  useEffect(() => {
    if (document.activeElement !== ref.current) setDraft(value);
  }, [value]);

  const commit = () => {
    if (draft !== value) onChange(draft);
  };

  return (
    <Input
      ref={ref}
      type={type}
      value={draft}
      placeholder={placeholder}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === "Enter") e.currentTarget.blur();
      }}
      className={className}
    />
  );
}
