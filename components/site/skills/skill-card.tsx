import Image from "next/image";
import { SkillMeter } from "@/components/site/atoms/skill-meter";

const BASE_URL = process.env.NEXT_PUBLIC_SUPABASE_IMAGE_URL ?? "";

interface SkillCardProps {
  id: number;
  name: string;
  percentage: number;
  dark: boolean;
  icon_url: string | null;
  icon_dark_url: string | null;
  priority?: boolean;
}

export function SkillCard({
  name,
  percentage,
  dark,
  icon_url,
  icon_dark_url,
  priority = false,
}: SkillCardProps) {
  const lightSrc = icon_url ?? `${BASE_URL}/${name}.png`;
  const darkSrc = icon_dark_url ?? `${BASE_URL}/${name}-dark.png`;

  return (
    <li className="group relative flex flex-col rounded-xl border border-dashed border-dashed-soft bg-card p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-accent-blue hover:shadow-[0_0_0_1px_var(--accent-blue-soft)]">
      <div className="relative mx-auto h-12 w-12 sm:h-14 sm:w-14">
        <Image
          src={lightSrc}
          alt={`${name} icon`}
          fill
          sizes="56px"
          className={
            dark ? "object-contain dark:hidden" : "object-contain"
          }
          priority={priority}
        />
        {dark && (
          <Image
            src={darkSrc}
            alt=""
            aria-hidden="true"
            fill
            sizes="56px"
            className="hidden object-contain dark:block"
            priority={priority}
          />
        )}
      </div>

      <div className="mt-4 flex items-baseline justify-between gap-2">
        <p className="truncate font-mono text-xs font-medium tracking-wide text-foreground">
          {name}
        </p>
        <span
          className="font-mono text-[10px] tabular-nums text-muted-foreground"
          aria-hidden="true"
        >
          {percentage}%
        </span>
      </div>

      <div className="mt-2">
        <SkillMeter value={percentage} label={name} />
      </div>
    </li>
  );
}
