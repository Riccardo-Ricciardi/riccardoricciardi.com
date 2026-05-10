import Image from "next/image";
import { getSkills } from "@/utils/skills/fetch";
import { SkillMeter } from "@/components/skill-meter";

const BASE_URL = process.env.NEXT_PUBLIC_SUPABASE_IMAGE_URL ?? "";

interface SkillsProps {
  heading: string;
}

export async function Skills({ heading }: SkillsProps) {
  const skills = await getSkills();

  return (
    <section
      id="skills"
      aria-labelledby="skills-heading"
      className="container-page py-16 md:py-24 lg:py-28"
    >
      <header className="mb-10 md:mb-14">
        <h2
          id="skills-heading"
          className="text-3xl md:text-4xl font-semibold tracking-tight text-foreground"
        >
          {heading}
        </h2>
      </header>

      {skills.length === 0 ? (
        <p className="text-muted-foreground">—</p>
      ) : (
        <ul className="grid gap-3 sm:gap-4 grid-cols-[repeat(auto-fit,minmax(140px,1fr))] list-none p-0">
          {skills.map(({ id, name, percentage, dark }, i) => {
            const lightSrc = `${BASE_URL}/${name}.png`;
            const darkSrc = `${BASE_URL}/${name}-dark.png`;
            const isAboveFold = i < 6;

            return (
              <li
                key={id}
                className="group relative flex flex-col items-stretch justify-between rounded-xl border border-border bg-card p-4 transition-colors duration-200 hover:bg-accent/40 hover:border-foreground/20"
              >
                <div className="relative mx-auto h-12 w-12 sm:h-14 sm:w-14">
                  <Image
                    src={lightSrc}
                    alt={`${name} icon`}
                    fill
                    sizes="56px"
                    className={
                      dark ? "object-contain dark:hidden" : "object-contain"
                    }
                    priority={isAboveFold}
                  />
                  {dark && (
                    <Image
                      src={darkSrc}
                      alt=""
                      aria-hidden="true"
                      fill
                      sizes="56px"
                      className="hidden object-contain dark:block"
                      priority={isAboveFold}
                    />
                  )}
                </div>

                <div className="mt-4 flex items-baseline justify-between gap-2">
                  <p className="truncate font-mono text-xs font-medium text-foreground">
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
          })}
        </ul>
      )}
    </section>
  );
}
