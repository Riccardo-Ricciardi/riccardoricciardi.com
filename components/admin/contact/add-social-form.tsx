"use client";

import { useRef } from "react";
import { Plus } from "lucide-react";
import { SubmitButton } from "@/components/admin/actions/submit-button";

export function AddSocialForm({
  action,
}: {
  action: (formData: FormData) => Promise<void>;
}) {
  const ref = useRef<HTMLFormElement>(null);
  return (
    <form
      ref={ref}
      action={async (fd) => {
        await action(fd);
        ref.current?.reset();
      }}
      className="admin-card grid grid-cols-1 gap-2 p-3 sm:grid-cols-[8rem_minmax(0,1fr)_minmax(0,1.4fr)_auto]"
    >
      <label className="flex flex-col gap-1.5">
        <span className="admin-eyebrow">Kind</span>
        <select name="kind" className="admin-input" defaultValue="github">
          <option value="github">github</option>
          <option value="linkedin">linkedin</option>
          <option value="email">email</option>
          <option value="twitter">twitter / x</option>
          <option value="instagram">instagram</option>
          <option value="custom">custom</option>
        </select>
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="admin-eyebrow">Label</span>
        <input name="label" placeholder="optional" className="admin-input" />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="admin-eyebrow">URL</span>
        <input
          name="url"
          required
          placeholder="https://github.com/..."
          className="admin-input"
        />
      </label>
      <div className="flex items-end">
        <SubmitButton className="w-full" pendingLabel="Adding…">
          <Plus className="h-3.5 w-3.5" aria-hidden="true" />
          Add link
        </SubmitButton>
      </div>
    </form>
  );
}
