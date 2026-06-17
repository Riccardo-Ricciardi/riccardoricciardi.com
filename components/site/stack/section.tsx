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
  groupLabels?: Partial<GroupLabels>;
}

interface StackItem {
  label: string;
  core?: boolean;
}

const FALLBACK_LABELS: GroupLabels = {
  languages: "Languages",
  frontend: "Frontend",
  backend: "Backend & Infra",
  hardware: "Hardware & QA",
};

const STACK_GROUPS: { key: keyof GroupLabels; items: StackItem[] }[] = [
  {
    key: "languages",
    items: [
      { label: "TypeScript", core: true },
      { label: "Python", core: true },
    ],
  },
  {
    key: "frontend",
    items: [
      { label: "Next.js", core: true },
      { label: "React" },
      { label: "Tailwind" },
    ],
  },
  {
    key: "backend",
    items: [
      { label: "Supabase", core: true },
      { label: "Node.js" },
      { label: "PostgreSQL" },
      { label: "Vercel" },
    ],
  },
  {
    key: "hardware",
    items: [{ label: "Raspberry Pi" }, { label: "ESP32" }, { label: "Playwright" }],
  },
];

export function StackRow({ eyebrow, heading, intro, groupLabels }: StackRowProps) {
  const labels = { ...FALLBACK_LABELS, ...groupLabels };

  return (
    <section className="section-divider-b">
      <div className="container-page section-y flex flex-col gap-10">
        <Reveal variant="fade-up">
          <Heading level="h2" eyebrow={eyebrow} title={heading} subtitle={intro} />
        </Reveal>

        <Reveal variant="fade-up">
          <dl className="flex flex-col">
            {STACK_GROUPS.map((group) => (
              <div
                key={group.key}
                className="grid grid-cols-1 gap-x-8 gap-y-2 border-t border-border py-5 last:border-b sm:grid-cols-[13rem_1fr]"
              >
                <dt className="text-eyebrow pt-1">{labels[group.key]}</dt>
                <dd className="flex flex-wrap items-center gap-x-3 gap-y-2 font-mono text-base">
                  {group.items.map((item, j) => (
                    <span key={item.label} className="flex items-center gap-3">
                      <span className={item.core ? "text-signal" : "text-foreground"}>
                        {item.label}
                      </span>
                      {j < group.items.length - 1 && (
                        <span aria-hidden="true" className="text-fg-subtle">
                          ·
                        </span>
                      )}
                    </span>
                  ))}
                </dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </div>
    </section>
  );
}
