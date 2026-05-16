"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, RotateCcw } from "lucide-react";
import { logger } from "@/utils/logger";

interface AdminErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function AdminError({ error, reset }: AdminErrorProps) {
  useEffect(() => {
    logger.error("admin: render error", {
      message: error.message,
      digest: error.digest ?? null,
    });
  }, [error]);

  return (
    <div className="flex flex-col gap-6" role="alert">
      <header className="flex flex-col gap-2">
        <p className="admin-eyebrow">Admin · Error</p>
        <h1 className="text-2xl font-semibold tracking-tight">
          Something broke in the console.
        </h1>
        <p className="max-w-prose text-sm text-muted-foreground">
          The action you tried hit an unexpected error. Retry below, or jump
          back to the dashboard.
        </p>
      </header>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => reset()}
          className="admin-button admin-button-primary"
        >
          <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
          Try again
        </button>
        <Link href="/admin" className="admin-button admin-button-ghost">
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          Dashboard
        </Link>
      </div>

      {error.digest && (
        <p className="admin-eyebrow tabular-nums">ref · {error.digest}</p>
      )}
    </div>
  );
}
