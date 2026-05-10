# HANDOFF — riccardoricciardi.com

## Last session — 2026-05-10

Branch unico: `main`. Deploy via `npx vercel --prod` (Vercel webhook GitHub rotto — fix CLI usato).

## Stack

Next 16 (Turbopack), React 19, Tailwind 4, **shadcn** (button, card, dropdown-menu, switch, checkbox, alert-dialog, tabs, input, label, table, badge, tooltip, sonner, separator), Supabase SSR + static + admin (service-role) client, next-themes, ldrs, Geist + Geist Mono, lucide-react.

## Architettura

```
app/
├── layout.tsx                # root (html/body, fonts, Providers, DynamicThemeVars, icons)
├── not-found.tsx             # global 404 (cookie/Accept-Language locale)
├── [locale]/
│   ├── layout.tsx            # inner (Navbar, Footer, JsonLd, HtmlLangUpdater)
│   ├── page.tsx              # Hero + Skills + Projects (force-static, 1h ISR)
│   ├── loading.tsx
│   ├── not-found.tsx
│   └── opengraph-image.tsx
├── api/cron/sync-github/     # Vercel cron endpoint
└── admin/                    # In-app CMS
    ├── layout.tsx            # AdminNav + Toaster + AdminToastListener
    ├── login/page.tsx
    ├── page.tsx              # Dashboard (3 groups: Design/Data/Settings)
    ├── theme/page.tsx        # Table per group, color swatch+picker
    ├── content/page.tsx      # Table per schema section, multi-lang cols
    ├── skills/page.tsx       # Table (Order/Icon/Name/Level/Dark/Delete)
    ├── skills/[id]/page.tsx  # Icon upload light+dark
    ├── projects/page.tsx     # Table + missing-translations banner
    ├── projects/[id]/page.tsx# i18n descrizioni + screenshot upload
    ├── navbar/page.tsx       # Table grouped per slug + multi-lang Add
    ├── languages/page.tsx    # Table
    └── actions.ts            # All server actions

components/
├── hero.tsx (Sparkles + dot-mask + glow + MouseParticles)
├── skills.tsx, skill-meter.tsx
├── projects.tsx, project-card.tsx
├── navbar.tsx (uses ScrolledHeader fixed+transparent at top)
├── footer.tsx (border-t single line, GitHub + email icons)
├── mouse-particles.tsx (canvas, accent-blue, prefers-reduced-motion)
├── scrolled-header.tsx (data-scrolled attribute)
├── dynamic-theme-vars.tsx (<style> injection)
├── global-loader.tsx (Bouncy ldrs)
├── html-lang-updater.tsx
├── language-picker.tsx, theme-picker.tsx, navbar-mobile.tsx
├── providers.tsx, json-ld.tsx, skip-link.tsx
├── admin/
│   ├── admin-nav.tsx         # Desktop horizontal grouped, mobile drawer
│   ├── color-input.tsx       # Swatch always visible + hex picker
│   ├── delete-button.tsx     # AlertDialog confirm
│   ├── toast-listener.tsx    # ?ok=/?error= -> sonner toast
│   └── lang-tabs.tsx         # Wraps shadcn Tabs primitives
└── ui/                       # shadcn components

utils/
├── config/app.ts             # APP_CONFIG (languages, defaultLanguage, translationTables)
├── auth/admin.ts             # requireAdmin, getAdminUser, ADMIN_EMAILS allowlist
├── i18n/{dictionary,types}.ts
├── content/{fetch,schema}.ts # getContentBlocks + schema for /admin/content
├── theme/fetch.ts            # getThemeSettings + buildThemeCss
├── skills/fetch.ts
├── projects/fetch.ts
├── storage/upload.ts         # uploadImage/deleteImage (Supabase Storage bucket 'image')
├── supabase/
│   ├── client.ts             # browser
│   ├── server.ts             # cookies (auth)
│   ├── static.ts             # no cookies (public reads, SSG)
│   ├── admin.ts              # service-role (bypasses RLS, server-only mutations)
│   └── middleware.ts
└── logger.ts

supabase/
├── functions/sync-github/    # Deno edge fn (Bearer CRON_SECRET)
└── migrations/
    ├── 0001_navbar_slug.sql
    ├── 0002_projects_table.sql
    ├── 0003_supabase_reorg.sql       # rename not-found->not_found, indexes, helpers
    ├── 0004_image_columns.sql        # icon_url, icon_dark_url, screenshot_url
    └── 0005_theme_and_content.sql    # theme_settings + content_blocks tables
```

## DB schema (Supabase project `yfzqurdmbllthonjdzpb`)

All RLS public-SELECT. Mutations bypass via service_role.

| Table | Columns |
|---|---|
| `languages` | id, code, name |
| `navbar` | id, slug, value, language_id, position |
| `theme` | id, slug, value, language_id, position |
| `not_found` | id, slug, value, language_id, position |
| `skills` | id, name, position, percentage, dark, category, icon_url, icon_dark_url |
| `projects` | id (uuid), repo, name, description, url, homepage, stars, forks, language, topics[], og_image, screenshot_url, pushed_at, synced_at, position, visible |
| `projects_i18n` | project_id, language_id, description |
| `theme_settings` | key, value_light, value_dark, type, group_name, description, position |
| `content_blocks` | id, slug, value, language_id, updated_at |

SQL helpers: `clone_language(src, tgt, name)`, `upsert_navbar_item(lang, slug, value, pos)`.

## Admin (`/admin/login`)

- Auth: Supabase email/password, allowlist via `ADMIN_EMAILS` env (default `admin@riccardoricciardi.com`)
- Service-role client used for mutations (bypass RLS)
- AlertDialog confirms every delete
- Sonner toasts on save/error via `?ok=`/`?error=` query params
- Tabs (shadcn) for per-language editing
- Move buttons (↑ ↓) for position; `swapPositions()` normalizes 0..N-1
- Auto-position on create (MAX+1)
- Color swatch always visible (works for oklch/rgb/hex)
- Multi-lang navbar Add: one form, one row per language

### Adding stuff cheat sheet

- **Skill**: `/admin/skills` → Add new → name+level+dark, auto-position
- **Project**: `/admin/projects` → Add new → repo URL only, click "Sync GitHub" to pull metadata
- **Project i18n**: `/admin/projects/{id}` → tabs per lang
- **Navbar item**: `/admin/navbar` → Add → slug + label per lang at once
- **Content string**: edit `utils/content/schema.ts` to declare slug, then edit values in `/admin/content`
- **Theme token**: edit value in `/admin/theme` (existing tokens) or add via SQL + map in `utils/theme/fetch.ts` `KEY_TO_VAR`
- **Language**: `/admin/languages` → Clone (then add code to `APP_CONFIG.languages` array)

## Visual system

- OKLCH neutral tokens (shadcn `new-york`)
- Accent: Tailwind `blue-600` light / `blue-500` dark (override-able via DB)
- Dashed grid borders (`var(--border-dashed)`) across cards/dividers/container sides
- Container max-width `1400px` (overridable via theme token)
- Smooth scroll, font-feature-settings, ::selection accent
- Hero: dot pattern + accent-blue glow + MouseParticles (network of dots that flee cursor)
- Navbar: fixed transparent at top → blur+border on scroll
- Heading `letter-spacing: -0.025em`

## Required Vercel env vars (Production)

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_SUPABASE_IMAGE_URL`
- `NEXT_PUBLIC_SITE_URL=https://riccardoricciardi.com`
- `SUPABASE_SERVICE_ROLE_KEY` (Sensitive)
- `ADMIN_EMAILS=admin@riccardoricciardi.com`
- `CRON_SECRET` (Sensitive, 32+ chars)
- `GITHUB_TOKEN` (Sensitive, PAT public_repo)

## Cron

`vercel.json` schedules `/api/cron/sync-github` daily at 06:00 UTC (Hobby plan limit). The route validates `Authorization: Bearer <CRON_SECRET>` then proxies to Supabase Edge Function `sync-github` which fetches GitHub API per row in `projects` and updates metadata.

## Open items

- Tighten Theme description column wrap (border_dashed row has weird swatch — browser-specific dashed rendering, low priority)
- Skills/Projects mobile table overflow OK (`overflow-x-auto`) but could test on actual phone
- Image preview before submit (drag-drop) — nice to have
- Drag-to-reorder (dnd-kit) — alternative to chevron buttons
- Soft delete + undo
- Search box for tables (skills/projects/navbar) when content grows
- Translate admin UI to IT (currently EN only)

## Useful commands

```bash
npm run dev
npm run build
npm run typecheck
npx vercel --prod --yes   # manual deploy when webhook is broken
```

## Recent deploys

Latest: `a37dc11` (Languages table + drop Skills Category column).

Stack of features shipped today:
- Shadcn checkbox + switch components
- Move buttons for position (skills/projects/navbar) — auto-unique
- Skill icon fallback to convention URL
- Multi-lang navbar add (one form, all langs)
- Dense table layouts (theme/content/languages)
- AlertDialog delete confirmation
- Sonner toasts
- Auto-position on create
- Roomier admin nav with group separators
- Favicon on all routes
- Color swatch preview works for oklch
