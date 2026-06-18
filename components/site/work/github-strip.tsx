import { getRepoProjects } from "@/utils/projects/fetch";
import type { SupportedLanguage } from "@/utils/config/app";

interface GithubStripProps {
  locale: SupportedLanguage;
  heading: string;
}

export async function GithubStrip({ locale, heading }: GithubStripProps) {
  const repos = await getRepoProjects(locale);
  const linkable = repos.filter((repo) => repo.name && (repo.url ?? repo.homepage));
  if (linkable.length === 0) return null;

  return (
    <section
      aria-labelledby="github-strip-heading"
      className="container-page section-y"
    >
      <div className="content-narrow flex flex-col gap-8">
        <h2 id="github-strip-heading" className="text-h3 text-balance">
          {heading}
        </h2>
        <ul className="flex list-none flex-wrap gap-2 p-0">
          {linkable.map((repo) => (
            <li key={repo.id}>
              <a
                href={(repo.url ?? repo.homepage) as string}
                target="_blank"
                rel="noopener noreferrer"
                className="pill-base pill-interactive no-underline"
              >
                {repo.name}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function GithubStripSkeleton() {
  return (
    <section className="container-page section-y">
      <div className="content-narrow flex flex-col gap-8">
        <div className="h-6 w-64 animate-pulse rounded bg-muted" />
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-7 w-28 animate-pulse rounded-[var(--radius-pill)] bg-muted" />
          ))}
        </div>
      </div>
    </section>
  );
}
