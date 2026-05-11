import { requireAdmin } from "@/utils/auth/admin";
import { createAdminClient } from "@/utils/supabase/admin";
import { SectionHeader } from "@/components/admin/primitives/section-header";
import { SortableNavbar, type NavGroup } from "@/components/admin/navbar/sortable-navbar";
import { AddNavbarForm } from "@/components/admin/navbar/add-navbar-form";
import {
  bulkUpdateNavbarAction,
  createNavbarSlugAction,
  deleteNavbarSlugAction,
} from "@/app/admin/_actions/navbar";

export const dynamic = "force-dynamic";

export default async function NavbarAdminPage() {
  await requireAdmin();
  const supabase = createAdminClient();

  const [langsRes, navRes] = await Promise.all([
    supabase
      .from("languages")
      .select("id, code, name")
      .order("id", { ascending: true }),
    supabase
      .from("navbar")
      .select("slug, value, language_id, position")
      .order("position", { ascending: true }),
  ]);

  const langs = (langsRes.data ?? []) as Array<{
    id: number;
    code: string;
    name: string;
  }>;
  const navRows = (navRes.data ?? []) as Array<{
    slug: string | null;
    value: string;
    language_id: number;
    position: number;
  }>;

  const groupMap = new Map<string, NavGroup>();
  const slugOrder: string[] = [];
  for (const r of navRows) {
    const slug = r.slug ?? "";
    if (!groupMap.has(slug)) {
      groupMap.set(slug, { slug, perLang: {} });
      slugOrder.push(slug);
    }
    groupMap.get(slug)!.perLang[r.language_id] = r.value;
  }
  const groups = slugOrder.map((s) => groupMap.get(s)!);

  return (
    <div className="flex flex-col gap-8">
      <SectionHeader
        eyebrow="Site"
        title="Navbar"
        description="Public navigation menu. One row per slug, with one label per language."
      />

      <AddNavbarForm languages={langs} action={createNavbarSlugAction} />

      <SortableNavbar
        initial={groups}
        languages={langs}
        bulkAction={bulkUpdateNavbarAction}
        deleteAction={deleteNavbarSlugAction}
      />
    </div>
  );
}
