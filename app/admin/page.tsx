import Link from "next/link";
import { requireAdmin } from "@/utils/auth/admin";
import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

interface Card {
  href: string;
  title: string;
  desc: string;
  countKey: string;
}

interface Group {
  label: string;
  description: string;
  cards: Card[];
}

const GROUPS: Group[] = [
  {
    label: "Design",
    description: "Visual identity — colors, dimensions, copy.",
    cards: [
      {
        href: "/admin/theme",
        title: "Theme",
        desc: "Colors, dimensions, design tokens",
        countKey: "theme",
      },
      {
        href: "/admin/content",
        title: "Content",
        desc: "Hero, headings, CTAs per locale",
        countKey: "content",
      },
    ],
  },
  {
    label: "Data",
    description: "Site content fetched and shown publicly.",
    cards: [
      {
        href: "/admin/skills",
        title: "Skills",
        desc: "Tech stack with proficiency + icons",
        countKey: "skills",
      },
      {
        href: "/admin/projects",
        title: "Projects",
        desc: "GitHub repos + i18n + screenshots",
        countKey: "projects",
      },
    ],
  },
  {
    label: "Settings",
    description: "Navigation and locales.",
    cards: [
      {
        href: "/admin/navbar",
        title: "Navbar",
        desc: "Menu items per language",
        countKey: "navbar",
      },
      {
        href: "/admin/languages",
        title: "Languages",
        desc: "Add or remove locales",
        countKey: "languages",
      },
    ],
  },
];

export default async function AdminDashboard() {
  const user = await requireAdmin();
  const supabase = await createClient();

  const [skills, projects, navbar, languages, theme, content] =
    await Promise.all([
      supabase.from("skills").select("*", { count: "exact", head: true }),
      supabase.from("projects").select("*", { count: "exact", head: true }),
      supabase.from("navbar").select("*", { count: "exact", head: true }),
      supabase.from("languages").select("*", { count: "exact", head: true }),
      supabase
        .from("theme_settings")
        .select("*", { count: "exact", head: true }),
      supabase
        .from("content_blocks")
        .select("*", { count: "exact", head: true }),
    ]);

  const counts: Record<string, number | null> = {
    skills: skills.count,
    projects: projects.count,
    navbar: navbar.count,
    languages: languages.count,
    theme: theme.count,
    content: content.count,
  };

  return (
    <div className="flex flex-col gap-12">
      <header>
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
          Welcome
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          {user.email}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Manage every editable surface of the site from here.
        </p>
      </header>

      {GROUPS.map((group) => (
        <section key={group.label}>
          <header className="mb-4">
            <h2 className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
              {group.label}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {group.description}
            </p>
          </header>
          <ul className="grid list-none gap-3 p-0 sm:grid-cols-2">
            {group.cards.map((card) => (
              <li key={card.href}>
                <Link
                  href={card.href}
                  className="block rounded-xl border border-dashed border-dashed-soft bg-card p-5 transition-colors hover:border-accent-blue hover:shadow-[0_0_0_1px_var(--accent-blue-soft)]"
                >
                  <div className="flex items-baseline justify-between gap-2">
                    <h3 className="text-base font-medium tracking-tight">
                      {card.title}
                    </h3>
                    <span className="font-mono text-xs tabular-nums text-muted-foreground">
                      {counts[card.countKey] ?? "—"}
                    </span>
                  </div>
                  <p className="mt-1.5 text-sm text-muted-foreground">
                    {card.desc}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
