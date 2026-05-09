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
      className="container-page py-10"
    >
      <h2
        id="skills-heading"
        className="text-4xl font-bold mb-6 text-card-foreground"
      >
        {heading}
      </h2>

      {skills.length === 0 ? (
        <p className="text-muted-foreground">—</p>
      ) : (
        <ul className="grid gap-4 grid-cols-[repeat(auto-fit,minmax(80px,1fr))] list-none p-0">
          {skills.map(({ id, name, percentage, dark }, i) => {
            const lightSrc = `${BASE_URL}/${name}.png`;
            const darkSrc = `${BASE_URL}/${name}-dark.png`;
            const isAboveFold = i < 6;

            return (
              <li
                key={id}
                className="group relative rounded-lg border border-grid p-3 text-center bg-background"
              >
                <div className="relative w-full pt-[75%]">
                  <Image
                    src={lightSrc}
                    alt={`${name} icon`}
                    fill
                    sizes="(max-width: 768px) 30vw, (max-width: 1200px) 10vw, 80px"
                    className={dark ? "object-contain dark:hidden" : "object-contain"}
                    priority={isAboveFold}
                  />
                  {dark && (
                    <Image
                      src={darkSrc}
                      alt=""
                      aria-hidden="true"
                      fill
                      sizes="(max-width: 768px) 30vw, (max-width: 1200px) 10vw, 80px"
                      className="hidden object-contain dark:block"
                      priority={isAboveFold}
                    />
                  )}
                </div>

                <p className="mt-2 mb-1 text-xs font-medium text-primary">
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
