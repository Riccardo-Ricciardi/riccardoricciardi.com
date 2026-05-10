"use client";

import { useState } from "react";

interface ColorInputProps {
  name: string;
  defaultValue: string;
  required?: boolean;
  placeholder?: string;
}

const HEX_RE = /^#[0-9a-fA-F]{6}$/;

export function ColorInput({
  name,
  defaultValue,
  required,
  placeholder,
}: ColorInputProps) {
  const [value, setValue] = useState(defaultValue);
  const isHex = HEX_RE.test(value);

  return (
    <div className="flex items-center gap-2">
      <input
        type="color"
        aria-label={`${name} color picker`}
        value={isHex ? value : "#000000"}
        onChange={(e) => setValue(e.target.value)}
        disabled={!isHex}
        className="h-9 w-9 shrink-0 rounded-md border border-dashed border-dashed-soft bg-background disabled:opacity-50"
      />
      <input
        type="text"
        name={name}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        required={required}
        placeholder={placeholder}
        className="flex-1 rounded-md border border-dashed border-dashed-soft bg-background px-3 py-1.5 font-mono text-xs focus-visible:border-accent-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />
    </div>
  );
}
