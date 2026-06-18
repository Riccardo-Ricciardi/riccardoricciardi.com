# riccardoricciardi.com

Bilingual (it/en) personal portfolio + admin CMS. Next.js 16 App Router on Vercel, Supabase backend, Tailwind v4 (CSS-first, no config file), shadcn/ui (new-york, zinc). Design direction: monochrome surface, subtle blue accent, Geist sans + Geist mono.

## Project shape

- `app/[locale]/` — public SSG routes (`/`, `/about`, `/work`, `/uses`, `/contact`, `not-found`). `revalidate = 3600`, `force-static`.
- `app/admin/` — CMS dashboard + 12 section editors. Server actions in `_actions/*` gated by `requireAdmin()` (allowlist `ADMIN_EMAILS`).
- `app/api/cron/sync-github/route.ts` — Bearer-auth proxy to a Supabase Deno edge function. Runs daily at 03:00 UTC (Hobby plan limit).
- `components/site/` public surfaces, `components/admin/` CMS, `components/ui/` shadcn primitives.
- `components/site/atoms/` — Eyebrow, Heading, Pill, TechChip, SectionHeading, Field (FieldShell/FieldInput/FieldTextarea), EmptyState, Button.
- `utils/*/fetch.ts` — 9 domain repositories (about, content, identity, projects, skills, social, theme, uses, work), all wrapped in `React.cache()`.
- `utils/env.ts` — sole typed env access point. NEXT_PUBLIC_* accessors use literal `process.env.X` reads via `literalRequired`/`literalOptional` so Next inlines them in client bundles; required server vars throw at startup.
- `utils/supabase/{client,server,middleware,admin,static}.ts` — four client variants. Service-role client used for admin mutations and cron.
- `proxy.ts` — Next.js middleware. Cookie-based i18n redirect with Accept-Language fallback.

## Design system

- **Tokens** in `app/styles/tokens.css` (OKLCH palette, spacing, shadows, radii, font sizes). `:root` light, `.dark` overrides.
- **Utilities** in `app/styles/utilities.css` — `card-base`, `card-interactive`, `pill-base`, `pill-mono`, `pill-interactive`, `pill-accent`, `btn-base`, `btn-primary`, `btn-outline`, `btn-ghost`, `field-input`, `container-page`, `content-narrow`, `section-y`.
- **Admin** in `app/styles/admin.css` — admin-specific utilities (`admin-*`).
- **Atoms first**: never reach for raw `<h2 className="text-2xl">` or hand-rolled `rounded-xl border bg-card p-4`. Use `Heading`, `Eyebrow`, `card-base`, `pill-base`, `btn-base`.
- Border treatment: solid 1px `var(--border)` site-wide. `--border-dashed` exists only as a tenue color helper for gutters/dividers; do not reintroduce dashed border-style anywhere.
- Microinteractions: 150ms ease, 2px focus rings with ring-offset.
- Light-mode AA contrast: `--muted-foreground` L=0.45, `--accent-blue` L=0.5. Do not lighten further.

## Patterns

### Server actions return discriminated unions

```ts
{ status: "ok", ... } | { status: "error", fieldErrors: Record<string,string>, formError?: string }
```

Forms consume via React 19 `useActionState`. Field errors wired to `FieldShell` `error` prop (sets `aria-invalid` + `aria-describedby`). On error, focus first invalid field. Global success/error via Sonner toast. `<form noValidate>` to defer to server validation. All inputs validated via Zod `safeParse().error.flatten().fieldErrors`.

### Content blocks for strings

User-facing copy lives in the `content_blocks` table, keyed by `(slug, language_id)`. Fetch via `content(blocks, slug, fallback)` from `utils/content/fetch.ts`. Always pass a hardcoded fallback as the third arg so the build still ships meaningful copy if the DB row is missing.

Do not introduce `isIt ? "…" : "…"` ternaries — push the strings to content_blocks. Exception: tier-bound enums in `skills-board.tsx` where lifting would require surfacing tier metadata through 3 layers.

When you add a new slug to code, also add a migration with `insert ... on conflict do nothing` seeding both `en` and `it` rows. Apply via Supabase MCP, not by `supabase db push` (project has no local CLI link).

### Suspense streaming

Hero/heading renders immediately (resolves `getContentBlocks` from `React.cache`). Slow fetches (work timeline, uses list, projects board, skills board) live in async server child components wrapped in `<Suspense fallback={Skeleton}>`. Skeletons are `bg-muted animate-pulse rounded` blocks matching the final layout.

### Error boundaries and loading

- `app/[locale]/error.tsx` + `app/admin/error.tsx` — branded retry UI.
- `app/[locale]/{about,work,uses,contact}/loading.tsx` — segment skeletons for client-side route transitions.

## Hard constraints

- **No tests by design** (intentional user preference). CI runs install + typecheck + lint + build only.
- **Single `main` branch**. Vercel ought to auto-deploy on push but the webhook is broken since the 2026-05-12 rollback. After every push: verify via `npx vercel ls` or Vercel MCP `list_deployments`. If no new deployment fires, run `npx -y vercel deploy --prod --yes`. Fix the webhook in Vercel dashboard → Project → Git when convenient.
- **Hobby cron limit**: schedules must be daily or longer. Current: `0 3 * * *`. Sub-daily breaks deploys.
- **`CONTACT_IP_SALT` ≥ 16 chars in production** — `getContactIpSalt()` throws otherwise. Current prod value is a 32-char URL-safe base64.
- **CSP still has `'unsafe-inline'` on `script-src`** with TODO in `next.config.ts`. Nonce-based fix needs its own pass (middleware + root layout + Vercel Analytics coordination).
- **2 moderate npm vulns** (postcss <8.5.10) transitive via Next 16. Only fix is Next downgrade — forbidden.
- **shadcn primitives kept**: `alert-dialog`, `button`, `dropdown-menu`, `sonner`. Others were unused and have been deleted. If shadcn add brings new ones, verify usage before merging.
- **NEXT_PUBLIC_* env vars**: always go through the literal accessors in `utils/env.ts`. Never `process.env[name]` with dynamic key — Next won't inline.

## Commands

```
npm run dev        # next dev --turbopack
npm run build      # next build (Turbopack)
npm run typecheck  # tsc --noEmit
npm run lint       # next lint (ESLint 9 + FlatCompat circular-ref bug noted)
npm run gen:types  # regenerate utils/supabase/database.types.ts from prod
```

For deploys, prefer `npx -y vercel deploy --prod --yes` until the webhook is fixed.

<!-- gitnexus:start -->
# GitNexus — Code Intelligence

This project is indexed by GitNexus as **riccardoricciardi.com** (2505 symbols, 5189 relationships, 192 execution flows). Use the GitNexus MCP tools to understand code, assess impact, and navigate safely.

> If any GitNexus tool warns the index is stale, run `npx gitnexus analyze` in terminal first.

## Always Do

- **MUST run impact analysis before editing any symbol.** Before modifying a function, class, or method, run `gitnexus_impact({target: "symbolName", direction: "upstream"})` and report the blast radius (direct callers, affected processes, risk level) to the user.
- **MUST run `gitnexus_detect_changes()` before committing** to verify your changes only affect expected symbols and execution flows.
- **MUST warn the user** if impact analysis returns HIGH or CRITICAL risk before proceeding with edits.
- When exploring unfamiliar code, use `gitnexus_query({query: "concept"})` to find execution flows instead of grepping. It returns process-grouped results ranked by relevance.
- When you need full context on a specific symbol — callers, callees, which execution flows it participates in — use `gitnexus_context({name: "symbolName"})`.

## Never Do

- NEVER edit a function, class, or method without first running `gitnexus_impact` on it.
- NEVER ignore HIGH or CRITICAL risk warnings from impact analysis.
- NEVER rename symbols with find-and-replace — use `gitnexus_rename` which understands the call graph.
- NEVER commit changes without running `gitnexus_detect_changes()` to check affected scope.

## Resources

| Resource | Use for |
|----------|---------|
| `gitnexus://repo/riccardoricciardi.com/context` | Codebase overview, check index freshness |
| `gitnexus://repo/riccardoricciardi.com/clusters` | All functional areas |
| `gitnexus://repo/riccardoricciardi.com/processes` | All execution flows |
| `gitnexus://repo/riccardoricciardi.com/process/{name}` | Step-by-step execution trace |

## CLI

| Task | Read this skill file |
|------|---------------------|
| Understand architecture / "How does X work?" | `.claude/skills/gitnexus/gitnexus-exploring/SKILL.md` |
| Blast radius / "What breaks if I change X?" | `.claude/skills/gitnexus/gitnexus-impact-analysis/SKILL.md` |
| Trace bugs / "Why is X failing?" | `.claude/skills/gitnexus/gitnexus-debugging/SKILL.md` |
| Rename / extract / split / refactor | `.claude/skills/gitnexus/gitnexus-refactoring/SKILL.md` |
| Tools, resources, schema reference | `.claude/skills/gitnexus/gitnexus-guide/SKILL.md` |
| Index, status, clean, wiki CLI commands | `.claude/skills/gitnexus/gitnexus-cli/SKILL.md` |

<!-- gitnexus:end -->
