import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  id?: string;
  className?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "left",
  id,
  className,
}: SectionHeadingProps) {
  return (
    <header
      className={cn(
        "flex flex-col gap-3",
        align === "center" && "items-center text-center",
        className
      )}
    >
      {eyebrow && (
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          {eyebrow}
        </p>
      )}
      <h2
        id={id}
        className="text-balance text-3xl font-semibold tracking-tight md:text-4xl lg:text-[2.5rem] lg:leading-[1.1]"
      >
        {title}
      </h2>
      {subtitle && (
        <p
          className={cn(
            "max-w-prose text-base text-muted-foreground md:text-lg",
            align === "center" && "mx-auto"
          )}
        >
          {subtitle}
        </p>
      )}
    </header>
  );
}
