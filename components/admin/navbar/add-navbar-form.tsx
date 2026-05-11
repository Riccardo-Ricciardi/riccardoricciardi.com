"use client";

import { useRef } from "react";
import { Plus } from "lucide-react";
import { SubmitButton } from "@/components/admin/actions/submit-button";

interface Props {
  languages: Array<{ id: number; code: string; name: string }>;
  action: (formData: FormData) => Promise<void>;
}

export function AddNavbarForm({ languages, action }: Props) {
  const ref = useRef<HTMLFormElement>(null);
  return (
    <form
      ref={ref}
      action={async (fd) => {
        await action(fd);
        ref.current?.reset();
      }}
      className="admin-card flex flex-col gap-3 p-3"
    >
      <label className="flex flex-col gap-1.5">
        <span className="admin-eyebrow">Slug</span>
        <input
          name="slug"
          required
          placeholder="about"
          className="admin-input font-mono"
        />
      </label>
      <div className="grid gap-2 sm:grid-cols-2">
        {languages.map((l) => (
          <label key={l.id} className="flex flex-col gap-1.5">
            <span className="admin-eyebrow">{l.code} label</span>
            <input name={`label_${l.code}`} className="admin-input" />
          </label>
        ))}
      </div>
      <SubmitButton className="w-full sm:w-auto sm:self-end" pendingLabel="Adding…">
        <Plus className="h-3.5 w-3.5" aria-hidden="true" />
        Add nav item
      </SubmitButton>
    </form>
  );
}
