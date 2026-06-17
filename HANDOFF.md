# HANDOFF — riccardoricciardi.com

Shipped to `main` @ `30530a5` (2026-06-17). Vercel auto-deployed (GitHub integration fired — the webhook works again).

## Done this session

- **Hero brandmark** — `LogoMark` (vector outline traced from `public/logo.png`) as a faint edge-faded watermark bleeding off the right. Interactive: lights `--accent-blue` on hover (`.group:hover .logo-mark path`; hit box = right zone, `z-20`, `pointer-events-auto`).
- **Scroll motion is content-anchored** (a full-viewport wandering "spiral" line was tried and rejected — removed). Primitives in `components/site/fx/`:
  - `Parallax` — scroll-linked drift (Proof visual column, bento heading).
  - `SpotlightGroup` — one delegated pointer listener feeds `--mx/--my` to the `.spotlight` card under the cursor (bento cards).
  - `DrawOnView` + `.draw-svg` (fx.css) — stroke-draws any child with `pathLength={1} data-draw` on enter (bento globe + PCB).
- **Section redesigns**
  - **How I build** (`code/showcase.tsx`) — dropped the terminal/3D; editorial 3-principle list (`code_principle_1..3` from CMS).
  - **Stack** (`stack/section.tsx`) — dropped the ⌘K palette; spec-sheet `<dl>` (group label + inline tech, core in `text-signal`).
  - **Proof** (`proof/proof-row.tsx` `SystemPanel`) — deploy panel: status dot + slug + state, sparkline (accent on latest bars), count-up metric rows (`CountUp`), `$ deploy --prod · live`. Eyebrow = **"My best active project"**.
  - **Services** — numbered playbooks (`01/02/03`, hover-reveal `$ command` from an id→token map).
  - **Closing CTA** — `$ contact --now ▍` terminal-prompt chip (static caret, no blink).
- **F24 scoped to Proof only** — removed from hero clause, Windows bento card (titlebar now `entry.label` + line copy), and 2 service bodies.
- **Copy refresh (en+it)** — Supabase migration `homepage_copy_refresh_f24_scope` (upsert into `content_blocks`).

## Decisions / gotchas

- **Framer Motion `pathLength`** is a special prop — set it (and `pathOffset`) as MotionValues; never hand-roll `strokeDasharray` (Motion overrides it).
- Reduced motion is handled by the **nuclear rule** in `globals.css` (`*{animation/transition-duration:.01ms!important}`) on top of per-component JS gates — don't duplicate fallbacks in fx.css.
- Accent-blue discipline holds: trace/beam/glow/CTA/dot/hover only. Sparkline = foreground bars + accent on the latest point.
- `next lint` is broken (Next 16 removed the subcommand) — pre-existing. typecheck + build are the real gates (both green).

## State

- typecheck + `next build` green. Verified in browser (dark + light), no console errors.
- Reviewed via two adversarial workflows; only real fix applied was `.spotlight:focus-within` (keyboard glow).

## Next (optional)

- i18n: a few mono affordances are still literals (`$ deploy --prod`, `$ contact --now`, CLI tokens, kbd) — tolerated technical tokens. Move to CMS slugs + migration if you want them editable.
- GitNexus index is stale — `npx gitnexus analyze` when convenient.
