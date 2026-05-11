import Link from "next/link";
import {
  ArrowUpRight,
  Briefcase,
  FileText,
  Image as ImageIcon,
  Sparkles,
  User,
} from "lucide-react";
import { requireAdmin } from "@/utils/auth/admin";
import { createAdminClient } from "@/utils/supabase/admin";
import { SectionHeader } from "@/components/admin/primitives/section-header";
import { Stat } from "@/components/admin/primitives/stat";

export const dynamic = "force-dynamic";

const QUICK_ACTIONS = [
  {
    href: "/admin/skills",
    title: "Skills",
    desc: "Tech stack, proficiency, icons",
    icon: Sparkles,
  },
  {
    href: "/admin/projects",
    title: "Projects",
    desc: "GitHub-synced portfolio entries",
    icon: Briefcase,
  },
  {
    href: "/admin/identity",
    title: "Identity",
    desc: "Hero copy, name, CTAs, photo",
    icon: User,
  },
  {
    href: "/admin/about",
    title: "About",
    desc: "Bio sections per language",
    icon: FileText,
  },
  {
    href: "/admin/media",
    title: "Media",
    desc: "Storage browser",
    icon: ImageIcon,
  },
];

export default async function AdminDashboard() {
  const user = await requireAdmin();
  const supabase = createAdminClient();

  const [skillsRes, projectsRes, langsRes, contentRes, mediaRes] =
    await Promise.all([
      supabase.from("skills").select("id", { count: "exact", head: true }),
      supabase
        .from("projects")
        .select("id, visible, synced_at", { count: "exact" }),
      supabase.from("languages").select("code"),
      supabase.from("content_blocks").select("updated_at"),
      supabase.storage.from("image").list("", { limit: 1 }),
    ]);

  const skillsCount = skillsRes.count ?? 0;
  const projectRows = (projectsRes.data ?? []) as Array<{
    id: string;
    visible: boolean | null;
    synced_at: string | null;
  }>;
  const projectsTotal = projectRows.length;
  const projectsVisible = projectRows.filter((p) => p.visible).length;
  const langs = (langsRes.data ?? []) as Array<{ code: string }>;
  const contentRows = (contentRes.data ?? []) as Array<{
    updated_at: string | null;
  }>;
  const lastEdit = contentRows.reduce<string | null>(
    (acc, b) => (b.updated_at && (!acc || b.updated_at > acc) ? b.updated_at : acc),
    null
  );
  const mediaCount = mediaRes.data?.length ?? 0;

  const greet = greeting();

  return (
    <div className="flex flex-col gap-8">
      <SectionHeader
        eyebrow={greet}
        title={user.email ?? "Welcome back"}
        description="Snapshot of every editable surface. Use the sidebar or jump in below."
        actions={
          <Link
            href="https://riccardoricciardi.com"
            target="_blank"
            rel="noopener noreferrer"
            className="admin-button admin-button-ghost"
          >
            View live site
            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        }
      />

      <section
        aria-label="Key metrics"
        className="grid grid-cols-2 gap-3 sm:grid-cols-4"
      >
        <Stat label="Skills" value={skillsCount} icon={Sparkles} />
        <Stat
          label="Projects"
          value={projectsTotal}
          hint={`${projectsVisible} live`}
          icon={Briefcase}
        />
        <Stat
          label="Locales"
          value={langs.length}
          hint={langs.map((l) => l.code).join(" · ") || undefined}
        />
        <Stat
          label="Media"
          value={mediaCount > 0 ? `${mediaCount}+` : 0}
          hint={lastEdit ? `edit ${relTime(lastEdit)}` : undefined}
          icon={ImageIcon}
        />
      </section>

      <section aria-label="Quick actions">
        <p className="admin-eyebrow mb-3">Jump to</p>
        <ul className="grid list-none gap-3 p-0 sm:grid-cols-2 lg:grid-cols-3">
          {QUICK_ACTIONS.map((q) => {
            const Icon = q.icon;
            return (
              <li key={q.href}>
                <Link
                  href={q.href}
                  className="admin-card group relative flex items-start gap-3 px-4 py-4 transition-colors hover:border-[color-mix(in_oklab,var(--accent-blue)_55%,var(--border))]"
                >
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border admin-divider bg-background/60">
                    <Icon
                      className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-accent-blue"
                      aria-hidden="true"
                    />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{q.title}</p>
                    <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                      {q.desc}
                    </p>
                  </div>
                  <ArrowUpRight
                    className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent-blue"
                    aria-hidden="true"
                  />
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}

function greeting(): string {
  const h = new Date().getHours();
  if (h < 5) return "Late night";
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  if (h < 21) return "Good evening";
  return "Night owl";
}

function relTime(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "—";
  const diff = Math.max(0, Date.now() - then);
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
  return `${Math.floor(mo / 12)}y ago`;
}
