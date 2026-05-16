import { getSkills } from "@/utils/skills/fetch";
import { SectionHeading } from "@/components/site/atoms/section-heading";
import { SkillsBoard } from "@/components/site/skills/skills-board";

interface SkillsProps {
  heading: string;
  eyebrow?: string;
  subtitle?: string;
  locale?: string;
  emptyTitle?: string;
  emptyBody?: string;
}

export async function Skills({
  heading,
  eyebrow,
  subtitle,
  locale,
  emptyTitle,
  emptyBody,
}: SkillsProps) {
  const skills = await getSkills();

  return (
    <section
      id="skills"
      aria-labelledby="skills-heading"
      className="container-page section-divider-b section-y"
    >
      <SectionHeading
        eyebrow={eyebrow}
        title={heading}
        subtitle={subtitle}
        id="skills-heading"
        className="mb-10 md:mb-14"
      />

      <SkillsBoard
        skills={skills}
        locale={locale}
        emptyTitle={emptyTitle}
        emptyBody={emptyBody}
      />
    </section>
  );
}
