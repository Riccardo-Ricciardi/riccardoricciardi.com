import { cn } from "@/lib/utils";

type EyebrowTag = "p" | "span" | "div" | "dt" | "dd" | "li" | "small";

interface EyebrowProps {
  children: React.ReactNode;
  className?: string;
  as?: EyebrowTag;
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
