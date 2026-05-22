import * as React from "react";
import { cn } from "@/utils/cn";

interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
  ref?: React.Ref<HTMLTextAreaElement>;
}

export function FieldTextarea({
  className,
  invalid,
  ref,
  ...rest
}: TextareaProps) {
  return (
    <textarea
      ref={ref}
      aria-invalid={invalid || undefined}
      className={cn("field-input field-textarea", className)}
      {...rest}
    />
  );
}
