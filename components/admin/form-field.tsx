import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";

interface BaseProps {
  label: string;
  hint?: string;
  className?: string;
}

type InputProps = BaseProps &
  Omit<InputHTMLAttributes<HTMLInputElement>, "className"> & {
    multiline?: false;
  };

type TextareaProps = BaseProps &
  Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "className"> & {
    multiline: true;
  };

const inputClass =
  "rounded-md border border-dashed border-dashed-soft bg-background px-2.5 py-1.5 text-sm focus-visible:border-accent-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function FormField(props: InputProps | TextareaProps) {
  const { label, hint, className = "", ...rest } = props as BaseProps & {
    multiline?: boolean;
    [k: string]: unknown;
  };

  return (
    <label className={`flex flex-col gap-1 ${className}`}>
      <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      {(rest as { multiline?: boolean }).multiline ? (
        <textarea
          {...(rest as TextareaHTMLAttributes<HTMLTextAreaElement>)}
          className={inputClass}
        />
      ) : (
        <input
          {...(rest as InputHTMLAttributes<HTMLInputElement>)}
          className={inputClass}
        />
      )}
      {hint && (
        <span className="text-[10px] text-muted-foreground">{hint}</span>
      )}
    </label>
  );
}

export function FormToggle({
  label,
  name,
  defaultChecked,
  className = "",
}: {
  label: string;
  name: string;
  defaultChecked?: boolean;
  className?: string;
}) {
  return (
    <label
      className={`flex items-center gap-2 rounded-md border border-dashed border-dashed-soft bg-background px-2.5 py-1.5 ${className}`}
    >
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        className="h-3.5 w-3.5"
      />
      <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
    </label>
  );
}
