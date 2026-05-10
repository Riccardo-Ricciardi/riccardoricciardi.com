interface ToggleProps {
  name: string;
  defaultChecked?: boolean;
  ariaLabel?: string;
}

export function Toggle({ name, defaultChecked, ariaLabel }: ToggleProps) {
  return (
    <label
      className="inline-flex cursor-pointer items-center"
      aria-label={ariaLabel}
    >
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        className="peer sr-only"
      />
      <span className="relative inline-block h-5 w-9 rounded-full bg-muted transition-colors peer-checked:bg-accent-blue peer-focus-visible:ring-2 peer-focus-visible:ring-ring">
        <span className="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-background shadow-sm transition-transform peer-checked:translate-x-4" />
      </span>
    </label>
  );
}
