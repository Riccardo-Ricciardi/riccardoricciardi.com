"use client";

import { useRef } from "react";
import { Plus } from "lucide-react";
import { SubmitButton } from "@/components/admin/actions/submit-button";

export function AddSlugForm({
  action,
  placeholder = "new_slug",
}: {
  action: (formData: FormData) => Promise<void>;
  placeholder?: string;
}) {
  const ref = useRef<HTMLFormElement>(null);
  return (
    <form
      ref={ref}
      action={async (fd) => {
        await action(fd);
        ref.current?.reset();
      }}
      className="admin-card grid grid-cols-1 gap-2 p-3 sm:grid-cols-[minmax(0,1fr)_auto]"
    >
      <label className="flex flex-col gap-1.5">
        <span className="admin-eyebrow">New slug</span>
        <input
          name="slug"
          required
          placeholder={placeholder}
          className="admin-input font-mono"
        />
      </label>
      <div className="flex items-end">
        <SubmitButton className="w-full" pendingLabel="Adding…">
          <Plus className="h-3.5 w-3.5" aria-hidden="true" />
          Add slug
        </SubmitButton>
      </div>
    </form>
  );
}
