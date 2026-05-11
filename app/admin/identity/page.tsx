import Image from "next/image";
import { Trash2, Upload, User } from "lucide-react";
import { requireAdmin } from "@/utils/auth/admin";
import { createAdminClient } from "@/utils/supabase/admin";
import { SectionHeader } from "@/components/admin/primitives/section-header";
import { SubmitButton } from "@/components/admin/actions/submit-button";
import {
  bulkUpdateHeroContentAction,
  clearProfilePhotoAction,
  updateIdentityAction,
  uploadProfilePhotoAction,
} from "@/app/admin/_actions/identity";

export const dynamic = "force-dynamic";

const HERO_FIELDS = [
  { slug: "hero_eyebrow", label: "Eyebrow / availability", multiline: false },
  { slug: "hero_title", label: "Title", multiline: true },
  { slug: "hero_subtitle", label: "Subtitle", multiline: true },
  { slug: "hero_primary_cta", label: "Primary CTA label", multiline: false },
  { slug: "hero_secondary_cta", label: "Secondary CTA label", multiline: false },
] as const;

export default async function IdentityAdminPage() {
  await requireAdmin();
  const supabase = createAdminClient();

  const [identityRes, langsRes, blocksRes] = await Promise.all([
    supabase.from("site_identity").select("*").eq("id", 1).maybeSingle(),
    supabase
      .from("languages")
      .select("id, code, name")
      .order("id", { ascending: true }),
    supabase
      .from("content_blocks")
      .select("slug, language_id, value")
      .in("slug", HERO_FIELDS.map((f) => f.slug)),
  ]);

  const identity =
    (identityRes.data as {
      name: string;
      email: string | null;
      profile_photo_url: string | null;
      primary_cta_href: string | null;
      secondary_cta_href: string | null;
    } | null) ?? {
      name: "Riccardo Ricciardi",
      email: null,
      profile_photo_url: null,
      primary_cta_href: "#projects",
      secondary_cta_href: "#skills",
    };

  const langs = (langsRes.data ?? []) as Array<{
    id: number;
    code: string;
    name: string;
  }>;

  const blockMap = new Map<string, string>();
  for (const b of (blocksRes.data ?? []) as Array<{
    slug: string;
    language_id: number;
    value: string;
  }>) {
    blockMap.set(`${b.slug}::${b.language_id}`, b.value);
  }

  return (
    <div className="flex flex-col gap-10">
      <SectionHeader
        eyebrow="Site"
        title="Identity"
        description="Hero copy per language, plus the non-translatable name, email, photo and CTA destinations."
      />

      <section className="grid gap-4 lg:grid-cols-[1fr_1.4fr]">
        <PhotoCard
          url={identity.profile_photo_url}
          name={identity.name}
        />

        <form
          action={updateIdentityAction}
          className="admin-card flex flex-col gap-4 p-5"
        >
          <div>
            <p className="admin-eyebrow">Identity</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Singleton row in <span className="font-mono">site_identity</span>.
              Used by footer, SEO, and CTA targets.
            </p>
          </div>

          <label className="flex flex-col gap-1.5">
            <span className="admin-eyebrow">Display name</span>
            <input
              name="name"
              defaultValue={identity.name}
              required
              className="admin-input"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="admin-eyebrow">Email</span>
            <input
              name="email"
              type="email"
              defaultValue={identity.email ?? ""}
              placeholder="hello@riccardoricciardi.com"
              className="admin-input"
            />
          </label>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5">
              <span className="admin-eyebrow">Primary CTA href</span>
              <input
                name="primary_cta_href"
                defaultValue={identity.primary_cta_href ?? "#projects"}
                className="admin-input"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="admin-eyebrow">Secondary CTA href</span>
              <input
                name="secondary_cta_href"
                defaultValue={identity.secondary_cta_href ?? "#skills"}
                className="admin-input"
              />
            </label>
          </div>

          <SubmitButton className="w-full sm:w-auto sm:self-end" pendingLabel="Saving…">
            Save identity
          </SubmitButton>
        </form>
      </section>

      <section>
        <div className="mb-3 flex items-baseline justify-between">
          <div>
            <p className="admin-eyebrow">Hero translations</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Rows in <span className="font-mono">content_blocks</span>, one per slug & language.
            </p>
          </div>
        </div>

        <form action={bulkUpdateHeroContentAction} className="flex flex-col gap-3">
          <div className="admin-card flex flex-col divide-y admin-divider overflow-hidden">
            {HERO_FIELDS.map((field) => (
              <div key={field.slug} className="grid gap-3 p-4 lg:grid-cols-[14rem_minmax(0,1fr)]">
                <div className="min-w-0">
                  <p className="text-sm font-medium">{field.label}</p>
                  <p className="mt-0.5 font-mono text-[10px] text-muted-foreground">
                    {field.slug}
                  </p>
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  {langs.map((l) => {
                    const name = `hero[${field.slug}][lang_${l.id}]`;
                    const v = blockMap.get(`${field.slug}::${l.id}`) ?? "";
                    return (
                      <label key={l.id} className="flex flex-col gap-1.5">
                        <span className="admin-eyebrow">{l.code}</span>
                        {field.multiline ? (
                          <textarea
                            name={name}
                            defaultValue={v}
                            rows={3}
                            className="admin-input min-h-20 resize-y"
                          />
                        ) : (
                          <input
                            name={name}
                            defaultValue={v}
                            className="admin-input"
                          />
                        )}
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <SubmitButton className="w-full sm:w-auto" pendingLabel="Saving…">
              Save hero translations
            </SubmitButton>
          </div>
        </form>
      </section>
    </div>
  );
}

function PhotoCard({
  url,
  name,
}: {
  url: string | null;
  name: string;
}) {
  return (
    <div className="admin-card flex flex-col gap-4 p-5">
      <div>
        <p className="admin-eyebrow">Profile photo</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Used on About page and Open Graph image.
        </p>
      </div>

      <div className="relative grid h-48 place-items-center overflow-hidden rounded-xl border border-dashed admin-divider bg-background/50">
        {url ? (
          <Image
            src={url}
            alt={name}
            fill
            sizes="(min-width: 1024px) 30vw, 100vw"
            className="object-cover"
            unoptimized
          />
        ) : (
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <User className="h-8 w-8" aria-hidden="true" />
            <p className="text-xs">No photo uploaded</p>
          </div>
        )}
      </div>

      <form
        action={uploadProfilePhotoAction}
        encType="multipart/form-data"
        className="flex flex-col gap-2"
      >
        <input
          type="file"
          name="file"
          accept="image/png,image/jpeg,image/webp,image/avif"
          required
          className="block w-full cursor-pointer text-xs file:mr-3 file:rounded-md file:border-0 file:bg-accent file:px-3 file:py-2 file:text-xs file:font-medium hover:file:bg-accent/80"
        />
        <SubmitButton pendingLabel="Uploading…">
          <Upload className="h-3.5 w-3.5" aria-hidden="true" />
          Upload photo
        </SubmitButton>
      </form>

      {url && (
        <form action={clearProfilePhotoAction}>
          <SubmitButton
            variant="ghost"
            className="w-full text-xs text-muted-foreground hover:text-rose-500"
            pendingLabel="Removing…"
          >
            <Trash2 className="h-3 w-3" aria-hidden="true" />
            Remove photo
          </SubmitButton>
        </form>
      )}
    </div>
  );
}
