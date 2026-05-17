import { Sparkles } from "lucide-react";
import { requireAdmin } from "@/utils/auth/admin";
import { createAdminClient } from "@/utils/supabase/admin";
import { SectionHeader } from "@/components/admin/primitives/section-header";
import { EmptyState } from "@/components/admin/primitives/empty-state";
import { SortableSkills } from "@/components/admin/skills/sortable-skills";
import { AddSkillForm } from "@/components/admin/skills/add-skill-form";
import { SortableCategories } from "@/components/admin/skills/sortable-categories";
import {
  bulkUpdateSkillsAction,
  createSkillAction,
  deleteSkillAction,
} from "@/app/admin/_actions/skills";
import {
  bulkUpdateSkillCategoriesAction,
  createSkillCategoryAction,
  deleteSkillCategoryAction,
} from "@/app/admin/_actions/skill-categories";
import type { Skill, SkillCategory } from "@/components/admin/types";

export const dynamic = "force-dynamic";

export default async function SkillsAdminPage() {
  await requireAdmin();
  const supabase = createAdminClient();

  const [{ data: skillsData }, { data: categoriesData }] = await Promise.all([
    supabase
      .from("skills")
      .select(
        "id, name, position, percentage, dark, category, icon_url, icon_dark_url"
      )
      .order("position", { ascending: true }),
    supabase
      .from("skill_categories")
      .select("slug, label_it, label_en, icon, position")
      .order("position", { ascending: true }),
  ]);

  const skills = ((skillsData ?? []) as Skill[]).map((r, i) => ({
    ...r,
    position: r.position ?? i,
    percentage: r.percentage ?? 0,
    dark: r.dark ?? false,
  }));
  const categories = (categoriesData ?? []) as SkillCategory[];

  return (
    <div className="flex flex-col gap-10">
      <SectionHeader
        eyebrow="Catalog"
        title="Skills"
        description="Group skills into categories, reorder both, edit labels and proficiency, then save in one go."
      />

      <section className="flex flex-col gap-4">
        <h2 className="admin-eyebrow">Categories</h2>
        <p className="text-xs text-muted-foreground">
          Drag to reorder. Public cards appear in this order. Deleting a category leaves its skills uncategorized.
        </p>
        <SortableCategories
          initial={categories}
          bulkAction={bulkUpdateSkillCategoriesAction}
          createAction={createSkillCategoryAction}
          deleteAction={deleteSkillCategoryAction}
        />
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="admin-eyebrow">Skills</h2>
        <AddSkillForm action={createSkillAction} categories={categories} />

        {skills.length === 0 ? (
          <EmptyState
            icon={Sparkles}
            title="No skills yet"
            description="Add your first skill above. Pick a category to slot it into a public card."
          />
        ) : (
          <SortableSkills
            initial={skills}
            categories={categories}
            bulkAction={bulkUpdateSkillsAction}
            deleteAction={deleteSkillAction}
          />
        )}
      </section>
    </div>
  );
}
