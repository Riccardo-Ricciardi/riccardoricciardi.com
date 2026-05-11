"use client";

import { useState } from "react";
import { SubmitButton } from "@/components/admin/actions/submit-button";

interface ThemeRow {
  key: string;
  value_light: string;
  value_dark: string | null;
  type: "color" | "length" | "text" | "number";
  group_name: string;
  description: string | null;
  position: number;
}

interface Props {
  rows: ThemeRow[];
  bulkAction: (formData: FormData) => Promise<void>;
}

export function ThemeGrid({ rows, bulkAction }: Props) {
  const groups = new Map<string, ThemeRow[]>();
  for (const r of rows) {
    const arr = groups.get(r.group_name) ?? [];
    arr.push(r);
    groups.set(r.group_name, arr);
  }
  const groupNames = Array.from(groups.keys());

  return (
    <form action={bulkAction} className="flex flex-col gap-6">
      {groupNames.map((group) => (
        <section key={group}>
          <h3 className="admin-eyebrow mb-2">{group}</h3>
          <div className="admin-card flex flex-col divide-y admin-divider overflow-hidden">
            {groups.get(group)!.map((row) => (
              <ThemeRowEditor key={row.key} row={row} />
            ))}
          </div>
        </section>
      ))}
      <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
        <SubmitButton className="w-full sm:w-auto" pendingLabel="Saving…">
          Save theme
        </SubmitButton>
      </div>
    </form>
  );
}

function ThemeRowEditor({ row }: { row: ThemeRow }) {
  return (
    <div className="grid gap-3 p-3 lg:grid-cols-[14rem_minmax(0,1fr)_minmax(0,1fr)]">
      <input type="hidden" name={`theme[${row.key}][__row]`} value="1" />
      <div className="min-w-0">
        <p className="truncate font-mono text-sm">{row.key}</p>
        {row.description && (
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            {row.description}
          </p>
        )}
      </div>
      <ValueInput
        name={`theme[${row.key}][value_light]`}
        defaultValue={row.value_light}
        type={row.type}
        label="Light"
      />
      <ValueInput
        name={`theme[${row.key}][value_dark]`}
        defaultValue={row.value_dark ?? ""}
        type={row.type}
        label="Dark (optional)"
      />
    </div>
  );
}

function ValueInput({
  name,
  defaultValue,
  type,
  label,
}: {
  name: string;
  defaultValue: string;
  type: ThemeRow["type"];
  label: string;
}) {
  const [val, setVal] = useState(defaultValue);

  if (type === "color") {
    const colorHex = looksLikeHex(val) ? val : "#000000";
    return (
      <label className="flex flex-col gap-1.5">
        <span className="admin-eyebrow">{label}</span>
        <span className="flex items-center gap-2">
          <span
            aria-hidden="true"
            className="h-9 w-9 shrink-0 rounded-md border admin-divider"
            style={{ background: val || "transparent" }}
          />
          <input
            type="color"
            value={colorHex}
            onChange={(e) => setVal(e.target.value)}
            aria-label={`${label} color picker`}
            className="h-9 w-12 cursor-pointer rounded-md border admin-divider bg-transparent"
          />
          <input
            name={name}
            value={val}
            onChange={(e) => setVal(e.target.value)}
            placeholder="oklch(…) or #hex"
            className="admin-input flex-1 font-mono text-xs"
          />
        </span>
      </label>
    );
  }

  return (
    <label className="flex flex-col gap-1.5">
      <span className="admin-eyebrow">{label}</span>
      <input
        name={name}
        defaultValue={defaultValue}
        className="admin-input font-mono text-xs"
        type={type === "number" ? "number" : "text"}
      />
    </label>
  );
}

function looksLikeHex(v: string): boolean {
  return /^#[0-9a-f]{3,8}$/i.test(v);
}
