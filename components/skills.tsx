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
      aria-labelledby="skills-heading"
      className="container-page py-12 md:py-16"
    >
      <header className="mb-8 md:mb-10">
        <h1
          id="skills-heading"
          className="text-3xl md:text-4xl font-bold tracking-tight text-foreground"
        >
          {heading}
        </h1>
      </header>

      {skills.length === 0 ? (
        <p className="text-muted-foreground">—</p>
      ) : (
        <ul className="grid gap-3 sm:gap-4 grid-cols-[repeat(auto-fit,minmax(96px,1fr))] list-none p-0">
          {skills.map(({ id, name, percentage, dark }, i) => {
            const lightSrc = `${BASE_URL}/${name}.png`;
            const darkSrc = `${BASE_URL}/${name}-dark.png`;
            const isAboveFold = i < 6;

            return (
              <li
                key={id}
                className="group relative flex flex-col items-center justify-between rounded-lg border border-border bg-card p-3 text-center transition-all duration-200 hover:border-foreground/30 hover:shadow-sm hover:-translate-y-0.5"
              >
                <div className="relative w-full pt-[75%]">
                  <Image
                    src={lightSrc}
                    alt={`${name} icon`}
                    fill
                    sizes="(max-width: 768px) 30vw, (max-width: 1200px) 12vw, 96px"
                    className={
                      dark
                        ? "object-contain dark:hidden"
                        : "object-contain"
                    }
                    priority={isAboveFold}
                  />
                  {dark && (
                    <Image
                      src={darkSrc}
                      alt=""
                      aria-hidden="true"
                      fill
                      sizes="(max-width: 768px) 30vw, (max-width: 1200px) 12vw, 96px"
                      className="hidden object-contain dark:block"
                      priority={isAboveFold}
                    />
                  )}
                </div>

                <p className="mt-3 mb-2 text-xs font-medium text-foreground">
                  {name}
                </p>

                <SkillMeter value={percentage} label={name} />
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
