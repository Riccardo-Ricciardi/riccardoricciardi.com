import Image from "next/image";
import { getSkills, type Skill } from "@/utils/skills/fetch";
import { getSupabaseImageUrl } from "@/utils/env";

const BASE_URL = getSupabaseImageUrl();

interface StackStripProps {
  heading: string;
  srLabel: string;
}

export async function StackStrip({ heading, srLabel }: StackStripProps) {
  const skills = await getSkills();
  if (skills.length === 0) return null;

  return (
    <section className="mt-16 border-t border-border pt-8 md:mt-24">
      <h2 className="text-h3">{heading}</h2>
      <span className="sr-only">{srLabel}</span>
      <div
        aria-hidden="true"
        className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-4"
      >
        {skills.map((skill) => (
          <StackIcon key={skill.id} skill={skill} />
        ))}
      </div>
    </section>
  );
}

function StackIcon({ skill }: { skill: Skill }) {
  const lightSrc = skill.icon_url ?? `${BASE_URL}/${skill.name}.png`;
  const darkSrc = skill.icon_dark_url ?? `${BASE_URL}/${skill.name}-dark.png`;

  return (
    <span className="relative block size-6 opacity-60 grayscale">
      <Image
        src={lightSrc}
        alt=""
        fill
        sizes="24px"
        unoptimized
        className={skill.dark ? "object-contain dark:hidden" : "object-contain"}
      />
      {skill.dark && (
        <Image
          src={darkSrc}
          alt=""
          fill
          sizes="24px"
          unoptimized
          className="hidden object-contain dark:block"
        />
      )}
    </span>
  );
}
