"use client";

import { SubmitButton } from "@/components/admin/actions/submit-button";
import { DeleteButton } from "@/components/admin/actions/delete-button";

interface Props {
  id: number;
  code: string;
  name: string;
  renameAction: (formData: FormData) => Promise<void>;
  deleteAction: (formData: FormData) => Promise<void>;
}

export function LanguageRow({
  id,
  code,
  name,
  renameAction,
  deleteAction,
}: Props) {
  return (
    <div className="admin-card grid grid-cols-1 items-end gap-2 p-3 sm:grid-cols-[6rem_minmax(0,1fr)_auto_2.75rem]">
      <form action={renameAction} className="contents">
        <input type="hidden" name="id" value={id} />
        <label className="flex flex-col gap-1.5">
          <span className="admin-eyebrow">Code</span>
          <input
            name="code"
            defaultValue={code}
            required
            pattern="^[a-z]{2}([_-][a-z0-9]+)?$"
            className="admin-input font-mono"
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="admin-eyebrow">Display name</span>
          <input
            name="name"
            defaultValue={name}
            required
            className="admin-input"
          />
        </label>
        <SubmitButton pendingLabel="Saving…">Save</SubmitButton>
      </form>
      <DeleteButton
        action={deleteAction}
        fieldValue={id}
        label={`language "${code}"`}
        iconOnly
      />
    </div>
  );
}
