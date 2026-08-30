"use client";

import * as React from "react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface MoneyInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange"> {
  value: number;
  onChange: (value: number) => void;
}

function centsToDisplay(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function MoneyInput({ value, onChange, className, ...props }: MoneyInputProps) {
  const [display, setDisplay] = React.useState(() => centsToDisplay(Math.round(value * 100)));

  React.useEffect(() => {
    setDisplay(centsToDisplay(Math.round(value * 100)));
  }, [value]);

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const digits = event.target.value.replace(/\D/g, "").slice(0, 12);
    const cents = digits ? Number(digits) : 0;
    setDisplay(centsToDisplay(cents));
    onChange(cents / 100);
  }

  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
        R$
      </span>
      <Input
        inputMode="numeric"
        value={display}
        onChange={handleChange}
        className={cn("pl-9 text-right tabular-nums", className)}
        {...props}
      />
    </div>
  );
}
