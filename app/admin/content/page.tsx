import { requireAdmin } from "@/utils/auth/admin";
import { createAdminClient } from "@/utils/supabase/admin";
import { SectionHeader } from "@/components/admin/primitives/section-header";
import { TranslationGrid } from "@/components/admin/content/translation-grid";
import { AddSlugForm } from "@/components/admin/content/add-slug-form";
import {
  bulkUpdateContentAction,
  createContentSlugAction,
  deleteContentSlugAction,
} from "@/app/admin/_actions/content";

export const dynamic = "force-dynamic";

export default async function ContentAdminPage() {
  await requireAdmin();
  const supabase = createAdminClient();

  const [langsRes, blocksRes] = await Promise.all([
    supabase
      .from("languages")
      .select("id, code, name")
      .order("id", { ascending: true }),
    supabase.from("content_blocks").select("slug, value, language_id"),
  ]);

  const langs = (langsRes.data ?? []) as Array<{
    id: number;
    code: string;
    name: string;
  }>;
  const blocks = (blocksRes.data ?? []) as Array<{
    slug: string;
    value: string;
    language_id: number;
  }>;

  const valueMap = new Map<string, string>();
  const slugSet = new Set<string>();
  for (const b of blocks) {
    valueMap.set(`${b.slug}::${b.language_id}`, b.value);
    slugSet.add(b.slug);
  }
  const slugs = Array.from(slugSet).sort();

  return (
    <div className="flex flex-col gap-8">
      <SectionHeader
        eyebrow="Site"
        title="Content blocks"
        description="Translatable strings keyed by slug. Hero, section headings, CTA labels."
      />

      <AddSlugForm action={createContentSlugAction} placeholder="my_section_heading" />

      <TranslationGrid
        slugs={slugs}
        languages={langs}
        values={valueMap}
        fieldPrefix="content"
        bulkAction={bulkUpdateContentAction}
        deleteSlugAction={deleteContentSlugAction}
      />
    </div>
  );
}
