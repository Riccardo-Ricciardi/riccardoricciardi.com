import { requireAdmin } from "@/utils/auth/admin";
import { createClient } from "@/utils/supabase/server";
import {
  createContentSlugAction,
  deleteContentSlugAction,
  updateContentAction,
} from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { LangTabs } from "@/components/admin/lang-tabs";
import { CONTENT_SCHEMA, KNOWN_SLUGS, type ContentField } from "@/utils/content/schema";

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

interface PageProps {
  searchParams: Promise<{ error?: string; ok?: string }>;
}

export default async function ContentAdmin({ searchParams }: PageProps) {
  await requireAdmin();
  const { error, ok } = await searchParams;
  const supabase = await createClient();

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

  const customSlugs = Array.from(bySlug.keys())
    .filter((s) => !KNOWN_SLUGS.has(s))
    .sort();

  // Detect missing translations for known schema fields
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
          Content
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          Content blocks
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Site copy organized by section. Each field is editable per locale via tabs.
        </p>
      </header>

      {error && (
        <p
          role="alert"
          className="rounded-md border border-dashed border-red-500/40 bg-red-500/5 px-3 py-2 text-xs text-red-600"
        >
          {error}
        </p>
      )}
      {ok && (
        <p
          role="status"
          className="rounded-md border border-dashed border-accent-blue bg-accent-blue-soft px-3 py-2 text-xs text-accent-blue"
        >
          Saved {ok}
        </p>
      )}

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

      {CONTENT_SCHEMA.map((section) => (
        <section key={section.key} className="flex flex-col gap-4">
          <header>
            <h2 className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
              {section.title}
            </h2>
            {section.description && (
              <p className="mt-1 text-sm text-muted-foreground">
                {section.description}
              </p>
            )}
          </header>

          <ul className="flex flex-col gap-3 list-none p-0">
            {section.fields.map((field) => (
              <li
                key={field.slug}
                className="rounded-xl border border-dashed border-dashed-soft p-4"
              >
                <FieldEditor
                  field={field}
                  langs={langs}
                  blocksForSlug={bySlug.get(field.slug)}
                />
              </li>
            ))}
          </ul>
        </section>
      ))}

      {customSlugs.length > 0 && (
        <section>
          <header className="mb-3">
            <h2 className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
              Custom slugs
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Slugs that exist in the DB but are not declared in the schema.
              Add them to <code className="font-mono text-[10px]">utils/content/schema.ts</code> to organize them above.
            </p>
          </header>
          <ul className="flex flex-col gap-3 list-none p-0">
            {customSlugs.map((slug) => (
              <li
                key={slug}
                className="rounded-xl border border-dashed border-dashed-soft p-4"
              >
                <div className="mb-3 flex items-center justify-between">
                  <p className="font-mono text-sm">{slug}</p>
                  <form action={deleteContentSlugAction}>
                    <input type="hidden" name="slug" value={slug} />
                    <button
                      type="submit"
                      className="font-mono text-[10px] uppercase tracking-wider text-red-600 hover:underline"
                    >
                      Delete slug
                    </button>
                  </form>
                </div>
                <FieldEditor
                  field={{ slug, label: slug, multiline: true }}
                  langs={langs}
                  blocksForSlug={bySlug.get(slug)}
                  hideLabel
                />
              </li>
            ))}
          </ul>
        </section>
      )}

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
          <Button type="submit" variant="outline">
            Create empty rows
          </Button>
        </form>
      </section>
    </div>
  );
}

function FieldEditor({
  field,
  langs,
  blocksForSlug,
  hideLabel = false,
}: {
  field: ContentField;
  langs: Lang[];
  blocksForSlug: Map<number, Block> | undefined;
  hideLabel?: boolean;
}) {
  return (
    <div>
      {!hideLabel && (
        <header className="mb-3">
          <p className="text-sm font-medium tracking-tight">{field.label}</p>
          {field.description && (
            <p className="mt-0.5 text-xs text-muted-foreground">
              {field.description}
            </p>
          )}
          <p className="mt-1 font-mono text-[10px] text-muted-foreground/70">
            {field.slug}
          </p>
        </header>
      )}
      <LangTabs
        storageKey="admin.lang"
        langs={langs}
        panels={langs.map((lang) => {
          const block = blocksForSlug?.get(lang.id);
          return (
            <form
              key={lang.id}
              action={updateContentAction}
              className="flex flex-col gap-2"
            >
              <input type="hidden" name="slug" value={field.slug} />
              <input type="hidden" name="language_id" value={lang.id} />
              {field.multiline ? (
                <textarea
                  name="value"
                  defaultValue={block?.value ?? ""}
                  rows={3}
                  placeholder={`${field.label} — ${lang.code}`}
                  className="rounded-md border border-dashed border-dashed-soft bg-background px-3 py-2 text-sm focus-visible:border-accent-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              ) : (
                <input
                  name="value"
                  type="text"
                  defaultValue={block?.value ?? ""}
                  placeholder={`${field.label} — ${lang.code}`}
                  className="rounded-md border border-dashed border-dashed-soft bg-background px-3 py-1.5 text-sm focus-visible:border-accent-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              )}
              <Button type="submit" size="sm" variant="outline" className="self-start">
                Save
              </Button>
            </form>
          );
        })}
      />
    </div>
  );
}
