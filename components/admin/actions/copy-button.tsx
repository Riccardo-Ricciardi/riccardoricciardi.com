"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/utils/cn";

interface CopyButtonProps {
  value: string;
  label?: string;
  iconOnly?: boolean;
  className?: string;
}

export function CopyButton({
  value,
  label = "Copy",
  iconOnly = false,
  className,
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const onClick = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      window.prompt("Copy this:", value);
    }
  };

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={copied ? "Copied" : label}
      className={cn(
        "admin-button admin-button-ghost h-8 px-2.5 text-xs",
        iconOnly && "h-8 w-8 min-h-8 min-w-8 px-0",
        className
      )}
    >
      {copied ? (
        <Check className="h-3.5 w-3.5 text-emerald-500" aria-hidden="true" />
      ) : (
        <Copy className="h-3.5 w-3.5" aria-hidden="true" />
      )}
      {!iconOnly && <span>{copied ? "Copied" : label}</span>}
    </button>
  );
}
