import { requireAdmin } from "@/utils/auth/admin";
import { createAdminClient } from "@/utils/supabase/admin";
import { SectionHeader } from "@/components/admin/primitives/section-header";
import { LanguageRow } from "@/components/admin/languages/language-row";
import { CloneLanguageForm } from "@/components/admin/languages/clone-language-form";
import {
  cloneLanguageAction,
  deleteLanguageAction,
  renameLanguageAction,
} from "@/app/admin/_actions/languages";

export const dynamic = "force-dynamic";

export default async function LanguagesAdminPage() {
  await requireAdmin();
  const supabase = createAdminClient();

  const { data } = await supabase
    .from("languages")
    .select("id, code, name")
    .order("id", { ascending: true });

  const langs = (data ?? []) as Array<{
    id: number;
    code: string;
    name: string;
  }>;

  return (
    <div className="flex flex-col gap-8">
      <SectionHeader
        eyebrow="System"
        title="Languages"
        description="Add new locales by cloning translations from an existing one. Rename codes in place. Deleting cascades to all translation tables."
      />

      <section>
        <p className="admin-eyebrow mb-2">Add a new locale (clone)</p>
        <CloneLanguageForm languages={langs} action={cloneLanguageAction} />
      </section>

      <section>
        <p className="admin-eyebrow mb-2">Existing locales</p>
        <div className="flex flex-col gap-2">
          {langs.map((l) => (
            <LanguageRow
              key={l.id}
              id={l.id}
              code={l.code}
              name={l.name}
              renameAction={renameLanguageAction}
              deleteAction={deleteLanguageAction}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
