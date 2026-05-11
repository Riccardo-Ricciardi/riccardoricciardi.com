"use client";

import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SubmitButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  pendingLabel?: string;
  variant?: "primary" | "ghost" | "danger";
}

export function SubmitButton({
  children,
  pendingLabel = "Saving…",
  variant = "primary",
  className,
  disabled,
  ...props
}: SubmitButtonProps) {
  const { pending } = useFormStatus();
  const base = "admin-button";
  const variantCls =
    variant === "primary"
      ? "admin-button-primary"
      : variant === "danger"
        ? "admin-button-danger"
        : "admin-button-ghost";
  return (
    <button
      type="submit"
      disabled={disabled || pending}
      className={cn(base, variantCls, "disabled:opacity-60 disabled:cursor-not-allowed", className)}
      aria-busy={pending}
      {...props}
    >
      {pending && <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />}
      {pending ? pendingLabel : children}
    </button>
  );
}
