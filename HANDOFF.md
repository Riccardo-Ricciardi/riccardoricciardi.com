# HANDOFF — Redesign "Dev-Tool / Infrastructure"

Branch: **`main`** (il branch `redesign/dev-tool-infra` è stato eliminato — si lavora solo su main).
Stato: **SHIPPED** — commit `61925ec`, deploy Vercel `dpl_9foHLDxt5z3d76e5RFdTQ4JGp5W2` READY, live su riccardoricciardi.com.
Spec completa: `.audit/redesign-spec-dev-tool.md`.

## Sessione 2026-06-16 (pomeriggio) — hero v2 + rimozioni + deploy

- **Hero ridisegnata**: rimossa la `SystemMap` (richiesta Riccardo). Layout type-forward + scroll-cue. `system-map.tsx` ora orfano (non importato).
- **`ScrollSpine`** (`components/site/fx/scroll-spine.tsx`): firma di scroll page-wide. Nodo glow scende il rail sinistro col progresso scroll, rail "carico" sopra. Solo transform/scaleY via 1 CSS var rAF-throttled (passive). Reduced-motion: listener non agganciato + freeze CSS. Nascosto `< 768px`. CSS in `fx.css` (`.scroll-spine*`, `.scroll-cue`).
- **Progetti rimossi** (migration `0034`, applicata a prod): `social-automation` (in dev) + `map-switch` (non suo) → `projects.visible = false`. Copy scrubata: `hero_proof_clause`, `service_integrations-rescue_body`. Surfaces ridotte a 3: `windows-desktop` / `web` / `embedded-esp32` (tolte `raspberry-pi` e `ios`).
- **FASE 5 v2** (prod): LCP 89ms / CLS 0.00 / INP 43ms. Screenshot 768/1024 dark+light, reduced-motion ok.
- **Git**: tutto su `main`, committato e **pushato**, deploy automatico Vercel partito (webhook OK stavolta).

> ⚠️ Il branch contiene anche **lavoro non-committato preesistente** (redesign "Sistema Vivo" + rimozione segnali live di oggi: StatusDot, telemetry, ecc.). Il redesign dev-tool si somma a quello.

## Direzione approvata (Riccardo, FASE 2)

Target di polish: **Vercel · Supabase · Railway · Resend · GitHub**. Dark-first (+ light), near-black alto contrasto, **un solo accento blu** come glow/gradient/beam. NIENTE personale / luogo / Napoli / lusso / editoriale. Evoluzione di "Sistema Vivo", non ripartenza. Geist resta. Gesto firma unico = **"trace"** (luce che percorre lentamente le linee strutturali).

## FATTO questa sessione (FASE 3 + FASE 5 parziale)

1. **Design system** — `app/styles/tokens.css`: dark near-black ricalibrato (bg L.12, card L.182, border L.262, muted-fg .72 AA); nuovi token `--trace-dur/-ease`, `--beam/-soft`, `--glow-soft/-strong`, `--grid-line`, `--dot`, `--elev-1/-2/-glow`; `--weight-display 680`, tracking display -0.035em.
2. **Motion firma "trace"** — `app/styles/fx.css` (NEW, importato in globals dopo utilities):
   - `.trace-border` (beam perimetro continuo, superfici-chiave) + `.trace-card` (beam su hover/focus, paused = cheap).
   - `.fx-trace` (dash che viaggia su path SVG, pathLength=1) — il "segnale nel grafo".
   - sfondi: `.bg-grid-fade`, `.bg-dots-fade`, `.glow-radial(-soft)`, `.beam-sweep`, `.spotlight`, `.surface-glow`.
   - `@property --trace-angle`; **fallback `prefers-reduced-motion` completo** (travel off, stato statico).
3. **Display type** → Geist **Sans** bold (`.text-display` in utilities.css), mono resta per label/codice.
4. **SystemMap** (`components/site/fx/system-map.tsx`) — il segnale ora **viaggia** dal core ai nodi (fasi sfalsate), alone glow, niente pulsazioni.
5. **Hero** (`components/site/hero.tsx`) — panel-grafo incorniciato (header tipo-terminale + `trace-border` + `surface-glow`), headline grossa, sfondi `bg-grid-fade` + `glow-radial` + particelle calme.
6. **Nuove sezioni prodotto**: `components/site/code/showcase.tsx` (terminale `flow.ts` credibile, monocromo+blu) e `components/site/stack/section.tsx` (stack reale, chip mono, core accentati). Cablate in `app/[locale]/page.tsx`: Hero → **CodeShowcase** → Proof → Surfaces → **StackRow** → Services → ClosingCta.
7. **Surfaces + Services** — beam-firma all'hover (`trace-card`).
8. **Copy audit** — migration `supabase/migrations/0032_redesign_dev_tool_copy.sql` **APPLICATA via MCP**: scrub Napoli (`hero_wordmark_line`, `hero_subtitle`, `hero_availability`, `about_facts_location`) + seed bilingue `code_*`/`stack_*` (en=1, it=2). Fallback `NAPOLI` rimosso da page.tsx.

## Verificato

- `npm run typecheck` ✓ · `npm run build` ✓ (route /en /it SSG, 0 errori).
- Playwright: dark+light @1440 ✓, mobile 375 ✓ (0 overflow di pagina, map nascosta su mobile), 0 console errors.
- Screenshot (root, da NON committare): `redesign-1440-hero-dark.png`, `redesign-1440-full-dark.png`, `redesign-1440-hero-light.png`, `redesign-375-full-dark.png`, `inspect-proof.png`. Più `.playwright-mcp/`.

## FASE 4 + FASE 5 (sessione 2026-06-16) — FATTO

**FASE 4 — critica avversariale.** Due critici in parallelo: workflow 5-lensi (Awwwards / AI-slop / motion-trace / perf-CWV / a11y → 63 finding → punch-list di 18) + `codex:codex-rescue` (reloop sul codice aggiornato, 5 finding). Tutti implementati. Cambi chiave:

- **Disciplina colore (R1)**: nuovo token `--text-signal` (blu AA per testo: code keyword, chip core, arrow link, hover di link/pill/`btn-ghost`). `--accent-blue` ora SOLO per trace/beam/glow + CTA + dot-firma. Rimossi tutti i fill `bg-accent-blue-soft`.
- **Trace unificato (R2/R3/R11)**: stop conici identici su `trace-border`/`trace-card`; `--trace-dur` 5.5s→**2.8s**; `contain: paint`; `beam-sweep` morto **eliminato**; `fx-core` agganciato a `2×--trace-dur`; reduced-motion ora **congela il beam all'angolo luminoso** (opacity .7) invece di sparire.
- **De-cliché (R4)**: tolto il chrome a tre puntini macOS in hero + showcase → singolo dot-firma + filename.
- **Bento focale (R5)** Surfaces: lead 4×2, icona size-7, gradiente, cornice accent 1px. **Services** primary: cornice accent + icona signal, niente fill.
- **Stack raggruppato (R7)**: cluster Languages / Frontend / Backend & Infra / Hardware & QA, core-first, marker `sr-only "core"` → risolve WCAG 1.4.1. Label da `content_blocks` (`stack_group_*`) con fallback → **migration `0033_stack_group_labels.sql` da APPLICARE via Supabase MCP** (non ancora applicata).
- **Focus AA (R6)**: ring opachi (`btn` outline 2px+offset, `field` ring 2px). **Hero LCP (R8)**: ParticleField init dietro `requestIdleCallback` **con gate `idleReady`** anche sull'IntersectionObserver (fix CRITICAL Codex); densità 4→3; glow attenuato/spostato; ratio colonne 1.2/0.8; mask griglia più profonda.
- **Reveal (R12/R13)**: reduced-motion controllato in JS, threshold 0.2, `will-change` aggiunto+azzerato. **proof-row** Image con `sizes` + alt non-vuoto. Line-number `fg-subtle`→`muted-foreground`. **Eyebrow** con dot-firma. **showcase**: nesting `pre>code>div`→`span` (Safari/FF), commento credibile, caret statico (no blink). **system-map**: label clampate. **Hero fallback** non più stringhe vuote.

**FASE 5 — verifica (prod build su :3100, chrome-devtools MCP):**
- Screenshot root (NON committare): `redesign-{1024,768}-{dark,light}.png` + `redesign-1024-reduced-motion.png`.
- **CWV**: LCP **92ms** (TTFB 4 + render-delay 88, text-bound), CLS **0.00**, INP **46ms** (toggle tema). Tutti dentro budget (LCP<2.5 / CLS<0.1 / INP<200).
- **Reduced-motion**: provato via override `matchMedia` → 13/13 Reveal in-view senza scroll, ParticleField NON anima; fallback statico del trace renderizza l'identità congelata. Più `@media reduce` in fx.css/utilities.css + regola nucleare globals.css.
- **Safari beam**: verifica via codice + matrice supporto (no Safari live su Windows). `@property` (Safari 16.4+) + `-webkit-mask-composite: xor` **e** `mask-composite: exclude` entrambi presenti → beam OK su Safari 16.4+ (≈tutti nel 2026). Degrado grazioso su <16.4: niente beam, resta il bordo 1px (var `--trace-angle` non definita → conic invalida); in reduced-motion il bordo statico riappare.

`npm run typecheck` ✓ · `npm run build` ✓ (route /en /it SSG, 0 errori) dopo entrambi i round.

## DA FARE (prossima sessione)

1. **Applicare migration `0033_stack_group_labels.sql`** via Supabase MCP (4 slug `stack_group_*`, EN+IT). Finché non applicata, le label gruppo stack mostrano il fallback inglese per entrambe le lingue.
2. **Propagare** il sistema (e `--text-signal`) a: ClosingCta (grid/glow + trace), Footer/Navbar, pagine `about`/`work`/`uses`/`contact` (queste hanno ancora `text-accent-blue` flat nel testo: contact/nav-links/uses/empty-state). De-biografizzare copy about (`about_facts_*`). ProofRow: contrasto pannelli senza immagine.
3. **Copy**: verificare nessun "Napoli/Naples/Italia" residuo (`select ... where value ilike '%nap%' or value ilike '%itali%'`).
4. **Cleanup**: rimuovere PNG `redesign-*.png` + `inspect-proof.png` da root prima di qualsiasi commit; valutare `.gitignore`.

## Note tecniche

- Dev server: gira su :3000 (riavviato a fine sessione). Next 16 = singola istanza dev.
- `@property --trace-angle` + conic-gradient mask = bordo-beam; degrada a bordo statico se non supportato.
- `trace-card::before` è `paused` finché non hover → niente repaint continui su molte card (INP ok).
- Vercel webhook rotto: dopo push, fallback `npx -y vercel deploy --prod --yes`.
