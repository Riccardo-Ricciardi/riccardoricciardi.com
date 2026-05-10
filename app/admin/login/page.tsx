import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { getAdminUser } from "@/utils/auth/admin";
import { loginAction } from "@/app/admin/actions";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ error?: string }>;
}

export default async function LoginPage({ searchParams }: PageProps) {
  const user = await getAdminUser();
  if (user) redirect("/admin");

  const { error } = await searchParams;

  return (
    <div className="container-page flex min-h-screen flex-col items-center justify-center py-16">
      <div className="w-full max-w-sm">
        <header className="mb-8 text-center">
          <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            Admin
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            Sign in
          </h1>
        </header>
        <form action={loginAction} className="flex flex-col gap-3">
          <label className="flex flex-col gap-1.5">
            <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
              Email
            </span>
            <input
              type="email"
              name="email"
              autoComplete="email"
              required
              className="rounded-md border border-dashed border-dashed-soft bg-background px-3 py-2 text-sm focus-visible:border-accent-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
              Password
            </span>
            <input
              type="password"
              name="password"
              autoComplete="current-password"
              required
              className="rounded-md border border-dashed border-dashed-soft bg-background px-3 py-2 text-sm focus-visible:border-accent-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </label>
          {error && (
            <p
              role="alert"
              className="rounded-md border border-dashed border-red-500/40 bg-red-500/5 px-3 py-2 text-xs text-red-600"
            >
              {error}
            </p>
          )}
          <Button
            type="submit"
            size="lg"
            className="mt-2 bg-accent-blue text-white hover:bg-[var(--accent-blue-hover)]"
          >
            Sign in
          </Button>
        </form>
        <p className="mt-6 text-center text-xs text-muted-foreground">
          <Link href="/" className="hover:text-accent-blue">
            ← Back to site
          </Link>
        </p>
      </div>
    </div>
  );
}
