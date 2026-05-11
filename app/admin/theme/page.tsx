import { requireAdmin } from "@/utils/auth/admin";
import { createAdminClient } from "@/utils/supabase/admin";
import { SectionHeader } from "@/components/admin/primitives/section-header";
import { ThemeGrid } from "@/components/admin/theme/theme-grid";
import { bulkUpdateThemeAction } from "@/app/admin/_actions/theme";
import type { ThemeSettingRow } from "@/components/admin/types";

export const dynamic = "force-dynamic";

export default async function ThemeAdminPage() {
  await requireAdmin();
  const supabase = createAdminClient();

  const { data } = await supabase
    .from("theme_settings")
    .select(
      "key, value_light, value_dark, type, group_name, description, position"
    )
    .order("group_name", { ascending: true })
    .order("position", { ascending: true });

  const rows = (data ?? []) as ThemeSettingRow[];

  return (
    <div className="flex flex-col gap-8">
      <SectionHeader
        eyebrow="System"
        title="Theme tokens"
        description="Design tokens overridable per light/dark mode. Tokens map to CSS custom properties injected at the root."
      />

      <ThemeGrid rows={rows} bulkAction={bulkUpdateThemeAction} />
    </div>
  );
}
