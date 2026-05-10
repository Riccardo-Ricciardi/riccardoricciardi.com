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
      {/* Always-on swatch preview — works for any CSS color (hex, oklch, rgb, etc.) */}
      <span
        aria-hidden="true"
        title="Preview"
        className="h-9 w-9 shrink-0 rounded-md border border-dashed border-dashed-soft"
        style={{ backgroundColor: value }}
      />
      {/* Hex picker — only enabled when value is a 6-digit hex */}
      {isHex && (
        <input
          type="color"
          aria-label={`${name} color picker`}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="h-9 w-9 shrink-0 rounded-md border border-dashed border-dashed-soft bg-background"
        />
      )}
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
