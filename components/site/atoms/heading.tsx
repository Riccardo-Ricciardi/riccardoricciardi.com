import { cn } from "@/utils/cn";
import { Eyebrow } from "@/components/site/atoms/eyebrow";

type Level = "display" | "h1" | "h2" | "h3" | "h4";

const LEVEL_CLASS: Record<Level, string> = {
  display: "text-display",
  h1: "text-h1",
  h2: "text-h2",
  h3: "text-h3",
  h4: "text-h4",
};

const LEVEL_TAG: Record<Level, "h1" | "h2" | "h3" | "h4"> = {
  display: "h1",
  h1: "h1",
  h2: "h2",
  h3: "h3",
  h4: "h4",
};

interface HeadingProps {
  level?: Level;
  as?: "h1" | "h2" | "h3" | "h4";
  eyebrow?: string;
  subtitle?: string;
  align?: "left" | "center";
  id?: string;
  className?: string;
  title: string;
}

export function Heading({
  level = "h2",
  as,
  eyebrow,
  subtitle,
  align = "left",
  id,
  className,
  title,
}: HeadingProps) {
  const Tag = as ?? LEVEL_TAG[level];

  return (
    <header
      className={cn(
        "flex flex-col gap-3",
        align === "center" && "items-center text-center",
        className
      )}
    >
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      <Tag
        id={id}
        className={cn("text-balance", LEVEL_CLASS[level])}
      >
        {title}
      </Tag>
      {subtitle && (
        <p
          className={cn(
            "text-body-lg max-w-prose text-muted-foreground",
            align === "center" && "mx-auto"
          )}
        >
          {subtitle}
        </p>
      )}
    </header>
  );
}
