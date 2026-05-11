"use client";

import { useRef } from "react";
import { Plus } from "lucide-react";
import { SubmitButton } from "@/components/admin/actions/submit-button";

export function AddProjectForm({
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
      className="admin-card grid grid-cols-1 gap-2 p-3 sm:grid-cols-[minmax(0,1fr)_8rem_auto]"
    >
      <label className="flex flex-col gap-1.5">
        <span className="admin-eyebrow">Repo (owner/name)</span>
        <input
          name="repo"
          required
          placeholder="Riccardo-Ricciardi/example"
          className="admin-input"
        />
      </label>
      <label className="flex items-end gap-2 sm:pb-2">
        <input
          type="checkbox"
          name="visible"
          defaultChecked
          className="h-4 w-4 accent-[var(--accent-blue)]"
        />
        <span className="admin-eyebrow !text-foreground">Show on site</span>
      </label>
      <div className="flex items-end">
        <SubmitButton className="w-full" pendingLabel="Adding…">
          <Plus className="h-3.5 w-3.5" aria-hidden="true" />
          Add project
        </SubmitButton>
      </div>
    </form>
  );
}
