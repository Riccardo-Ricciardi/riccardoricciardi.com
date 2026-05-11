"use server";

import { createAdminClient } from "@/utils/supabase/admin";
import { requireAdmin } from "@/utils/auth/admin";
import { uploadImage, deleteImage } from "@/utils/storage/upload";
import { bounce } from "./_shared";
import type { MediaFile, MediaFolder } from "@/components/admin/types";

const PATH = "/admin/media";
const BUCKET = "image";

export async function uploadMediaAction(formData: FormData) {
  await requireAdmin();
  const files = formData.getAll("file");
  const folder = String(formData.get("folder") ?? "uploads").trim() || "uploads";

  if (files.length === 0) bounce(PATH, undefined, "no_file");

  for (const f of files) {
    if (!(f instanceof File) || f.size === 0) continue;
    try {
      await uploadImage(f, { folder });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "upload_failed";
      bounce(PATH, undefined, encodeURIComponent(msg));
    }
  }

  bounce(PATH, "uploaded");
}

export async function deleteMediaAction(formData: FormData) {
  await requireAdmin();
  const path = String(formData.get("delete") ?? formData.get("path") ?? "");
  if (!path) bounce(PATH);
  await deleteImage(path);
  bounce(PATH, "deleted");
}

async function listFolder(
  prefix: string
): Promise<{ folders: MediaFolder[]; files: MediaFile[] }> {
  const supabase = createAdminClient();
  const { data } = await supabase.storage.from(BUCKET).list(prefix, {
    limit: 1000,
    sortBy: { column: "name", order: "asc" },
  });

  const folders: MediaFolder[] = [];
  const files: MediaFile[] = [];

  for (const item of data ?? []) {
    if (!item.metadata) {
      folders.push({ name: item.name, count: 0 });
    } else {
      const fullPath = prefix ? `${prefix}/${item.name}` : item.name;
      const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(fullPath);
      files.push({
        name: item.name,
        path: fullPath,
        url: pub.publicUrl,
        size: item.metadata.size ?? 0,
        updated_at: item.updated_at ?? null,
        content_type: item.metadata.mimetype ?? null,
      });
    }
  }

  return { folders, files };
}

export async function fetchMedia(prefix: string = "") {
  await requireAdmin();
  return listFolder(prefix);
}
