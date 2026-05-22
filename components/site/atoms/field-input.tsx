import * as React from "react";
import { cn } from "@/utils/cn";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
  ref?: React.Ref<HTMLInputElement>;
}

export function FieldInput({ className, invalid, ref, ...rest }: InputProps) {
  return (
    <input
      ref={ref}
      aria-invalid={invalid || undefined}
      className={cn("field-input", className)}
      {...rest}
    />
  );
}
