# HANDOFF — riccardoricciardi.com

## Last session — 2026-05-10

Single branch `main`. Vercel auto-deploy on push.

### Stack

Next 16 (Turbopack), React 19, Tailwind 4, shadcn (button, card, dropdown-menu), Supabase SSR + static client, next-themes, ldrs (Bouncy), Geist + Geist Mono, Vercel Speed Insights, lucide-react.

### Architecture (now)

```
app/
├── [locale]/
│   ├── layout.tsx        # flex-col min-h-screen, Footer mounted
│   ├── page.tsx          # Hero + Skills + Projects (force-static, 1h ISR)
│   ├── loading.tsx
│   ├── not-found.tsx     # red 404 (per user pref)
│   └── opengraph-image.tsx
└── api/cron/sync-github/route.ts   # Vercel cron entrypoint, Bearer auth

components/
├── hero.tsx              # shadcn-style: pill + 7xl tracking-tight + CTA pair + bg-dot mask
├── skills.tsx            # rounded-xl, mono labels, hover bg-accent/40
├── skill-meter.tsx       # role=meter, foreground/muted segments
├── projects.tsx          # grid 1/2/3 cols
├── project-card.tsx      # og_image hero, mono name, topic chips, ★/forks/lang
├── footer.tsx            # border-t, GitHub/LinkedIn/email lucide icons
├── navbar.tsx            # sticky h-14, blur, border-b
├── language-picker.tsx   # client URL-based
├── theme-picker.tsx      # client prop-based
├── navbar-mobile.tsx
├── providers.tsx
├── global-loader.tsx
├── skip-link.tsx
└── json-ld.tsx

utils/
├── config/app.ts                # APP_CONFIG (single source)
├── i18n/{dictionary,types}.ts   # cached server fetch
├── skills/fetch.ts              # cached
├── projects/fetch.ts            # cached + i18n description override
├── supabase/{client,server,static,middleware}.ts
└── logger.ts

supabase/
├── functions/sync-github/index.ts   # Deno: GitHub API → projects table
└── migrations/
    ├── 0001_navbar_slug.sql
    ├── 0002_projects_table.sql
    └── 0003_supabase_reorg.sql      # rename not-found→not_found, indexes, helpers
```

### Supabase schema (current)

| Table | Purpose | Notes |
|---|---|---|
| `languages` | Supported languages | id (int), code, name |
| `navbar` | Per-locale menu | slug, value, language_id, position |
| `theme` | Theme picker labels | per-locale |
| `not_found` | 404 strings | per-locale (renamed from `not-found`) |
| `skills` | Tech skills | + nullable `category` for grouping |
| `projects` | GitHub repos | synced metadata (stars/forks/lang/topics/og_image) |
| `projects_i18n` | Per-locale description | override for projects |

RLS: public-SELECT on all (visible=true for projects).

### Helpers (Supabase Studio → SQL Editor)

```sql
-- Bootstrap a new language
select clone_language('en', 'fr', 'Français');

-- Add a navbar entry (run for each language)
select upsert_navbar_item('en', 'blog', 'Blog', 4);
select upsert_navbar_item('it', 'blog', 'Blog', 4);
```

### GitHub Projects sync

1. Insert row in `projects` table (only `repo` + `position` + `visible=true` needed)
2. Optional: insert into `projects_i18n` for translated description
3. Cron `0 */6 * * *` hits `/api/cron/sync-github` → proxies to Supabase Edge Function `sync-github`
4. Edge fn fetches GitHub API, fills `name/description/url/homepage/stars/forks/language/topics/og_image/pushed_at`

### Manual steps (one-time setup)

**Vercel env (Production + Preview):**
- `CRON_SECRET` = random 32+ char string
- `GITHUB_TOKEN` = PAT classic, scope `public_repo`
- `NEXT_PUBLIC_SITE_URL` = `https://riccardoricciardi.com`

**Deploy edge function:**
```bash
npx supabase functions deploy sync-github --project-ref yfzqurdmbllthonjdzpb
npx supabase secrets set CRON_SECRET=<same> GITHUB_TOKEN=<same> --project-ref yfzqurdmbllthonjdzpb
```

**First sync:**
```bash
curl -X GET https://riccardoricciardi.com/api/cron/sync-github \
  -H "Authorization: Bearer <CRON_SECRET>"
```

### Visual system

- OKLCH neutral tokens (shadcn `new-york` default)
- `--accent-blue` light `#087EA4` / dark `#149ECA` (react.dev) — used in selection + reserved for links
- Container `max-w-1400px` + responsive padding
- Section rhythm `py-16 md:py-24 lg:py-28`
- `.bg-dot` + `.bg-dot-mask` + `.bg-grid` + `.text-balance` utilities
- Smooth scroll (respects reduced-motion)
- Heading `letter-spacing: -0.025em` automatic
- `font-feature-settings: rlig 1, calt 1` for better Geist rendering

### Adding stuff (cheat sheet)

**New skill:** Insert row in `skills` table (`name`, `position`, `percentage`, `dark`, optional `category`).
**New navbar item:** `select upsert_navbar_item('<lang>', '<slug>', '<label>', <pos>);` per language.
**New language:** `select clone_language('en', '<code>', '<name>');` then update `APP_CONFIG.languages` array.
**New project:** Insert row in `projects` (repo, position, visible). Cron auto-syncs metadata.
**Override project description per locale:** Insert row in `projects_i18n`.

### Next backlog

- [ ] Seed projects rows (repo + position) and run first cron
- [ ] Add `NEXT_PUBLIC_SITE_URL`, `CRON_SECRET`, `GITHUB_TOKEN` to Vercel
- [ ] Deploy `sync-github` edge function
- [ ] Add About section (probably DB-backed `about` translation table)
- [ ] CV download link
- [ ] Lighthouse pass + bundle analyzer
- [ ] CSP tighten (remove unsafe-inline/unsafe-eval, use nonce)
- [ ] Submit sitemap to Google Search Console

### Useful commands

```bash
npm run dev
npm run build
npm run typecheck
```
