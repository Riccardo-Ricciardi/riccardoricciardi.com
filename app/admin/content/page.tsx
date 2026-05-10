import { requireAdmin } from "@/utils/auth/admin";
import { createAdminClient } from "@/utils/supabase/admin";
import {
  bulkUpdateAllContentAction,
  createContentSlugAction,
  deleteContentSlugAction,
} from "@/app/admin/actions";
import { CopyableInput } from "@/components/admin/copyable-input";
import { DeleteButton } from "@/components/admin/delete-button";
import { SubmitButton } from "@/components/admin/submit-button";
import { CONTENT_SCHEMA, KNOWN_SLUGS } from "@/utils/content/schema";
import { APP_CONFIG } from "@/utils/config/app";

export const dynamic = "force-dynamic";

interface Block {
  id: number;
  slug: string;
  value: string;
  language_id: number;
}

interface Lang {
  id: number;
  code: string;
  name: string;
}

export default async function ContentAdmin() {
  await requireAdmin();
  const supabase = createAdminClient();

  const [{ data: blocks }, { data: languages }] = await Promise.all([
    supabase
      .from("content_blocks")
      .select("id, slug, value, language_id")
      .order("slug", { ascending: true }),
    supabase
      .from("languages")
      .select("id, code, name")
      .order("id", { ascending: true }),
  ]);

  const langs = (languages ?? []) as Lang[];
  const allBlocks = (blocks ?? []) as Block[];

  const bySlug = new Map<string, Map<number, Block>>();
  for (const b of allBlocks) {
    const m = bySlug.get(b.slug) ?? new Map();
    m.set(b.language_id, b);
    bySlug.set(b.slug, m);
  }

  const defaultLangId =
    langs.find((l) => l.code === APP_CONFIG.defaultLanguage)?.id ?? null;
  const defaultLangCode = APP_CONFIG.defaultLanguage;

  const customSlugs = Array.from(bySlug.keys())
    .filter((s) => !KNOWN_SLUGS.has(s))
    .sort();

  const missing: { slug: string; label: string; missing: string[] }[] = [];
  for (const section of CONTENT_SCHEMA) {
    for (const field of section.fields) {
      const present = bySlug.get(field.slug);
      const missingCodes = langs
        .filter((l) => !(present?.has(l.id) && present.get(l.id)?.value))
        .map((l) => l.code);
      if (missingCodes.length > 0) {
        missing.push({
          slug: field.slug,
          label: `${section.title} — ${field.label}`,
          missing: missingCodes,
        });
      }
    }
  }

  return (
    <div className="flex flex-col gap-12">
      <header>
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
          Translations
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          Content blocks
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Site copy organized by section. Edit every locale on every row, then
          click Save all once.
        </p>
      </header>

      {missing.length > 0 && (
        <div className="rounded-md border border-dashed border-amber-500/40 bg-amber-500/5 px-3 py-2 text-xs text-amber-700 dark:text-amber-200">
          <p className="font-medium">Missing translations</p>
          <ul className="mt-1 list-disc pl-4">
            {missing.map((m) => (
              <li key={m.slug}>
                {m.label}{" "}
                <span className="font-mono text-[10px]">({m.slug})</span> →{" "}
                missing in {m.missing.join(", ")}
              </li>
            ))}
          </ul>
        </div>
      )}

      <form
        action={bulkUpdateAllContentAction}
        className="flex flex-col gap-6"
      >
        {CONTENT_SCHEMA.map((section) => (
          <section key={section.key} className="flex flex-col gap-3">
            <header>
              <h2 className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                {section.title}
              </h2>
              {section.description && (
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  {section.description}
                </p>
              )}
            </header>
            <div className="overflow-x-auto rounded-lg border border-dashed border-dashed-soft">
              <table className="w-full min-w-[640px] text-sm">
                <thead>
                  <tr className="border-b border-dashed border-dashed-soft text-left">
                    <Th className="w-44">Field</Th>
                    {langs.map((l) => (
                      <Th key={l.id}>{l.code}</Th>
                    ))}
                    <Th className="w-16" />
                  </tr>
                </thead>
                <tbody>
                  {section.fields.map((field) => (
                    <tr
                      key={field.slug}
                      className="border-b border-dashed border-dashed-soft last:border-b-0"
                    >
                      <td className="px-3 py-2 align-top">
                        <p className="text-sm font-medium">{field.label}</p>
                        <p className="font-mono text-[10px] text-muted-foreground">
                          {field.slug}
                        </p>
                      </td>
                      {langs.map((l) => {
                        const block = bySlug.get(field.slug)?.get(l.id);
                        const isDefault = l.id === defaultLangId;
                        const defaultBlock =
                          defaultLangId !== null
                            ? bySlug.get(field.slug)?.get(defaultLangId)
                            : undefined;
                        const copyFromValue =
                          !isDefault && defaultBlock ? defaultBlock.value : "";
                        return (
                          <td key={l.id} className="px-3 py-2 align-top">
                            <CopyableInput
                              name={`content[${field.slug}][value_${l.id}]`}
                              multiline={field.multiline}
                              initialValue={block?.value ?? ""}
                              copyFromValue={copyFromValue}
                              copyFromLabel={`Copy ${defaultLangCode}`}
                            />
                          </td>
                        );
                      })}
                      <td className="px-3 py-2 align-top text-right">
                        <DeleteButton
                          action={deleteContentSlugAction}
                          fieldName="delete"
                          fieldValue={field.slug}
                          label={`content "${field.slug}"`}
                          description="Removes the slug across all languages."
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ))}

        {customSlugs.length > 0 && (
          <section className="flex flex-col gap-3">
            <header>
              <h2 className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                Custom slugs
              </h2>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                Slugs in the DB but not declared in{" "}
                <code className="font-mono">utils/content/schema.ts</code>.
              </p>
            </header>
            <div className="overflow-x-auto rounded-lg border border-dashed border-dashed-soft">
              <table className="w-full min-w-[640px] text-sm">
                <thead>
                  <tr className="border-b border-dashed border-dashed-soft text-left">
                    <Th className="w-44">Slug</Th>
                    {langs.map((l) => (
                      <Th key={l.id}>{l.code}</Th>
                    ))}
                    <Th className="w-16" />
                  </tr>
                </thead>
                <tbody>
                  {customSlugs.map((slug) => (
                    <tr
                      key={slug}
                      className="border-b border-dashed border-dashed-soft last:border-b-0"
                    >
                      <td className="px-3 py-2 align-top">
                        <p className="font-mono text-xs">{slug}</p>
                      </td>
                      {langs.map((l) => {
                        const block = bySlug.get(slug)?.get(l.id);
                        const isDefault = l.id === defaultLangId;
                        const defaultBlock =
                          defaultLangId !== null
                            ? bySlug.get(slug)?.get(defaultLangId)
                            : undefined;
                        const copyFromValue =
                          !isDefault && defaultBlock ? defaultBlock.value : "";
                        return (
                          <td key={l.id} className="px-3 py-2 align-top">
                            <CopyableInput
                              name={`content[${slug}][value_${l.id}]`}
                              multiline
                              initialValue={block?.value ?? ""}
                              copyFromValue={copyFromValue}
                              copyFromLabel={`Copy ${defaultLangCode}`}
                            />
                          </td>
                        );
                      })}
                      <td className="px-3 py-2 align-top text-right">
                        <DeleteButton
                          action={deleteContentSlugAction}
                          fieldName="delete"
                          fieldValue={slug}
                          label={`content "${slug}"`}
                          description="Removes the slug across all languages."
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        <SubmitButton
          className="w-full bg-accent-blue text-white"
          pendingLabel="Saving…"
        >
          Save all
        </SubmitButton>
      </form>

      <section>
        <h2 className="mb-3 font-mono text-xs uppercase tracking-wider text-muted-foreground">
          Add custom slug
        </h2>
        <form
          action={createContentSlugAction}
          className="flex flex-col gap-3 rounded-xl border border-dashed border-dashed-soft p-4 sm:flex-row sm:items-end"
        >
          <label className="flex flex-1 flex-col gap-1.5">
            <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              New slug (use snake_case, e.g. footer_text)
            </span>
            <input
              name="slug"
              type="text"
              required
              pattern="[a-z][a-z0-9_]*"
              placeholder="footer_text"
              className="rounded-md border border-dashed border-dashed-soft bg-background px-3 py-1.5 font-mono text-sm focus-visible:border-accent-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </label>
          <SubmitButton variant="outline" pendingLabel="Creating…">
            Create empty rows
          </SubmitButton>
        </form>
      </section>
    </div>
  );
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
