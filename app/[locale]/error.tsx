"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, RotateCcw } from "lucide-react";
import { Eyebrow } from "@/components/site/atoms/eyebrow";
import { Heading } from "@/components/site/atoms/heading";
import { useErrorCopy } from "@/components/site/error-copy-context";
import { logger } from "@/utils/logger";

interface SiteErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function SiteError({ error, reset }: SiteErrorProps) {
  const params = useParams<{ locale?: string }>();
  const rawLocale = typeof params?.locale === "string" ? params.locale : "";
  const copy = useErrorCopy();

  useEffect(() => {
    logger.error("site: render error", {
      message: error.message,
      digest: error.digest ?? null,
    });
  }, [error]);

  return (
    <section
      role="alert"
      aria-labelledby="site-error-heading"
      className="container-page section-y"
    >
      <div className="mx-auto flex max-w-2xl flex-col items-start gap-6">
        <Heading
          level="h1"
          align="left"
          eyebrow={copy.eyebrow}
          title={copy.title}
          subtitle={copy.description}
          id="site-error-heading"
        />

        <div className="mt-2 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => reset()}
            className="btn-base btn-primary"
          >
            <RotateCcw className="size-4" aria-hidden="true" />
            {copy.retry}
          </button>
          <Link href={`/${rawLocale}`} className="btn-base btn-ghost">
            <ArrowLeft className="size-4" aria-hidden="true" />
            {copy.home}
          </Link>
        </div>

        {error.digest && (
          <Eyebrow className="mt-4 tabular-nums">
            ref · {error.digest}
          </Eyebrow>
        )}
      </div>
    </section>
  );
}
