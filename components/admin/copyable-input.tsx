"use client";

import { useState } from "react";
import { Copy } from "lucide-react";

interface Props {
  formId: string;
  multiline?: boolean;
  initialValue: string;
  copyFromValue: string;
  copyFromLabel: string;
}

export function CopyableInput({
  formId,
  multiline = false,
  initialValue,
  copyFromValue,
  copyFromLabel,
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
          name="value"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          rows={2}
          className={className}
        />
      ) : (
        <input
          form={formId}
          name="value"
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
    </div>
  );
}
