"use client";

import { SubmitButton } from "@/components/admin/actions/submit-button";
import { DeleteButton } from "@/components/admin/actions/delete-button";

interface Props {
  slugs: string[];
  languages: Array<{ id: number; code: string; name: string }>;
  values: Map<string, string>;
  fieldPrefix: "content" | "notfound";
  bulkAction: (formData: FormData) => Promise<void>;
  deleteSlugAction: (formData: FormData) => Promise<void>;
}

export function TranslationGrid({
  slugs,
  languages,
  values,
  fieldPrefix,
  bulkAction,
  deleteSlugAction,
}: Props) {
  if (slugs.length === 0) {
    return (
      <p className="rounded-lg border border-dashed admin-divider bg-background/40 px-4 py-6 text-center text-sm text-muted-foreground">
        No slugs yet.
      </p>
    );
  }

  return (
    <form action={bulkAction} className="flex flex-col gap-3">
      <div className="admin-card flex flex-col divide-y admin-divider overflow-hidden">
        {slugs.map((slug) => (
          <div
            key={slug}
            className="grid gap-3 p-3 lg:grid-cols-[14rem_minmax(0,1fr)_2.5rem]"
          >
            <div className="min-w-0">
              <p className="truncate font-mono text-sm">{slug}</p>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {languages.map((l) => {
                const name = `${fieldPrefix}[${slug}][lang_${l.id}]`;
                const v = values.get(`${slug}::${l.id}`) ?? "";
                return (
                  <label key={l.id} className="flex flex-col gap-1.5">
                    <span className="admin-eyebrow">{l.code}</span>
                    <textarea
                      name={name}
                      defaultValue={v}
                      rows={2}
                      className="admin-input min-h-16 resize-y"
                    />
                  </label>
                );
              })}
            </div>
            <div className="flex items-start justify-end">
              <DeleteButton
                action={deleteSlugAction}
                fieldValue={slug}
                label={`slug "${slug}"`}
                iconOnly
              />
            </div>
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
        <SubmitButton className="w-full sm:w-auto" pendingLabel="Saving…">
          Save all translations
        </SubmitButton>
      </div>
    </form>
  );
}
