"use client";

import { useMemo, useState } from "react";
import type { Skill } from "@/utils/skills/fetch";
import { SkillCard } from "@/components/site/skills/skill-card";
import { cn } from "@/lib/utils";

interface SkillsBoardProps {
  skills: Skill[];
  allLabel: string;
}

const UNCATEGORIZED = "__uncat__";

export function SkillsBoard({ skills, allLabel }: SkillsBoardProps) {
  const categories = useMemo(() => {
    const set = new Set<string>();
    for (const s of skills) {
      const cat = (s as Skill & { category?: string | null }).category;
      if (cat) set.add(cat);
    }
    const list = Array.from(set);
    list.sort((a, b) => a.localeCompare(b));
    return list;
  }, [skills]);

  const [active, setActive] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (!active) return skills;
    if (active === UNCATEGORIZED) {
      return skills.filter(
        (s) => !(s as Skill & { category?: string | null }).category
      );
    }
    return skills.filter(
      (s) => (s as Skill & { category?: string | null }).category === active
    );
  }, [skills, active]);

  if (skills.length === 0) {
    return <p className="text-muted-foreground">—</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          <FilterChip
            label={allLabel}
            active={active === null}
            onClick={() => setActive(null)}
          />
          {categories.map((cat) => (
            <FilterChip
              key={cat}
              label={cat}
              active={active === cat}
              onClick={() => setActive(cat)}
            />
          ))}
        </div>
      )}

      <ul className="grid list-none gap-3 p-0 sm:gap-4 grid-cols-[repeat(auto-fit,minmax(140px,1fr))]">
        {filtered.map((skill, i) => (
          <SkillCard
            key={skill.id}
            id={skill.id}
            name={skill.name}
            percentage={skill.percentage}
            dark={skill.dark}
            icon_url={skill.icon_url}
            icon_dark_url={skill.icon_dark_url}
            priority={i < 6}
          />
        ))}
      </ul>
    </div>
  );
}

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "rounded-full border border-dashed px-3 py-1 font-mono text-[11px] uppercase tracking-wider transition-colors",
        active
          ? "border-accent-blue bg-accent-blue text-white"
          : "border-dashed-soft text-muted-foreground hover:border-accent-blue hover:text-foreground"
      )}
    >
      {label}
    </button>
  );
}
