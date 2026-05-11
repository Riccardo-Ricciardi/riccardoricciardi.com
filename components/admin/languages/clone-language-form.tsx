"use client";

import { useRef } from "react";
import { Copy } from "lucide-react";
import { SubmitButton } from "@/components/admin/actions/submit-button";

interface Props {
  languages: Array<{ id: number; code: string; name: string }>;
  action: (formData: FormData) => Promise<void>;
}

export function CloneLanguageForm({ languages, action }: Props) {
  const ref = useRef<HTMLFormElement>(null);
  return (
    <form
      ref={ref}
      action={async (fd) => {
        await action(fd);
        ref.current?.reset();
      }}
      className="admin-card grid grid-cols-1 gap-2 p-3 sm:grid-cols-[8rem_8rem_minmax(0,1fr)_auto]"
    >
      <label className="flex flex-col gap-1.5">
        <span className="admin-eyebrow">Source</span>
        <select name="source_code" className="admin-input font-mono">
          {languages.map((l) => (
            <option key={l.code} value={l.code}>
              {l.code}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="admin-eyebrow">New code</span>
        <input
          name="target_code"
          required
          placeholder="fr"
          pattern="^[a-z]{2}([_-][a-z0-9]+)?$"
          className="admin-input font-mono"
        />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="admin-eyebrow">New name</span>
        <input
          name="target_name"
          required
          placeholder="Français"
          className="admin-input"
        />
      </label>
      <div className="flex items-end">
        <SubmitButton className="w-full" pendingLabel="Cloning…">
          <Copy className="h-3.5 w-3.5" aria-hidden="true" />
          Clone language
        </SubmitButton>
      </div>
    </form>
  );
}
