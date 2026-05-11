import { requireAdmin } from "@/utils/auth/admin";
import { createAdminClient } from "@/utils/supabase/admin";
import { SectionHeader } from "@/components/admin/primitives/section-header";
import { SortableAbout } from "@/components/admin/about/sortable-about";
import {
  bulkUpdateAboutAction,
  createAboutSectionAction,
  deleteAboutSectionAction,
} from "@/app/admin/_actions/about";
import type { AboutSection } from "@/components/admin/types";

export const dynamic = "force-dynamic";

export default async function AboutAdminPage() {
  await requireAdmin();
  const supabase = createAdminClient();

  const [langsRes, rowsRes] = await Promise.all([
    supabase
      .from("languages")
      .select("id, code, name")
      .order("id", { ascending: true }),
    supabase
      .from("about_sections")
      .select("id, language_id, heading, body, position")
      .order("language_id", { ascending: true })
      .order("position", { ascending: true }),
  ]);

  const langs = (langsRes.data ?? []) as Array<{
    id: number;
    code: string;
    name: string;
  }>;
  const rows = (rowsRes.data ?? []) as AboutSection[];

  return (
    <div className="flex flex-col gap-10">
      <SectionHeader
        eyebrow="Site"
        title="About"
        description="One column per language. Drag sections to reorder, edit heading and body, save per language."
      />

      <div className="grid gap-6 xl:grid-cols-2">
        {langs.map((lang) => {
          const langRows = rows.filter((r) => r.language_id === lang.id);
          return (
            <section
              key={lang.id}
              className="flex flex-col gap-3"
              aria-labelledby={`about-${lang.code}`}
            >
              <header className="flex items-baseline justify-between">
                <div>
                  <p className="admin-eyebrow">{lang.code}</p>
                  <h2
                    id={`about-${lang.code}`}
                    className="text-lg font-semibold tracking-tight"
                  >
                    {lang.name}
                  </h2>
                </div>
                <span className="font-mono text-[10px] tabular-nums text-muted-foreground">
                  {langRows.length} section{langRows.length === 1 ? "" : "s"}
                </span>
              </header>

              <SortableAbout
                initial={langRows}
                languageId={lang.id}
                languageCode={lang.code}
                bulkAction={bulkUpdateAboutAction}
                createAction={createAboutSectionAction}
                deleteAction={deleteAboutSectionAction}
              />
            </section>
          );
        })}
      </div>
    </div>
  );
}
