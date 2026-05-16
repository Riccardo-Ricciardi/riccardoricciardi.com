import { createAdminClient } from "@/utils/supabase/admin";

const BUCKET = "image";

// SVG intentionally excluded: image/svg+xml is XSS-capable when served from
// the same origin (script tags execute). Use raster + AVIF/WebP instead.
const ALLOWED_MIME = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/avif",
  "image/gif",
];

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

function sanitizeSegment(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/[^\w.-]+/g, "-")
    .replace(/\.{2,}/g, "-") // collapse '..' / longer dot runs
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
}

function sanitizeFolder(input: string): string {
  // Allow single-level nesting like "projects/<uuid>" but reject traversal.
  return input
    .split("/")
    .map((s) => sanitizeSegment(s))
    .filter(Boolean)
    .slice(0, 4) // cap depth
    .join("/");
}

function sanitizeName(input: string): string {
  return sanitizeSegment(input);
}

function inferExtension(mime: string, fallback = "png"): string {
  const map: Record<string, string> = {
    "image/png": "png",
    "image/jpeg": "jpg",
    "image/webp": "webp",
    "image/avif": "avif",
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

  const folder = sanitizeFolder(options.folder ?? "uploads") || "uploads";
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

function isSafeStoragePath(p: string): boolean {
  if (!p || p.startsWith("/") || p.startsWith("\\")) return false;
  if (p.includes("..")) return false;
  return /^[A-Za-z0-9._\-/]+$/.test(p);
}

export async function deleteImage(path: string): Promise<void> {
  if (!path || !isSafeStoragePath(path)) return;
  const supabase = createAdminClient();
  await supabase.storage.from(BUCKET).remove([path]);
}

export function pathFromPublicUrl(url: string): string | null {
  if (!url) return null;
  const marker = `/storage/v1/object/public/${BUCKET}/`;
  const idx = url.indexOf(marker);
  if (idx === -1) return null;
  const path = url.slice(idx + marker.length);
  return isSafeStoragePath(path) ? path : null;
}
