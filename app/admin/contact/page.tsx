import { requireAdmin } from "@/utils/auth/admin";
import { createAdminClient } from "@/utils/supabase/admin";
import { SectionHeader } from "@/components/admin/primitives/section-header";
import { SubmitButton } from "@/components/admin/actions/submit-button";
import { SortableSocial } from "@/components/admin/contact/sortable-social";
import { AddSocialForm } from "@/components/admin/contact/add-social-form";
import { updateIdentityAction } from "@/app/admin/_actions/identity";
import {
  bulkUpdateSocialAction,
  createSocialLinkAction,
  deleteSocialLinkAction,
} from "@/app/admin/_actions/social";
import type { SocialLink } from "@/components/admin/types";

export const dynamic = "force-dynamic";

export default async function ContactAdminPage() {
  await requireAdmin();
  const supabase = createAdminClient();

  const [identityRes, socialRes] = await Promise.all([
    supabase.from("site_identity").select("*").eq("id", 1).maybeSingle(),
    supabase
      .from("social_links")
      .select("id, kind, label, url, position, visible")
      .order("position", { ascending: true }),
  ]);

  const identity =
    (identityRes.data as {
      name: string;
      email: string | null;
      primary_cta_href: string | null;
      secondary_cta_href: string | null;
    } | null) ?? {
      name: "Riccardo Ricciardi",
      email: null,
      primary_cta_href: "#projects",
      secondary_cta_href: "#skills",
    };
  const social = ((socialRes.data ?? []) as SocialLink[]).map((s) => ({
    ...s,
    visible: s.visible ?? true,
  }));

  return (
    <div className="flex flex-col gap-10">
      <SectionHeader
        eyebrow="Site"
        title="Contact"
        description="Public email plus an ordered list of social/contact links."
      />

      <section>
        <p className="admin-eyebrow mb-3">Primary email</p>
        <form
          action={updateIdentityAction}
          className="admin-card grid grid-cols-1 gap-2 p-3 sm:grid-cols-[minmax(0,1fr)_auto]"
        >
          <input type="hidden" name="name" defaultValue={identity.name} />
          <input
            type="hidden"
            name="primary_cta_href"
            defaultValue={identity.primary_cta_href ?? ""}
          />
          <input
            type="hidden"
            name="secondary_cta_href"
            defaultValue={identity.secondary_cta_href ?? ""}
          />
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
          <div className="flex items-end">
            <SubmitButton className="w-full" pendingLabel="Saving…">
              Save email
            </SubmitButton>
          </div>
        </form>
      </section>

      <section>
        <div className="mb-3 flex items-baseline justify-between">
          <div>
            <p className="admin-eyebrow">Social / contact links</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Public list. Drag to reorder. Toggle visibility per row.
            </p>
          </div>
          <span className="font-mono text-[10px] tabular-nums text-muted-foreground">
            {social.length} total
          </span>
        </div>

        <div className="flex flex-col gap-3">
          <AddSocialForm action={createSocialLinkAction} />
          <SortableSocial
            initial={social}
            bulkAction={bulkUpdateSocialAction}
            deleteAction={deleteSocialLinkAction}
          />
        </div>
      </section>
    </div>
  );
}
