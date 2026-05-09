# HANDOFF — riccardoricciardi.com

## Sessione 2026-05-09

### Stato attuale

Branch unico: `main`. Tutto pushato e deployato via Vercel.

**Stack confermato:** Next 16 (Turbopack), React 19, Tailwind 4, shadcn (button, card, dropdown-menu), Supabase SSR + static read-only client, next-themes, ldrs (Bouncy loader), Geist font, Vercel Speed Insights.

### Cosa è stato fatto

#### Architettura
- `app/` → `app/[locale]/` con root layout dinamico (`<html lang>`)
- URL strategy: prefix sempre (`/en`, `/it`)
- Server Components + `React.cache` per dictionary e skills fetch
- Static Supabase client (no cookies) → SSG abilitato per `/en` e `/it`
- ISR 1h via `revalidate: 3600` + `force-static`
- Suspense + `loading.tsx` (rimosso loadingManager zustand)
- Slug-based routing per navbar (colonna `slug` su Supabase)
- Proxy locale-aware con detect cookie + Accept-Language

#### Componenti
- Server: `Navbar`, `Skills`, `JsonLd`
- Client: `LanguagePicker` (URL-based), `ThemePicker` (props), `NavbarMobile`, `Providers`, `GlobalLoader`
- A11y: `SkipLink`, `SkillMeter` (`role="meter"`, sempre visibile), aria-labels, focus-visible

#### SEO
- `generateMetadata` per locale (OG, Twitter, hreflang, canonical)
- `app/sitemap.ts`, `app/robots.ts`, `app/manifest.ts`
- JSON-LD `Person` + `WebSite`
- `app/[locale]/opengraph-image.tsx` dinamica
- `metadataBase` da `NEXT_PUBLIC_SITE_URL`

#### Sicurezza
- `next.config.ts` headers: HSTS, CSP (Supabase + Vercel allowlist), X-Frame-Options DENY, X-Content-Type-Options, Referrer-Policy, Permissions-Policy
- `poweredByHeader: false`
- Supabase RLS verificato: SELECT public-only su tutte le 5 tabelle

#### DB
- Migration `0001_navbar_slug.sql` applicata via Supabase MCP
- Unique index `navbar_slug_per_language_idx` su `(language_id, slug)`

#### Loader + Design
- `GlobalLoader` Bouncy spinner ldrs (fullscreen + inline modes)
- Trigger: route loading, Suspense fallback, language transition
- Card skill: hover lift, border accent, ombra leggera
- Container responsive padding

### Decisioni chiave

- **No content section yet** — utente lo aggiungerà dopo
- **Single branch `main`** — backup/codex/vercel branch tutti cancellati
- **Vercel auto-deploy** su push main
- **No tests for now** — Playwright rimosso
- **Design direction**: shadcn + react.dev (semplice, monochrome, clean)

### Next steps (da fare prossima sessione)

#### Design rifinitura → shadcn / react.dev feel

1. **Hero strip** sopra skills:
   - Nome grande (`text-5xl md:text-7xl font-bold tracking-tight`)
   - Role/tagline mutato sotto (`text-xl text-muted-foreground`)
   - Eventuale eyebrow text in mono font (`font-mono text-sm`)
   - Background sottile dot pattern o gradient radial (shadcn-style)

2. **Accent color blue** (alla react.dev):
   - Aggiungi `--accent-blue: oklch(0.65 0.18 250)` in globals.css
   - Usa per link, focus ring, skill meter filled, hover states

3. **Typography pairing**:
   - `Geist` per UI (già attivo)
   - `Geist Mono` per labels tecniche skill (già importato, non usato)
   - Applica `font-mono` su nome skill nel card

4. **Section dividers** sottili tra sezioni:
   - `border-b border-border` con padding generoso
   - Eventuale dot pattern background per hero (shadcn pattern)

5. **Footer minimale**:
   - `© Riccardo Ricciardi {year}`
   - Link GitHub / LinkedIn / email (icone lucide)
   - Border-top, padding generoso

6. **Skill card refinement**:
   - Considerare layout bento (alcune card più grandi)
   - O mantenere grid uniforme stile shadcn registry

7. **Scrollbar styling**: già fatto, verifica look

#### Performance ulteriore

- [ ] Lazy-load `country-flag-icons` (componenti SVG inline)
- [ ] Verifica bundle size con `npm run build` + `next-bundle-analyzer`
- [ ] Considera `next/dynamic` per `LanguagePicker` + `ThemePicker` (interazioni rare)
- [ ] Preload critical font weight in layout
- [ ] Audit `tw-animate-css` + `tailwindcss-animate` — rimuovi se inutilizzati

#### Contenuto (quando pronto)

- [ ] Hero (nome + headline + foto/avatar)
- [ ] About section
- [ ] Projects (cards con stack, link, screenshot)
- [ ] Experience timeline
- [ ] Contact form (server action) o link mailto + social
- [ ] CV download link

#### SEO + analytics

- [ ] Aggiungi `NEXT_PUBLIC_SITE_URL` su Vercel env (Production)
- [ ] Verifica Real Experience Score Vercel post-deploy
- [ ] Submit sitemap a Google Search Console
- [ ] Aggiungi Plausible o Vercel Analytics (oltre Speed Insights)
- [ ] Verifica OG image renderizza correttamente (debug `/en/opengraph-image`)

#### A11y

- [ ] Run axe-core o Lighthouse a11y audit
- [ ] Verifica contrast ratio tutti i testi (specie hover states)
- [ ] Test screen reader (NVDA/VoiceOver) navigazione completa

#### Sicurezza

- [ ] Tighten CSP: rimuovi `'unsafe-inline'` + `'unsafe-eval'` da `script-src` (richiede nonce)
- [ ] Audit Supabase: verifica `anon_key` non sia mai usato lato server con privilegi extra
- [ ] Considera rate-limit (Upstash + middleware) se aggiungi form

### File chiave per orientarsi

```
app/[locale]/
├── layout.tsx           # root + metadata + SEO
├── page.tsx             # home (force-static)
├── loading.tsx          # GlobalLoader
├── not-found.tsx        # 404
└── opengraph-image.tsx  # dynamic OG

components/
├── navbar.tsx           # server
├── skills.tsx           # server, fetch + render
├── skill-meter.tsx      # role=meter, always visible
├── language-picker.tsx  # client, URL-based
├── theme-picker.tsx     # client, prop-based
├── navbar-mobile.tsx    # client dropdown
├── providers.tsx        # ThemeProvider + SpeedInsights
├── global-loader.tsx    # Bouncy fullscreen
├── skip-link.tsx
└── json-ld.tsx          # Person + WebSite schema

utils/
├── config/app.ts        # APP_CONFIG (single source of truth)
├── i18n/
│   ├── dictionary.ts    # cached server fetch
│   └── types.ts
├── skills/fetch.ts      # cached server fetch
├── supabase/
│   ├── client.ts        # browser
│   ├── server.ts        # cookies-based (auth, future)
│   ├── static.ts        # NO cookies (read-only public, SSG-safe)
│   └── middleware.ts
└── logger.ts            # replaces console.error
```

### Comandi utili

```bash
npm run dev          # turbopack dev
npm run build        # production build
npm run typecheck    # tsc --noEmit
```

### Env richieste (Vercel + .env.local)

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
NEXT_PUBLIC_SUPABASE_IMAGE_URL=...
NEXT_PUBLIC_SITE_URL=https://riccardoricciardi.com
```

### Riferimenti design

- shadcn/ui: https://ui.shadcn.com (lookup hero, registry layout)
- react.dev: https://react.dev (lookup typography, accent blue, sticky nav)
- Geist font specimens: https://vercel.com/font

### Memoria sessione

User vuole:
- Design semplice stile shadcn + react.dev
- Caveman mode attivo nelle risposte
- Niente test per ora
- Tutto via Vercel (auto-deploy)
- Single branch main
