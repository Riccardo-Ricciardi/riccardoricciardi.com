import { Pill } from "@/components/site/atoms/pill";

interface TechChipProps {
  children: React.ReactNode;
  className?: string;
}

export function TechChip({ children, className }: TechChipProps) {
  return (
    <Pill tone="mono" className={className}>
      {children}
    </Pill>
  );
}
