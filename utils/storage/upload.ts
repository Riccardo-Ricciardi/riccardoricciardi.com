import { createAdminClient } from "@/utils/supabase/admin";

const BUCKET = "image";

const ALLOWED_MIME = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/avif",
  "image/svg+xml",
  "image/gif",
];

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

function sanitizeName(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/[^\w.-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
}

function inferExtension(mime: string, fallback = "png"): string {
  const map: Record<string, string> = {
    "image/png": "png",
    "image/jpeg": "jpg",
    "image/webp": "webp",
    "image/avif": "avif",
    "image/svg+xml": "svg",
    "image/gif": "gif",
  };
  return map[mime] ?? fallback;
}

export interface UploadResult {
  url: string;
  path: string;
}

export async function uploadImage(
  file: File,
  options: { folder?: string; basename?: string } = {}
): Promise<UploadResult> {
  if (!file || file.size === 0) {
    throw new Error("Empty file");
  }
  if (!ALLOWED_MIME.includes(file.type)) {
    throw new Error(`Unsupported mime type: ${file.type}`);
  }
  if (file.size > MAX_BYTES) {
    throw new Error(`File too large (max ${MAX_BYTES / (1024 * 1024)} MB)`);
  }

  const folder = sanitizeName(options.folder ?? "uploads");
  const ext = inferExtension(file.type);
  const stamp = Date.now();
  const baseName = options.basename
    ? sanitizeName(options.basename)
    : sanitizeName(file.name.replace(/\.[^.]+$/, "")) || "file";
  const path = `${folder}/${baseName}-${stamp}.${ext}`;

  const supabase = createAdminClient();

  const arrayBuffer = await file.arrayBuffer();

  const { error } = await supabase.storage.from(BUCKET).upload(path, arrayBuffer, {
    contentType: file.type,
    upsert: false,
    cacheControl: "31536000",
  });

  if (error) throw new Error(`Upload failed: ${error.message}`);

  const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return { url: pub.publicUrl, path };
}

export async function deleteImage(path: string): Promise<void> {
  if (!path) return;
  const supabase = createAdminClient();
  await supabase.storage.from(BUCKET).remove([path]);
}

export function pathFromPublicUrl(url: string): string | null {
  if (!url) return null;
  const marker = `/storage/v1/object/public/${BUCKET}/`;
  const idx = url.indexOf(marker);
  if (idx === -1) return null;
  return url.slice(idx + marker.length);
}
