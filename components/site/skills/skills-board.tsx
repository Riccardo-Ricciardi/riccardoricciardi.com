import Image from "next/image";
import {
  Sparkles,
  Layout,
  Database,
  Wrench,
  Palette,
  Box,
  Cpu,
  Code,
  type LucideIcon,
} from "lucide-react";
import type { Skill, SkillGroup } from "@/utils/skills/fetch";
import { EmptyState } from "@/components/site/atoms/empty-state";
import { getSupabaseImageUrl } from "@/utils/env";

interface SkillsBoardProps {
  groups: SkillGroup[];
  locale?: string;
  emptyTitle?: string;
  emptyBody?: string;
}

const BASE_URL = getSupabaseImageUrl();

const ICON_MAP: Record<string, LucideIcon> = {
  Layout,
  Database,
  Wrench,
  Palette,
  Box,
  Cpu,
  Code,
  Sparkles,
};

export function SkillsBoard({
  groups,
  locale = "it",
  emptyTitle,
  emptyBody,
}: SkillsBoardProps) {
  const lang = locale === "it" ? "it" : "en";

  if (groups.length === 0) {
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

  return (
    <ul className="grid list-none grid-cols-1 gap-4 p-0 md:grid-cols-2 xl:grid-cols-3">
      {groups.map((group) => (
        <CategoryCard key={group.category.slug} group={group} lang={lang} />
      ))}
    </ul>
  );
}

function CategoryCard({
  group,
  lang,
}: {
  group: SkillGroup;
  lang: "it" | "en";
}) {
  const Icon =
    (group.category.icon && ICON_MAP[group.category.icon]) || Sparkles;
  const label = lang === "it" ? group.category.label_it : group.category.label_en;
  const count = group.skills.length;
  const countLabel =
    lang === "it"
      ? `${count} ${count === 1 ? "competenza" : "competenze"}`
      : `${count} ${count === 1 ? "skill" : "skills"}`;

  return (
    <li className="card-base flex flex-col gap-5 overflow-hidden p-6">
      <header className="flex items-center justify-between gap-3 border-b admin-divider pb-4">
        <div className="flex items-center gap-3">
          <span className="grid size-9 place-items-center rounded-md border admin-divider bg-background/60 text-accent-blue">
            <Icon className="size-4" aria-hidden="true" />
          </span>
          <h3 className="text-base font-semibold tracking-tight text-foreground">
            {label}
          </h3>
        </div>
        <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
          {countLabel}
        </span>
      </header>

      <ul className="flex list-none flex-col gap-3 p-0">
        {group.skills.map((skill) => (
          <SkillRow key={skill.id} skill={skill} />
        ))}
      </ul>
    </li>
  );
}

function SkillRow({ skill }: { skill: Skill }) {
  const lightSrc = skill.icon_url ?? `${BASE_URL}/${skill.name}.png`;
  const darkSrc = skill.icon_dark_url ?? `${BASE_URL}/${skill.name}-dark.png`;

  return (
    <li className="group flex items-center gap-3">
      <div className="relative size-6 shrink-0">
        <Image
          src={lightSrc}
          alt=""
          aria-hidden="true"
          fill
          sizes="24px"
          unoptimized
          className={
            skill.dark ? "object-contain dark:hidden" : "object-contain"
          }
        />
        {skill.dark && (
          <Image
            src={darkSrc}
            alt=""
            aria-hidden="true"
            fill
            sizes="24px"
            unoptimized
            className="hidden object-contain dark:block"
          />
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <div className="flex items-baseline justify-between gap-2">
          <span className="truncate text-sm font-medium text-foreground">
            {skill.name}
          </span>
          <span className="font-mono text-xs tabular-nums text-muted-foreground">
            {skill.percentage}
            <span className="opacity-60">%</span>
          </span>
        </div>
        <span
          aria-hidden="true"
          className="relative h-1.5 w-full overflow-hidden rounded-full bg-muted"
        >
          <span
            className="absolute inset-y-0 left-0 rounded-full bg-accent-blue transition-[width] duration-300 ease-out"
            style={{ width: `${skill.percentage}%` }}
          />
        </span>
      </div>
    </li>
  );
}
