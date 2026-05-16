import Image from "next/image";
import { Sparkles } from "lucide-react";
import type { Skill } from "@/utils/skills/fetch";
import { EmptyState } from "@/components/site/atoms/empty-state";
import { getSupabaseImageUrl } from "@/utils/env";

interface SkillsBoardProps {
  skills: Skill[];
  locale?: string;
  emptyTitle?: string;
  emptyBody?: string;
}

const BASE_URL = getSupabaseImageUrl();

export function SkillsBoard({
  skills,
  locale = "it",
  emptyTitle,
  emptyBody,
}: SkillsBoardProps) {
  const lang = locale === "it" ? "it" : "en";

  if (skills.length === 0) {
    return (
      <EmptyState
        icon={Sparkles}
        title={
          emptyTitle ??
          (lang === "it" ? "Stack in arrivo." : "Stack coming soon.")
        }
        description={
          emptyBody ??
          (lang === "it"
            ? "Sto curando la lista degli strumenti che uso davvero."
            : "I'm curating the list of tools I actually use.")
        }
        className="self-start"
      />
    );
  }

  const sorted = [...skills].sort((a, b) => b.percentage - a.percentage);

  return (
    <ul className="grid list-none grid-cols-1 gap-3 p-0 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {sorted.map((skill, i) => (
        <SkillCard key={skill.id} skill={skill} index={i} priority={i < 8} />
      ))}
    </ul>
  );
}

interface SkillCardProps {
  skill: Skill;
  index: number;
  priority: boolean;
}

function SkillCard({ skill, index, priority }: SkillCardProps) {
  const lightSrc = skill.icon_url ?? `${BASE_URL}/${skill.name}.png`;
  const darkSrc = skill.icon_dark_url ?? `${BASE_URL}/${skill.name}-dark.png`;

  return (
    <li className="group card-base card-interactive relative flex flex-col gap-4 overflow-hidden p-5 transition-[border-color,transform,box-shadow] duration-150 ease-out hover:-translate-y-0.5 hover:border-foreground/40">
      <span
        aria-hidden="true"
        className="absolute right-4 top-4 font-mono text-[10px] tabular-nums text-muted-foreground/60 transition-colors duration-150 ease-out group-hover:text-muted-foreground"
      >
        {String(index + 1).padStart(2, "0")}
      </span>

      <div className="flex items-center gap-3">
        <div className="relative h-10 w-10 shrink-0">
          <Image
            src={lightSrc}
            alt=""
            aria-hidden="true"
            fill
            sizes="40px"
            className={
              skill.dark ? "object-contain dark:hidden" : "object-contain"
            }
            priority={priority}
          />
          {skill.dark && (
            <Image
              src={darkSrc}
              alt=""
              aria-hidden="true"
              fill
              sizes="40px"
              className="hidden object-contain dark:block"
              priority={priority}
            />
          )}
        </div>
        <span className="min-w-0 flex-1 truncate text-base font-semibold tracking-tight text-foreground transition-colors duration-150 ease-out group-hover:text-accent-blue">
          {skill.name}
        </span>
      </div>

      <div className="mt-auto flex flex-col gap-2">
        <span
          aria-hidden="true"
          className="relative h-px w-full overflow-hidden bg-border"
        >
          <span
            className="absolute inset-y-0 left-0 bg-foreground transition-[width,background-color] duration-300 ease-out group-hover:bg-accent-blue"
            style={{ width: `${skill.percentage}%` }}
          />
        </span>
        <span className="flex items-baseline justify-end font-mono text-[11px] tabular-nums text-muted-foreground">
          {skill.percentage}
          <span className="opacity-60">%</span>
        </span>
      </div>
    </li>
  );
}
