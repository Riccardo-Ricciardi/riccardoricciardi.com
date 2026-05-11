import { Sparkles } from "lucide-react";
import { requireAdmin } from "@/utils/auth/admin";
import { createAdminClient } from "@/utils/supabase/admin";
import { SectionHeader } from "@/components/admin/primitives/section-header";
import { EmptyState } from "@/components/admin/primitives/empty-state";
import { SortableSkills } from "@/components/admin/skills/sortable-skills";
import { AddSkillForm } from "@/components/admin/skills/add-skill-form";
import {
  bulkUpdateSkillsAction,
  createSkillAction,
  deleteSkillAction,
} from "@/app/admin/_actions/skills";
import type { Skill } from "@/components/admin/types";

export const dynamic = "force-dynamic";

export default async function SkillsAdminPage() {
  await requireAdmin();
  const supabase = createAdminClient();

  const { data } = await supabase
    .from("skills")
    .select(
      "id, name, position, percentage, dark, category, icon_url, icon_dark_url"
    )
    .order("position", { ascending: true });

  const rows = ((data ?? []) as Skill[]).map((r, i) => ({
    ...r,
    position: r.position ?? i,
    percentage: r.percentage ?? 0,
    dark: r.dark ?? false,
  }));

  return (
    <div className="flex flex-col gap-8">
      <SectionHeader
        eyebrow="Catalog"
        title="Skills"
        description="Drag to reorder, tweak proficiency, toggle dark icon variants, then save in one go."
      />

      <AddSkillForm action={createSkillAction} />

      {rows.length === 0 ? (
        <EmptyState
          icon={Sparkles}
          title="No skills yet"
          description="Add your first skill above. Reorder later by dragging."
        />
      ) : (
        <SortableSkills
          initial={rows}
          bulkAction={bulkUpdateSkillsAction}
          deleteAction={deleteSkillAction}
        />
      )}
    </div>
  );
}
