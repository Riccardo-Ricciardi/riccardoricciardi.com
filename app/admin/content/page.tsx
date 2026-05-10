import { requireAdmin } from "@/utils/auth/admin";
import { createClient } from "@/utils/supabase/server";
import {
  createContentSlugAction,
  deleteContentSlugAction,
  updateContentAction,
} from "@/app/admin/actions";
import { Button } from "@/components/ui/button";

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
  searchParams: Promise<{ error?: string }>;
}

export default async function ContentAdmin({ searchParams }: PageProps) {
  await requireAdmin();
  const { error } = await searchParams;
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

  // group by slug
  const bySlug = new Map<string, Map<number, Block>>();
  for (const b of allBlocks) {
    const m = bySlug.get(b.slug) ?? new Map();
    m.set(b.language_id, b);
    bySlug.set(b.slug, m);
  }

  const slugs = Array.from(bySlug.keys()).sort();

  return (
    <div className="flex flex-col gap-10">
      <header>
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
          Content
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          Content blocks
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Per-locale strings used across the site (hero, headings, CTAs).
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

      <section>
        <h2 className="mb-3 font-mono text-xs uppercase tracking-wider text-muted-foreground">
          Add new slug
        </h2>
        <form
          action={createContentSlugAction}
          className="flex flex-col gap-3 rounded-xl border border-dashed border-dashed-soft p-4 sm:flex-row sm:items-end"
        >
          <label className="flex flex-1 flex-col gap-1.5">
            <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              Slug (e.g. hero_title, footer_text)
            </span>
            <input
              name="slug"
              type="text"
              required
              className="rounded-md border border-dashed border-dashed-soft bg-background px-3 py-1.5 text-sm focus-visible:border-accent-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </label>
          <Button type="submit" className="bg-accent-blue text-white">
            Add slug
          </Button>
        </form>
      </section>

      <section className="flex flex-col gap-4">
        {slugs.map((slug) => (
          <article
            key={slug}
            className="rounded-xl border border-dashed border-dashed-soft p-4"
          >
            <header className="mb-3 flex items-center justify-between gap-2">
              <h3 className="font-mono text-sm font-medium">{slug}</h3>
              <form action={deleteContentSlugAction}>
                <input type="hidden" name="slug" value={slug} />
                <button
                  type="submit"
                  className="font-mono text-[10px] uppercase tracking-wider text-red-600 hover:underline"
                >
                  Delete slug
                </button>
              </form>
            </header>
            <div className="flex flex-col gap-3">
              {langs.map((lang) => {
                const block = bySlug.get(slug)?.get(lang.id);
                return (
                  <form
                    key={lang.id}
                    action={updateContentAction}
                    className="flex flex-col gap-1.5"
                  >
                    <input type="hidden" name="slug" value={slug} />
                    <input type="hidden" name="language_id" value={lang.id} />
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                        {lang.code}
                      </span>
                      <Button type="submit" size="sm" variant="outline">
                        Save
                      </Button>
                    </div>
                    <textarea
                      name="value"
                      defaultValue={block?.value ?? ""}
                      rows={2}
                      placeholder={`Value for ${lang.code}`}
                      className="rounded-md border border-dashed border-dashed-soft bg-background px-3 py-2 text-sm focus-visible:border-accent-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                  </form>
                );
              })}
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
