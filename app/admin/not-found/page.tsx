import { requireAdmin } from "@/utils/auth/admin";
import { createAdminClient } from "@/utils/supabase/admin";
import { SectionHeader } from "@/components/admin/primitives/section-header";
import { TranslationGrid } from "@/components/admin/content/translation-grid";
import { AddSlugForm } from "@/components/admin/content/add-slug-form";
import {
  bulkUpdateNotFoundAction,
  createNotFoundSlugAction,
  deleteNotFoundSlugAction,
} from "@/app/admin/_actions/not-found";

export const dynamic = "force-dynamic";

export default async function NotFoundAdminPage() {
  await requireAdmin();
  const supabase = createAdminClient();

  const [langsRes, rowsRes] = await Promise.all([
    supabase
      .from("languages")
      .select("id, code, name")
      .order("id", { ascending: true }),
    supabase
      .from("not_found")
      .select("slug, value, language_id, position")
      .order("position", { ascending: true }),
  ]);

  const langs = (langsRes.data ?? []) as Array<{
    id: number;
    code: string;
    name: string;
  }>;
  const rows = (rowsRes.data ?? []) as Array<{
    slug: string;
    value: string;
    language_id: number;
    position: number;
  }>;

  const valueMap = new Map<string, string>();
  const slugSet = new Set<string>();
  for (const r of rows) {
    valueMap.set(`${r.slug}::${r.language_id}`, r.value);
    slugSet.add(r.slug);
  }
  const slugs = Array.from(slugSet);

  return (
    <div className="flex flex-col gap-8">
      <SectionHeader
        eyebrow="Site"
        title="404 strings"
        description="Strings rendered on the page-not-found page, per language."
      />

      <AddSlugForm action={createNotFoundSlugAction} placeholder="page_not_found" />

      <TranslationGrid
        slugs={slugs}
        languages={langs}
        values={valueMap}
        fieldPrefix="notfound"
        bulkAction={bulkUpdateNotFoundAction}
        deleteSlugAction={deleteNotFoundSlugAction}
      />
    </div>
  );
}
