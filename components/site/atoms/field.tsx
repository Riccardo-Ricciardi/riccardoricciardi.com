import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface FieldShellProps {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  className?: string;
  children: React.ReactNode;
}

export function FieldShell({
  id,
  label,
  error,
  hint,
  className,
  children,
}: FieldShellProps) {
  return (
    <div className={cn("field-shell", className)}>
      <label htmlFor={id} className="field-label">
        {label}
      </label>
      {children}
      {hint && !error && (
        <p id={`${id}-hint`} className="text-caption">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} role="alert" className="field-error">
          {error}
        </p>
      )}
    </div>
  );
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}

export const FieldInput = forwardRef<HTMLInputElement, InputProps>(
  function FieldInput({ className, invalid, ...rest }, ref) {
    return (
      <input
        ref={ref}
        aria-invalid={invalid || undefined}
        className={cn("field-input", className)}
        {...rest}
      />
    );
  }
);

interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
}

export const FieldTextarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function FieldTextarea({ className, invalid, ...rest }, ref) {
    return (
      <textarea
        ref={ref}
        aria-invalid={invalid || undefined}
        className={cn("field-input field-textarea", className)}
        {...rest}
      />
    );
  }
);

