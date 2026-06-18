import Image from "next/image";
import { getSkills, type Skill } from "@/utils/skills/fetch";
import { Heading } from "@/components/site/atoms/heading";
import { Reveal } from "@/components/site/atoms/reveal";

interface GroupLabels {
  languages: string;
  frontend: string;
  backend: string;
  hardware: string;
}

interface StackRowProps {
  eyebrow: string;
  heading: string;
  intro: string;
  groupLabels: GroupLabels;
}

// Curated toolchain: the tools actually shipped to production, grouped by domain.
const GROUPS: { key: keyof GroupLabels; names: string[] }[] = [
  { key: "languages", names: ["TypeScript", "JavaScript", "Python"] },
  { key: "frontend", names: ["Next.js", "React", "Tailwind"] },
  { key: "backend", names: ["Node.js", "PostgreSQL", "Supabase"] },
  { key: "hardware", names: ["Arduino", "ESP32", "Raspberry Pi"] },
];

function StackLogo({ skill }: { skill: Skill }) {
  const light = skill.icon_url as string;
  const dark = skill.icon_dark_url ?? light;
  return (
    <span className="group/logo inline-flex items-center gap-2">
      <span className="relative block size-5 shrink-0 grayscale transition duration-300 ease-out group-hover/logo:grayscale-0">
        <Image
          src={light}
          alt=""
          aria-hidden="true"
          fill
          sizes="20px"
          unoptimized
          className={skill.dark ? "object-contain dark:hidden" : "object-contain"}
        />
        {skill.dark && (
          <Image
            src={dark}
            alt=""
            aria-hidden="true"
            fill
            sizes="20px"
            unoptimized
            className="hidden object-contain dark:block"
          />
        )}
      </span>
      <span className="font-mono text-sm tracking-tight text-foreground">
        {skill.name}
      </span>
    </span>
  );
}

export async function StackRow({
  eyebrow,
  heading,
  intro,
  groupLabels,
}: StackRowProps) {
  const byName = new Map((await getSkills()).map((s) => [s.name, s]));

  return (
    <section className="section-divider-b">
      <div className="container-page section-y flex flex-col gap-12">
        <Reveal variant="fade-up">
          <Heading level="h2" eyebrow={eyebrow} title={heading} subtitle={intro} />
        </Reveal>

        <Reveal variant="fade-up">
          <dl className="flex flex-col">
            {GROUPS.map((group) => {
              const items = group.names
                .map((name) => byName.get(name))
                .filter((s): s is Skill => Boolean(s));
              if (items.length === 0) return null;
              return (
                <div
                  key={group.key}
                  className="grid grid-cols-1 gap-x-8 gap-y-4 border-t border-border py-6 last:border-b sm:grid-cols-[13rem_1fr]"
                >
                  <dt className="text-eyebrow pt-1">{groupLabels[group.key]}</dt>
                  <dd className="flex flex-wrap items-center gap-x-7 gap-y-4">
                    {items.map((skill) => (
                      <StackLogo key={skill.id} skill={skill} />
                    ))}
                  </dd>
                </div>
              );
            })}
          </dl>
        </Reveal>
      </div>
    </section>
  );
}
