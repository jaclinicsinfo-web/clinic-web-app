"use client";

import * as React from "react";
import { X } from "lucide-react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface TagsInputProps {
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  id?: string;
  disabled?: boolean;
  className?: string;
}

export function TagsInput({ value, onChange, placeholder, id, disabled, className }: TagsInputProps) {
  const [rascunho, setRascunho] = React.useState("");

  function adicionar() {
    const texto = rascunho.trim();
    if (!texto || value.includes(texto)) {
      setRascunho("");
      return;
    }
    onChange([...value, texto]);
    setRascunho("");
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      adicionar();
      return;
    }

    if (event.key === "Backspace" && rascunho === "" && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  }

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <Input
        id={id}
        value={rascunho}
        onChange={(event) => setRascunho(event.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={adicionar}
        placeholder={placeholder}
        disabled={disabled}
      />

      {value.length > 0 && (
        <ul className="flex flex-wrap gap-1.5">
          {value.map((item) => (
            <li key={item}>
              <span className="inline-flex items-center gap-1 rounded-full border border-border bg-muted px-2.5 py-1 text-xs font-medium text-foreground">
                {item}
                <button
                  type="button"
                  onClick={() => onChange(value.filter((atual) => atual !== item))}
                  disabled={disabled}
                  className="text-muted-foreground transition-colors hover:text-destructive"
                  aria-label={`Remover ${item}`}
                >
                  <X className="size-3" />
                </button>
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
