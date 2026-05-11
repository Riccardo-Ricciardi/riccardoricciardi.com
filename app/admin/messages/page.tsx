import { Inbox, MailCheck, MailOpen } from "lucide-react";
import { requireAdmin } from "@/utils/auth/admin";
import { createAdminClient } from "@/utils/supabase/admin";
import { SectionHeader } from "@/components/admin/primitives/section-header";
import { EmptyState } from "@/components/admin/primitives/empty-state";
import { SubmitButton } from "@/components/admin/actions/submit-button";
import { DeleteButton } from "@/components/admin/actions/delete-button";
import { CopyButton } from "@/components/admin/actions/copy-button";
import {
  deleteMessageAction,
  markMessageReadAction,
  markMessageUnreadAction,
} from "@/app/admin/_actions/messages";

export const dynamic = "force-dynamic";

interface MessageRow {
  id: number;
  name: string;
  email: string;
  message: string;
  locale: string | null;
  read_at: string | null;
  created_at: string;
}

export default async function MessagesAdminPage() {
  await requireAdmin();
  const supabase = createAdminClient();

  const { data } = await supabase
    .from("contact_messages")
    .select("id, name, email, message, locale, read_at, created_at")
    .order("created_at", { ascending: false });

  const rows = (data ?? []) as MessageRow[];
  const unread = rows.filter((r) => !r.read_at).length;

  return (
    <div className="flex flex-col gap-8">
      <SectionHeader
        eyebrow="Inbox"
        title="Messages"
        description={`Inbound submissions from the public /contact form. ${unread} unread.`}
      />

      {rows.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title="No messages yet"
          description="When someone writes via the contact form their message appears here."
        />
      ) : (
        <ul className="flex list-none flex-col gap-3 p-0">
          {rows.map((row) => (
            <li key={row.id}>
              <MessageCard row={row} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function MessageCard({ row }: { row: MessageRow }) {
  const isRead = !!row.read_at;
  return (
    <article
      className={`admin-card relative flex flex-col gap-3 p-5 ${
        isRead ? "" : "ring-1 ring-inset ring-[color-mix(in_oklab,var(--accent-blue)_30%,transparent)]"
      }`}
    >
      <header className="flex flex-wrap items-baseline justify-between gap-2">
        <div className="min-w-0">
          <div className="flex flex-wrap items-baseline gap-2">
            <p className="truncate text-base font-medium">{row.name}</p>
            <a
              href={`mailto:${row.email}`}
              className="font-mono text-xs text-muted-foreground hover:text-accent-blue"
            >
              {row.email}
            </a>
          </div>
          <p className="mt-0.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            {row.locale ?? "—"} · {formatTimestamp(row.created_at)}
          </p>
        </div>
        {!isRead && (
          <span className="rounded-full bg-accent-blue-soft px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-accent-blue">
            New
          </span>
        )}
      </header>

      <p className="whitespace-pre-wrap rounded-md border border-dashed admin-divider bg-background/40 px-3 py-2.5 text-sm leading-relaxed">
        {row.message}
      </p>

      <footer className="flex flex-wrap items-center justify-end gap-2">
        <CopyButton
          value={row.email}
          label="Copy email"
          className="h-8 px-2.5 text-xs"
        />
        <form
          action={isRead ? markMessageUnreadAction : markMessageReadAction}
        >
          <input type="hidden" name="id" value={row.id} />
          <SubmitButton
            variant="ghost"
            className="h-8 px-2.5 text-xs"
            pendingLabel="…"
          >
            {isRead ? (
              <>
                <MailOpen className="h-3.5 w-3.5" aria-hidden="true" />
                Mark unread
              </>
            ) : (
              <>
                <MailCheck className="h-3.5 w-3.5" aria-hidden="true" />
                Mark read
              </>
            )}
          </SubmitButton>
        </form>
        <DeleteButton
          action={deleteMessageAction}
          fieldValue={row.id}
          label={`message from "${row.name}"`}
          iconOnly
          className="h-8 w-8 min-h-8 min-w-8"
        />
      </footer>
    </article>
  );
}

function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  const sec = Math.floor((Date.now() - d.getTime()) / 1000);
  if (sec < 60) return `${sec}s ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  return d.toLocaleString();
}
