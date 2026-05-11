import { cn } from "@/lib/utils";

type CardVariant = "default" | "interactive";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  padding?: "default" | "lg";
  as?: "div" | "article" | "section";
}

export function Card({
  variant = "default",
  padding = "default",
  as: Tag = "div",
  className,
  children,
  ...rest
}: CardProps) {
  return (
    <Tag
      className={cn(
        "card-base",
        variant === "interactive" && "card-interactive",
        padding === "lg" && "card-pad-lg",
        className
      )}
      {...rest}
    >
      {children}
    </Tag>
  );
}
