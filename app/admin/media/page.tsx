import Link from "next/link";
import { ChevronLeft, Folder, Upload } from "lucide-react";
import { requireAdmin } from "@/utils/auth/admin";
import { SectionHeader } from "@/components/admin/primitives/section-header";
import { SubmitButton } from "@/components/admin/actions/submit-button";
import { MediaGrid } from "@/components/admin/media/media-grid";
import { deleteMediaAction, fetchMedia, uploadMediaAction } from "@/app/admin/_actions/media";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ prefix?: string }>;
}

export default async function MediaAdminPage({ searchParams }: PageProps) {
  await requireAdmin();
  const { prefix: rawPrefix } = await searchParams;
  const prefix = (rawPrefix ?? "").replace(/^\/+|\/+$/g, "");

  const { folders, files } = await fetchMedia(prefix);

  const parts = prefix ? prefix.split("/") : [];
  const parentPrefix = parts.slice(0, -1).join("/");

  return (
    <div className="flex flex-col gap-8">
      <SectionHeader
        eyebrow="Assets"
        title="Media library"
        description="Browse, upload, copy public URLs, and delete files in the Supabase Storage `image` bucket."
      />

      <nav aria-label="Folder path" className="flex flex-wrap items-center gap-1 text-xs">
        <Link
          href="/admin/media"
          className="rounded-md px-2 py-1 font-mono text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          /
        </Link>
        {parts.map((part, i) => {
          const href =
            "/admin/media?prefix=" + parts.slice(0, i + 1).join("/");
          const last = i === parts.length - 1;
          return (
            <span key={i} className="flex items-center gap-1">
              <span className="text-muted-foreground">/</span>
              <Link
                href={href}
                className={`rounded-md px-2 py-1 font-mono transition-colors hover:bg-accent hover:text-foreground ${last ? "bg-accent" : "text-muted-foreground"}`}
              >
                {part}
              </Link>
            </span>
          );
        })}
      </nav>

      <form
        action={uploadMediaAction}
        encType="multipart/form-data"
        className="admin-card grid grid-cols-1 gap-3 p-4 sm:grid-cols-[10rem_minmax(0,1fr)_auto]"
      >
        <label className="flex flex-col gap-1.5">
          <span className="admin-eyebrow">Folder</span>
          <input
            name="folder"
            defaultValue={prefix || "uploads"}
            className="admin-input"
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="admin-eyebrow">Files</span>
          <input
            type="file"
            name="file"
            multiple
            accept="image/png,image/jpeg,image/webp,image/avif,image/svg+xml,image/gif"
            required
            className="block w-full cursor-pointer rounded-md border admin-divider bg-background px-2 py-2 text-xs file:mr-3 file:rounded-md file:border-0 file:bg-accent file:px-3 file:py-2 file:text-xs file:font-medium hover:file:bg-accent/80"
          />
        </label>
        <div className="flex items-end">
          <SubmitButton className="w-full" pendingLabel="Uploading…">
            <Upload className="h-3.5 w-3.5" aria-hidden="true" />
            Upload
          </SubmitButton>
        </div>
      </form>

      {prefix && (
        <Link
          href={parentPrefix ? `/admin/media?prefix=${parentPrefix}` : "/admin/media"}
          className="inline-flex w-fit items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          <ChevronLeft className="h-3 w-3" aria-hidden="true" />
          Up one level
        </Link>
      )}

      {folders.length > 0 && (
        <section>
          <p className="admin-eyebrow mb-2">Folders</p>
          <ul className="grid list-none grid-cols-2 gap-2 p-0 sm:grid-cols-3 lg:grid-cols-4">
            {folders.map((f) => (
              <li key={f.name}>
                <Link
                  href={`/admin/media?prefix=${prefix ? prefix + "/" : ""}${f.name}`}
                  className="admin-card group flex items-center gap-2 px-3 py-2.5 transition-colors hover:border-accent-blue"
                >
                  <Folder
                    className="h-4 w-4 text-muted-foreground group-hover:text-accent-blue"
                    aria-hidden="true"
                  />
                  <span className="truncate text-sm">{f.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section>
        <p className="admin-eyebrow mb-2">Files in {prefix || "root"}</p>
        <MediaGrid files={files} deleteAction={deleteMediaAction} />
      </section>
    </div>
  );
}
