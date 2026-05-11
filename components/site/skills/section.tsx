import { getSkills } from "@/utils/skills/fetch";
import { SectionHeading } from "@/components/site/atoms/section-heading";
import { SkillCard } from "@/components/site/skills/skill-card";

interface SkillsProps {
  heading: string;
  eyebrow?: string;
  subtitle?: string;
}

export async function Skills({ heading, eyebrow, subtitle }: SkillsProps) {
  const skills = await getSkills();

  return (
    <section
      id="skills"
      aria-labelledby="skills-heading"
      className="container-page section-divider-b py-16 md:py-24 lg:py-28"
    >
      <SectionHeading
        eyebrow={eyebrow}
        title={heading}
        subtitle={subtitle}
        id="skills-heading"
        className="mb-10 md:mb-14"
      />

      {skills.length === 0 ? (
        <p className="text-muted-foreground">—</p>
      ) : (
        <ul className="grid list-none gap-3 p-0 sm:gap-4 grid-cols-[repeat(auto-fit,minmax(140px,1fr))]">
          {skills.map((skill, i) => (
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
      )}
    </section>
  );
}
