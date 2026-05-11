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
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;
  const labeled = (child: React.ReactNode) => {
    if (typeof child !== "object" || child === null || !("props" in child)) {
      return child;
    }
    return child;
  };

  return (
    <div className={cn("field-shell", className)}>
      <label htmlFor={id} className="field-label">
        {label}
      </label>
      {labeled(children)}
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
      {describedBy && <span hidden />}
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

interface FieldProps extends InputProps {
  id: string;
  label: string;
  error?: string;
  hint?: string;
}

export function Field({ id, label, error, hint, ...inputProps }: FieldProps) {
  return (
    <FieldShell id={id} label={label} error={error} hint={hint}>
      <FieldInput id={id} invalid={Boolean(error)} {...inputProps} />
    </FieldShell>
  );
}
