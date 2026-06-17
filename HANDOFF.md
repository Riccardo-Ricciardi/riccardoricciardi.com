# HANDOFF — Surfaces redesign + motion overhaul (2026-06-17)

## Done this session

Reworked the homepage motion direction after several iterations. Net result:

- **Constellation** (`components/site/fx/constellation.tsx`): faint 2D canvas network (low-density nodes + links), mouse-reactive (accent-blue links to cursor), theme-aware, site-wide. Mounted in `app/[locale]/layout.tsx`. Reduced-motion → not mounted (flat bg). **User likes this — keep it.**
- **Hero** (`components/site/hero.tsx`): flat editorial — giant `clamp(2.75rem,7vw,7rem)` headline, mono command-eyebrow + static caret, word stagger on mount, scroll parallax (transform). **No WebGL.**
- **Stack** (`stack/section.tsx`): bento spec-sheet, 4 group cards, scale reveal stagger, index numbers, `N · M core` footer.
- **Surfaces** → `components/site/surfaces/bento.tsx` (`SurfacesBento`). Supabase-style asymmetric bento, **no glow anywhere** (border-color only on hover). Cards routed by `entry.id`:
  - `windows-desktop` → **WindowsCard** (BIG cell `lg:col-span-2 lg:row-span-2`, **first**): F24 Tool desktop app-window mockup (titlebar `— ▢ ✕` + Excel-style grid). Hover → controls/border blue, grid cells fill `accent-blue-soft` in a diagonal sweep.
  - `web` → **GlobeCard**: 2D wireframe globe (parallels static, meridians spin via CSS `rx` keyframe, nodes pulse). Hover → globe lines blue.
  - `embedded-esp32` → **PcbCard**: faint PCB traces + pads; hover → traces/pads color blue **and a current dash flows** along each trace (`.pcb-flow`, staggered `animationDelay`).
- **Lateral borders frame**: removed `border-left/right` from `.container-page`; added `.page-frame` (utilities.css) with the side borders, wrapping `main`+`Footer` at full height in the locale layout → **continuous lateral borders, never break, at any width.**
- **content_blocks reworded** (en+it) for `surface_windows-desktop_line`, `surface_web_line`, `surface_embedded-esp32_line` via migration `reword_surface_lines` (already applied to prod DB).

## Key decisions / gotchas

- **Motion reliability**: in this `motion` (Framer) + scroll setup, **scroll-linked `opacity` and `clipPath` via `useTransform` DECAY past their window / stick hidden**. Transform props (`x`/`y`/`scale`/`scaleX/Y`) and `whileInView` one-shot work fine. → All scrub/reveal motion is transform-based or CSS. `clip` variant was **removed** from the `Reveal` atom for this reason.
- **CodeShowcase** (`code/showcase.tsx`) is still the one pinned scroll-telling section (terminal writes itself via `scaleY`/`y` transforms). Kept on purpose. `surface-glow` removed from it (no glow).
- **No glow** is a hard rule now (user). Border/colour only.
- Dev server: PowerShell `npm run dev` was flaky (tool error-mapping). Use **Bash**: `PORT=3011 npm run dev`. Was running on `localhost:3011`.
- Programmatic `scrollTo` + IntersectionObserver `once` is unreliable for QA — reveals need smooth/incremental scroll to fire. Not a real bug.

## State

- **Uncommitted on `main`. NOT deployed.** Typecheck + `npm run build` both green.
- Deleted this session: `fx/{geo-field,hero-backdrop,hero-canvas,scroll-particles,system-map}.tsx`, `surfaces/circuit.tsx`, `surfaces/web-tabs.tsx`, `atoms/slide-in.tsx`. Dead CSS pruned from `fx.css` (geo, hero-canvas-fade, f24-doc).

## Next

- **Deploy** when approved: `npx -y vercel deploy --prod --yes`, then verify (`npx vercel ls`).
- `surfaces/section.tsx` (old bento component) is now **unused except its `SurfaceEntry` type export** — safe to slim to just the type.
- **three / @react-three/fiber / @react-three/drei likely fully unused now** (hero-canvas was the last user; `particle-field.tsx` used by closing-cta is 2D canvas). Verify with knip, then drop the deps to cut bundle.
- Open offers to user: change web/embedded **animations** too (only Windows anim was changed this round); tune sweep/flow/spin speeds.
