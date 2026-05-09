interface SkillMeterProps {
  value: number;
  label: string;
  segments?: number;
}

export function SkillMeter({ value, label, segments = 4 }: SkillMeterProps) {
  const clamped = Math.max(0, Math.min(100, value));
  const exact = (clamped / 100) * segments;
  const filled = Math.floor(exact);
  const partial = exact - filled;

  return (
    <div
      role="meter"
      aria-label={`${label} proficiency`}
      aria-valuenow={Math.round(clamped)}
      aria-valuemin={0}
      aria-valuemax={100}
      className="flex w-full gap-[3px] rounded-full overflow-hidden"
    >
      {Array.from({ length: segments }).map((_, i) => {
        const overlay =
          i < filled ? 100 : i === filled ? Math.round(partial * 100) : 0;
        const isFull = overlay === 100;
        const isPartial = overlay > 0 && overlay < 100;

        return (
          <span
            key={i}
            aria-hidden="true"
            className="h-1.5 flex-1 rounded-full bg-muted"
            style={
              isFull
                ? { backgroundColor: "var(--color-foreground)" }
                : isPartial
                ? {
                    backgroundImage: `linear-gradient(to right, var(--color-foreground) ${overlay}%, var(--color-muted) ${overlay}%)`,
                  }
                : undefined
            }
          />
        );
      })}
    </div>
  );
}
