"use client";

import { useRef } from "react";
import { Plus } from "lucide-react";
import { SubmitButton } from "@/components/admin/actions/submit-button";

interface Props {
  action: (formData: FormData) => Promise<void>;
}

export function AddSkillForm({ action }: Props) {
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={formRef}
      action={async (fd) => {
        await action(fd);
        formRef.current?.reset();
      }}
      className="admin-card grid grid-cols-2 gap-2 p-3 sm:grid-cols-[minmax(0,1fr)_8rem_6rem_auto] sm:gap-3"
    >
      <label className="flex flex-col gap-1.5">
        <span className="admin-eyebrow">Name</span>
        <input
          name="name"
          required
          placeholder="TypeScript"
          className="admin-input"
        />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="admin-eyebrow">Level</span>
        <div className="relative">
          <input
            name="percentage"
            type="number"
            min={0}
            max={100}
            defaultValue={80}
            className="admin-input tabular-nums pr-7"
          />
          <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 font-mono text-[10px] text-muted-foreground">
            %
          </span>
        </div>
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="admin-eyebrow">Category</span>
        <input name="category" placeholder="optional" className="admin-input" />
      </label>
      <div className="col-span-2 flex items-end sm:col-span-1">
        <SubmitButton className="w-full" pendingLabel="Adding…">
          <Plus className="h-3.5 w-3.5" aria-hidden="true" />
          Add skill
        </SubmitButton>
      </div>
    </form>
  );
}
