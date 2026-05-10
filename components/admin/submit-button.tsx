"use client";

import * as React from "react";
import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/button";

interface SubmitButtonProps extends ButtonProps {
  pendingLabel?: string;
}

export function SubmitButton({
  children,
  pendingLabel,
  disabled,
  ...rest
}: SubmitButtonProps) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={disabled || pending} {...rest}>
      {pending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
      {pending ? (pendingLabel ?? children) : children}
    </Button>
  );
}
