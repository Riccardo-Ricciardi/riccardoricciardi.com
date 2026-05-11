import { cn } from "@/lib/utils";

interface EyebrowProps {
  children: React.ReactNode;
  className?: string;
  as?: "p" | "span" | "div";
  id?: string;
}

export function Eyebrow({
  children,
  className,
  as: Tag = "p",
  id,
}: EyebrowProps) {
  return (
    <Tag id={id} className={cn("text-eyebrow", className)}>
      {children}
    </Tag>
  );
}
