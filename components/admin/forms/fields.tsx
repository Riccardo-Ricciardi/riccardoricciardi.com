import { cn } from "@/lib/utils";

interface FieldShellProps {
  label?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  htmlFor?: string;
  className?: string;
  children: React.ReactNode;
}

export function FieldShell({
  label,
  hint,
  error,
  required,
  htmlFor,
  className,
  children,
}: FieldShellProps) {
  return (
    <label htmlFor={htmlFor} className={cn("flex flex-col gap-1.5", className)}>
      {label && (
        <span className="admin-eyebrow">
          {label}
          {required && <span className="ml-0.5 text-rose-500">*</span>}
        </span>
      )}
      {children}
      {error ? (
        <span className="text-xs text-rose-600 dark:text-rose-400">{error}</span>
      ) : hint ? (
        <span className="text-xs text-muted-foreground">{hint}</span>
      ) : null}
    </label>
  );
}

interface TextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
  containerClassName?: string;
}

export function TextField({
  label,
  hint,
  error,
  required,
  containerClassName,
  className,
  id,
  ...props
}: TextFieldProps) {
  return (
    <FieldShell
      label={label}
      hint={hint}
      error={error}
      required={required}
      htmlFor={id}
      className={containerClassName}
    >
      <input
        id={id}
        required={required}
        className={cn("admin-input", className)}
        {...props}
      />
    </FieldShell>
  );
}

interface TextareaFieldProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
  error?: string;
  containerClassName?: string;
}

export function TextareaField({
  label,
  hint,
  error,
  required,
  containerClassName,
  className,
  id,
  rows = 4,
  ...props
}: TextareaFieldProps) {
  return (
    <FieldShell
      label={label}
      hint={hint}
      error={error}
      required={required}
      htmlFor={id}
      className={containerClassName}
    >
      <textarea
        id={id}
        rows={rows}
        required={required}
        className={cn("admin-input min-h-24 resize-y", className)}
        {...props}
      />
    </FieldShell>
  );
}

interface NumberFieldProps extends Omit<TextFieldProps, "type"> {
  suffix?: string;
}

export function NumberField({ suffix, className, ...props }: NumberFieldProps) {
  return (
    <FieldShell
      label={props.label}
      hint={props.hint}
      error={props.error}
      required={props.required}
      htmlFor={props.id}
      className={props.containerClassName}
    >
      <span className="relative block">
        <input
          {...props}
          type="number"
          className={cn(
            "admin-input tabular-nums",
            suffix && "pr-9",
            className
          )}
        />
        {suffix && (
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            {suffix}
          </span>
        )}
      </span>
    </FieldShell>
  );
}

interface SwitchFieldProps {
  name: string;
  defaultChecked?: boolean;
  label: string;
  hint?: string;
  value?: string;
}

export function SwitchField({
  name,
  defaultChecked,
  label,
  hint,
  value = "on",
}: SwitchFieldProps) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-lg border admin-divider bg-background/40 px-3 py-2.5 transition-colors hover:border-[color-mix(in_oklab,var(--accent-blue)_60%,transparent)]">
      <input
        type="checkbox"
        name={name}
        value={value}
        defaultChecked={defaultChecked}
        className="peer sr-only"
      />
      <span
        aria-hidden="true"
        className="relative mt-0.5 inline-flex h-5 w-9 shrink-0 items-center rounded-full bg-muted transition-colors peer-checked:bg-accent-blue peer-focus-visible:ring-2 peer-focus-visible:ring-ring"
      >
        <span className="ml-0.5 inline-block h-4 w-4 transform rounded-full bg-background transition-transform peer-checked:translate-x-4" />
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-medium">{label}</span>
        {hint && (
          <span className="block text-xs text-muted-foreground">{hint}</span>
        )}
      </span>
    </label>
  );
}
