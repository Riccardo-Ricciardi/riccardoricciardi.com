"use client";

import { useState } from "react";
import { Copy } from "lucide-react";

interface Props {
  formId: string;
  name?: string;
  multiline?: boolean;
  initialValue: string;
  copyFromValue: string;
  copyFromLabel: string;
  showCharCount?: boolean;
}

export function CopyableInput({
  formId,
  name = "value",
  multiline = false,
  initialValue,
  copyFromValue,
  copyFromLabel,
  showCharCount = true,
}: Props) {
  const [value, setValue] = useState(initialValue);
  const showCopy = !value.trim() && copyFromValue.trim().length > 0;

  const className =
    "w-full min-w-[160px] rounded-md border border-dashed border-dashed-soft bg-background px-2 py-1.5 text-sm focus-visible:border-accent-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

  return (
    <div className="relative">
      {multiline ? (
        <textarea
          form={formId}
          name={name}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          rows={2}
          className={className}
        />
      ) : (
        <input
          form={formId}
          name={name}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className={className}
        />
      )}
      {showCopy && (
        <button
          type="button"
          onClick={() => setValue(copyFromValue)}
          title={`Prefill with ${copyFromLabel} value`}
          className="absolute right-1 top-1 inline-flex items-center gap-0.5 rounded border border-dashed border-dashed-soft bg-background px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-muted-foreground hover:border-accent-blue hover:text-accent-blue"
        >
          <Copy className="h-2.5 w-2.5" />
          {copyFromLabel}
        </button>
      )}
      {showCharCount && value.length > 0 && (
        <span className="mt-0.5 block font-mono text-[9px] tabular-nums text-muted-foreground">
          {value.length} chars
        </span>
      )}
    </div>
  );
}
