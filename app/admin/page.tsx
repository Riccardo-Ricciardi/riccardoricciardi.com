import Link from "next/link";
import { AlertTriangle, ArrowUpRight, CheckCircle2, Plus } from "lucide-react";
import { requireAdmin } from "@/utils/auth/admin";
import { createAdminClient } from "@/utils/supabase/admin";
import { CONTENT_SCHEMA, KNOWN_SLUGS } from "@/utils/content/schema";

export const dynamic = "force-dynamic";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://riccardoricciardi.com";

interface SkillRow {
  id: number;
  name: string;
  dark: boolean | null;
  icon_url: string | null;
  icon_dark_url: string | null;
}
interface ProjectRow {
  id: string;
  repo: string;
  visible: boolean;
  screenshot_url: string | null;
  og_image: string | null;
  synced_at: string | null;
}
interface NavRow {
  id: number;
  slug: string | null;
  language_id: number;
  value: string | null;
}
interface ContentBlock {
  id: number;
  slug: string;
  value: string;
  language_id: number;
  updated_at: string | null;
}
interface ThemeRow {
  key: string;
  updated_at: string | null;
}
interface ProjectI18nRow {
  project_id: string;
  language_id: number;
  description: string | null;
}
interface Lang {
  id: number;
  code: string;
  name: string;
}

interface LocaleStat {
  code: string;
  name: string;
  navbar: { filled: number; total: number };
  content: { filled: number; total: number };
  projects: { filled: number; total: number };
}

interface HealthIssue {
  severity: "warn" | "error";
  message: string;
  href: string;
}

interface ActivityItem {
  label: string;
  ts: string;
  href: string;
}

interface SurfaceCardData {
  group: "Design" | "Data" | "Settings";
  href: string;
  title: string;
  desc: string;
  total: number;
  lastEdit?: string | null;
  split?: {
    primary: number;
    secondary: number;
    primaryLabel: string;
    secondaryLabel: string;
  };
  addHref?: string;
}

export default async function AdminDashboard() {
  const user = await requireAdmin();
  const supabase = createAdminClient();

  const [
    skillsRes,
    projectsRes,
    navbarRes,
    languagesRes,
    themeRes,
    contentRes,
    i18nRes,
  ] = await Promise.all([
    supabase.from("skills").select("id, name, dark, icon_url, icon_dark_url"),
    supabase
      .from("projects")
      .select("id, repo, visible, screenshot_url, og_image, synced_at"),
    supabase.from("navbar").select("id, slug, language_id, value"),
    supabase
      .from("languages")
      .select("id, code, name")
      .order("id", { ascending: true }),
    supabase.from("theme_settings").select("key, updated_at"),
    supabase
      .from("content_blocks")
      .select("id, slug, value, language_id, updated_at"),
    supabase
      .from("projects_i18n")
      .select("project_id, language_id, description"),
  ]);

  const skills = (skillsRes.data ?? []) as SkillRow[];
  const projects = (projectsRes.data ?? []) as ProjectRow[];
  const navbar = (navbarRes.data ?? []) as NavRow[];
  const languages = (languagesRes.data ?? []) as Lang[];
  const themeRows = (themeRes.data ?? []) as ThemeRow[];
  const blocks = (contentRes.data ?? []) as ContentBlock[];
  const i18nRows = (i18nRes.data ?? []) as ProjectI18nRow[];

  const skillsTotal = skills.length;
  const projectsTotal = projects.length;
  const projectsVisible = projects.filter((p) => p.visible).length;
  const projectsHidden = projectsTotal - projectsVisible;
  const localesTotal = languages.length;

  const navbarSlugSet = new Set(
    navbar.map((n) => n.slug ?? "").filter((s) => s.length > 0)
  );
  const navbarSlugCount = navbarSlugSet.size;

  const contentDbSlugs = new Set(blocks.map((b) => b.slug));
  const schemaSlugCount = KNOWN_SLUGS.size;

  const visibleProjectIds = new Set(
    projects.filter((p) => p.visible).map((p) => p.id)
  );

  const themeLastEdit = themeRows.reduce<string | null>(
    (acc, r) => latest(acc, r.updated_at),
    null
  );
  const contentLastEdit = blocks.reduce<string | null>(
    (acc, b) => latest(acc, b.updated_at),
    null
  );
  const projectsLastSync = projects.reduce<string | null>(
    (acc, p) => latest(acc, p.synced_at),
    null
  );
  const overallLastEdit = [themeLastEdit, contentLastEdit, projectsLastSync].reduce<
    string | null
  >((acc, t) => latest(acc, t), null);

  const localeStats: LocaleStat[] = languages.map((l) => {
    const navbarFilled = new Set(
      navbar
        .filter(
          (n) =>
            n.language_id === l.id && (n.value ?? "").trim().length > 0
        )
        .map((n) => n.slug ?? "")
    ).size;
    const contentFilled = blocks.filter(
      (b) =>
        b.language_id === l.id &&
        KNOWN_SLUGS.has(b.slug) &&
        b.value.trim().length > 0
    ).length;
    const i18nFilled = i18nRows.filter(
      (pi) =>
        pi.language_id === l.id &&
        visibleProjectIds.has(pi.project_id) &&
        (pi.description ?? "").trim().length > 0
    ).length;
    return {
      code: l.code,
      name: l.name,
      navbar: { filled: navbarFilled, total: navbarSlugCount },
      content: { filled: contentFilled, total: schemaSlugCount },
      projects: { filled: i18nFilled, total: visibleProjectIds.size },
    };
  });

  const issues: HealthIssue[] = [];

  for (const s of skills) {
    if (s.dark && !s.icon_dark_url) {
      issues.push({
        severity: "warn",
        message: `Skill "${s.name}" marked dark but has no dark icon`,
        href: `/admin/skills/${s.id}`,
      });
    }
  }

  for (const p of projects) {
    if (p.visible && !p.screenshot_url && !p.og_image) {
      issues.push({
        severity: "warn",
        message: `Project "${p.repo}" has no screenshot and no og_image`,
        href: `/admin/projects/${p.id}`,
      });
    }
  }

  for (const stat of localeStats) {
    if (stat.navbar.total > 0 && stat.navbar.filled === 0) {
      issues.push({
        severity: "error",
        message: `Locale "${stat.code}" has no navbar items`,
        href: "/admin/navbar",
      });
    }
    if (stat.content.total > 0 && stat.content.filled === 0) {
      issues.push({
        severity: "error",
        message: `Locale "${stat.code}" has no content blocks filled`,
        href: "/admin/content",
      });
    }
  }

  for (const slug of navbarSlugSet) {
    const present = new Set(
      navbar
        .filter(
          (n) => n.slug === slug && (n.value ?? "").trim().length > 0
        )
        .map((n) => n.language_id)
    );
    const missing = languages.filter((l) => !present.has(l.id));
    if (missing.length > 0 && missing.length < languages.length) {
      issues.push({
        severity: "warn",
        message: `Navbar slug "${slug}" missing in ${missing
          .map((m) => m.code)
          .join(", ")}`,
        href: "/admin/navbar",
      });
    }
  }

  for (const section of CONTENT_SCHEMA) {
    for (const field of section.fields) {
      const present = new Set(
        blocks
          .filter((b) => b.slug === field.slug && b.value.trim().length > 0)
          .map((b) => b.language_id)
      );
      const missing = languages.filter((l) => !present.has(l.id));
      if (missing.length > 0 && languages.length > 0) {
        issues.push({
          severity: missing.length === languages.length ? "error" : "warn",
          message: `Content "${field.slug}" missing in ${missing
            .map((m) => m.code)
            .join(", ")}`,
          href: "/admin/content",
        });
      }
    }
  }

  const activity: ActivityItem[] = [];
  for (const t of themeRows) {
    if (t.updated_at) {
      activity.push({
        label: `Theme — ${t.key}`,
        ts: t.updated_at,
        href: "/admin/theme",
      });
    }
  }
  for (const b of blocks) {
    if (b.updated_at) {
      activity.push({
        label: `Content — ${b.slug}`,
        ts: b.updated_at,
        href: "/admin/content",
      });
    }
  }
  activity.sort((a, b) => (a.ts < b.ts ? 1 : -1));
  const recent = activity.slice(0, 6);

  const surfaces: SurfaceCardData[] = [
    {
      group: "Design",
      href: "/admin/theme",
      title: "Theme",
      desc: "Design tokens — colors, dimensions",
      total: themeRows.length,
      lastEdit: themeLastEdit,
    },
    {
      group: "Design",
      href: "/admin/content",
      title: "Content",
      desc: "Hero, headings, CTAs per locale",
      total: contentDbSlugs.size,
      lastEdit: contentLastEdit,
    },
    {
      group: "Data",
      href: "/admin/skills",
      title: "Skills",
      desc: "Tech stack with proficiency + icons",
      total: skillsTotal,
      addHref: "/admin/skills#add",
    },
    {
      group: "Data",
      href: "/admin/projects",
      title: "Projects",
      desc: "GitHub repos + i18n + screenshots",
      total: projectsTotal,
      lastEdit: projectsLastSync,
      split: {
        primary: projectsVisible,
        secondary: projectsHidden,
        primaryLabel: "visible",
        secondaryLabel: "hidden",
      },
      addHref: "/admin/projects#add",
    },
    {
      group: "Settings",
      href: "/admin/navbar",
      title: "Navbar",
      desc: "Menu items per language",
      total: navbarSlugCount,
      addHref: "/admin/navbar#add",
    },
    {
      group: "Settings",
      href: "/admin/languages",
      title: "Languages",
      desc: "Add or remove locales",
      total: localesTotal,
      addHref: "/admin/languages#add",
    },
  ];

  const groups: Array<"Design" | "Data" | "Settings"> = [
    "Design",
    "Data",
    "Settings",
  ];

  return (
    <div className="flex flex-col gap-10">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            Welcome
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            {user.email}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Snapshot of every editable surface. Last edit{" "}
            <span className="font-mono text-xs">
              {overallLastEdit ? formatRel(overallLastEdit) : "—"}
            </span>
            .
          </p>
        </div>
        <a
          href={SITE_URL}
          target="_blank"
          rel="noreferrer"
          className="group inline-flex items-center gap-1.5 self-start rounded-md border border-dashed border-dashed-soft px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider text-muted-foreground transition-colors hover:border-accent-blue hover:text-accent-blue"
        >
          View live site
          <ArrowUpRight className="h-3 w-3 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </a>
      </header>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Tile label="Skills" value={skillsTotal} />
        <Tile
          label="Projects"
          value={projectsTotal}
          sub={`${projectsVisible} visible · ${projectsHidden} hidden`}
        />
        <Tile
          label="Locales"
          value={localesTotal}
          sub={languages.map((l) => l.code).join(" · ") || undefined}
        />
        <Tile
          label="Content slugs"
          value={schemaSlugCount}
          sub={`${contentDbSlugs.size} in DB`}
        />
      </section>

      {languages.length > 0 && (
        <section>
          <header className="mb-3">
            <h2 className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              Locale completeness
            </h2>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              Translation coverage across navbar, content blocks, and project descriptions.
            </p>
          </header>
          <div className="overflow-x-auto rounded-lg border border-dashed border-dashed-soft">
            <table className="w-full min-w-[520px] text-sm">
              <thead>
                <tr className="border-b border-dashed border-dashed-soft text-left">
                  <Th className="w-32">Locale</Th>
                  <Th>Navbar</Th>
                  <Th>Content</Th>
                  <Th>Projects i18n</Th>
                </tr>
              </thead>
              <tbody>
                {localeStats.map((stat) => (
                  <tr
                    key={stat.code}
                    className="border-b border-dashed border-dashed-soft last:border-b-0"
                  >
                    <td className="px-3 py-2">
                      <div className="flex flex-col">
                        <span className="font-mono text-xs uppercase tracking-wider">
                          {stat.code}
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                          {stat.name}
                        </span>
                      </div>
                    </td>
                    <CompletenessCell
                      filled={stat.navbar.filled}
                      total={stat.navbar.total}
                    />
                    <CompletenessCell
                      filled={stat.content.filled}
                      total={stat.content.total}
                    />
                    <CompletenessCell
                      filled={stat.projects.filled}
                      total={stat.projects.total}
                    />
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <section>
        <header className="mb-3 flex items-baseline justify-between">
          <div>
            <h2 className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              Health checks
            </h2>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              Issues detected across content, skills, and projects.
            </p>
          </div>
          <span className="font-mono text-xs tabular-nums text-muted-foreground">
            {issues.length} issue{issues.length === 1 ? "" : "s"}
          </span>
        </header>
        {issues.length === 0 ? (
          <div className="flex items-center gap-2 rounded-lg border border-dashed border-dashed-soft px-3 py-3 text-xs text-muted-foreground">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            <span>All systems clean.</span>
          </div>
        ) : (
          <ul className="flex list-none flex-col gap-1.5 p-0">
            {issues.slice(0, 12).map((issue, i) => (
              <li key={i}>
                <Link
                  href={issue.href}
                  className={`group flex items-start justify-between gap-3 rounded-md border border-dashed px-3 py-2 text-xs transition-colors ${
                    issue.severity === "error"
                      ? "border-red-500/40 bg-red-500/5 hover:border-red-500/70"
                      : "border-amber-500/40 bg-amber-500/5 hover:border-amber-500/70"
                  }`}
                >
                  <span className="flex items-start gap-2">
                    <AlertTriangle
                      className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${
                        issue.severity === "error"
                          ? "text-red-600"
                          : "text-amber-600"
                      }`}
                    />
                    <span
                      className={
                        issue.severity === "error"
                          ? "text-red-700 dark:text-red-300"
                          : "text-amber-800 dark:text-amber-200"
                      }
                    >
                      {issue.message}
                    </span>
                  </span>
                  <ArrowUpRight className="h-3 w-3 shrink-0 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </Link>
              </li>
            ))}
            {issues.length > 12 && (
              <li className="px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                + {issues.length - 12} more
              </li>
            )}
          </ul>
        )}
      </section>

      {groups.map((group) => (
        <section key={group}>
          <header className="mb-3">
            <h2 className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              {group}
            </h2>
          </header>
          <ul className="grid list-none gap-3 p-0 sm:grid-cols-2">
            {surfaces
              .filter((s) => s.group === group)
              .map((card) => (
                <li key={card.href}>
                  <SurfaceCard data={card} />
                </li>
              ))}
          </ul>
        </section>
      ))}

      <section>
        <header className="mb-3">
          <h2 className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            Recent activity
          </h2>
        </header>
        {recent.length === 0 ? (
          <p className="text-xs text-muted-foreground">No recent edits.</p>
        ) : (
          <ul className="flex list-none flex-col gap-1 p-0">
            {recent.map((item, i) => (
              <li
                key={i}
                className="flex items-baseline justify-between gap-3 px-1 py-1.5 text-xs"
              >
                <Link
                  href={item.href}
                  className="text-foreground hover:text-accent-blue"
                >
                  {item.label}
                </Link>
                <span className="font-mono text-[10px] tabular-nums text-muted-foreground">
                  {formatRel(item.ts)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function latest(a: string | null, b: string | null): string | null {
  if (!a) return b;
  if (!b) return a;
  return a > b ? a : b;
}

function formatRel(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "—";
  const now = Date.now();
  const diff = Math.max(0, now - then);
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return `${sec}s ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const d = Math.floor(hr / 24);
  if (d < 30) return `${d}d ago`;
  const mo = Math.floor(d / 30);
  if (mo < 12) return `${mo}mo ago`;
  const y = Math.floor(mo / 12);
  return `${y}y ago`;
}

function Th({
  children,
  className = "",
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <th
      className={`px-3 py-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground ${className}`}
    >
      {children}
    </th>
  );
}

function Tile({
  label,
  value,
  sub,
}: {
  label: string;
  value: number;
  sub?: string;
}) {
  return (
    <div className="rounded-xl border border-dashed border-dashed-soft bg-card p-4">
      <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-3xl font-semibold tabular-nums tracking-tight">
        {value}
      </p>
      {sub && (
        <p className="mt-1 truncate font-mono text-[10px] text-muted-foreground">
          {sub}
        </p>
      )}
    </div>
  );
}

function CompletenessCell({
  filled,
  total,
}: {
  filled: number;
  total: number;
}) {
  const pct = total === 0 ? null : Math.round((filled / total) * 100);
  const tone =
    pct === null ? "neutral" : pct >= 100 ? "ok" : pct >= 50 ? "warn" : "bad";
  const dotColor =
    tone === "ok"
      ? "bg-emerald-500"
      : tone === "warn"
        ? "bg-amber-500"
        : tone === "bad"
          ? "bg-red-500"
          : "bg-muted-foreground/30";
  return (
    <td className="px-3 py-2">
      <div className="flex items-center gap-2">
        <span className={`inline-block h-1.5 w-1.5 rounded-full ${dotColor}`} />
        <span className="font-mono text-xs tabular-nums">
          {filled}/{total}
          {pct !== null && (
            <span className="ml-1.5 text-[10px] text-muted-foreground">
              {pct}%
            </span>
          )}
        </span>
      </div>
    </td>
  );
}

function SurfaceCard({ data }: { data: SurfaceCardData }) {
  return (
    <div className="group relative rounded-xl border border-dashed border-dashed-soft bg-card p-5 transition-colors hover:border-accent-blue hover:shadow-[0_0_0_1px_var(--accent-blue-soft)]">
      <Link
        href={data.href}
        className="absolute inset-0 rounded-xl"
        aria-label={data.title}
      />
      <div className="flex items-baseline justify-between gap-2">
        <h3 className="text-base font-medium tracking-tight">{data.title}</h3>
        <span className="font-mono text-xs tabular-nums text-muted-foreground">
          {data.total}
        </span>
      </div>
      <p className="mt-1.5 text-sm text-muted-foreground">{data.desc}</p>
      <div className="mt-3 flex items-center justify-between gap-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
        <span className="truncate">
          {data.split ? (
            <>
              <span className="text-emerald-600 dark:text-emerald-400">
                {data.split.primary} {data.split.primaryLabel}
              </span>
              {" · "}
              <span>
                {data.split.secondary} {data.split.secondaryLabel}
              </span>
            </>
          ) : data.lastEdit ? (
            <>edited {formatRel(data.lastEdit)}</>
          ) : (
            <>—</>
          )}
        </span>
        {data.addHref && (
          <Link
            href={data.addHref}
            className="relative z-10 inline-flex items-center gap-1 rounded border border-dashed border-dashed-soft px-1.5 py-0.5 text-[10px] hover:border-accent-blue hover:text-accent-blue"
          >
            <Plus className="h-3 w-3" />
            Add
          </Link>
        )}
      </div>
    </div>
  );
}
