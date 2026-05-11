"use client";

import Image from "next/image";
import { Trash2 } from "lucide-react";
import type { MediaFile } from "@/components/admin/types";
import { CopyButton } from "@/components/admin/actions/copy-button";
import { DeleteButton } from "@/components/admin/actions/delete-button";

interface Props {
  files: MediaFile[];
  deleteAction: (formData: FormData) => Promise<void>;
}

export function MediaGrid({ files, deleteAction }: Props) {
  if (files.length === 0) {
    return (
      <p className="rounded-lg border border-dashed admin-divider bg-background/40 px-4 py-12 text-center text-sm text-muted-foreground">
        No files in this folder yet.
      </p>
    );
  }

  return (
    <ul className="grid list-none grid-cols-2 gap-3 p-0 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {files.map((f) => (
        <li key={f.path} className="admin-card overflow-hidden">
          <div className="relative aspect-square w-full bg-muted/30">
            <Image
              src={f.url}
              alt={f.name}
              fill
              sizes="(min-width: 1280px) 16vw, (min-width: 1024px) 22vw, (min-width: 640px) 30vw, 50vw"
              className="object-contain p-3"
              unoptimized
            />
          </div>
          <div className="space-y-1 border-t admin-divider p-2.5">
            <p className="truncate text-[11px] font-medium" title={f.name}>
              {f.name}
            </p>
            <p className="font-mono text-[10px] text-muted-foreground">
              {humanSize(f.size)}
            </p>
            <div className="flex items-center justify-between gap-1 pt-1">
              <CopyButton
                value={f.url}
                label="URL"
                className="h-7 px-2 text-[11px]"
              />
              <DeleteButton
                action={deleteAction}
                fieldValue={f.path}
                label={f.name}
                iconOnly
                className="h-7 w-7 min-h-7 min-w-7"
              />
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

function humanSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1
  );
  const v = bytes / Math.pow(1024, i);
  return `${v < 10 && i > 0 ? v.toFixed(1) : Math.round(v)} ${units[i]}`;
}
