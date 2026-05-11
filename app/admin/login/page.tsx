import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getAdminUser } from "@/utils/auth/admin";
import { loginAction } from "@/app/admin/_actions/auth";
import { SubmitButton } from "@/components/admin/actions/submit-button";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ error?: string }>;
}

export default async function LoginPage({ searchParams }: PageProps) {
  const user = await getAdminUser();
  if (user) redirect("/admin");

  const { error } = await searchParams;

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-dot bg-dot-mask opacity-50"
      />
      <div className="relative mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-16">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-3 w-3" aria-hidden="true" />
          Back to site
        </Link>

        <div className="mb-8 flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-lg bg-accent-blue text-sm font-bold text-white">
            R.
          </span>
          <div>
            <p className="admin-eyebrow">Riccardo</p>
            <p className="text-sm font-medium">Admin console</p>
          </div>
        </div>

        <h1 className="text-3xl font-semibold tracking-tight">Sign in.</h1>
        <p className="mt-2 max-w-prose text-sm text-muted-foreground">
          Manage skills, projects, content, and media for{" "}
          <span className="font-mono text-foreground">riccardoricciardi.com</span>.
        </p>

        <form action={loginAction} className="mt-8 flex flex-col gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="admin-eyebrow">Email</span>
            <input
              type="email"
              name="email"
              autoComplete="email"
              required
              autoFocus
              className="admin-input"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="admin-eyebrow">Password</span>
            <input
              type="password"
              name="password"
              autoComplete="current-password"
              required
              className="admin-input"
            />
          </label>

          {error && (
            <p
              role="alert"
              className="rounded-md border border-rose-500/30 bg-rose-500/5 px-3 py-2 text-xs text-rose-700 dark:text-rose-300"
            >
              {decodeURIComponent(error)}
            </p>
          )}

          <SubmitButton className="mt-2 w-full" pendingLabel="Signing in…">
            Sign in
          </SubmitButton>
        </form>
      </div>
    </div>
  );
}
