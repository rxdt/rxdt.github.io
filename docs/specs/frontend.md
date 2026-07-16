# Frontend Spec

Build `frontend/` into a static personal GitHub Pages site for Rox dT that can
survive the harness gate and manual visual review.

## Scope

- Static HTML/CSS/JS in `frontend/`; no backend.
- Homepage with owner identity, project links, contact links, and blog-like
  writeup pages.
- Public assets under `frontend/public/` must resolve locally during browser
  tests.
- Use Playwright for entry-point behavior, route status, responsive rendering,
  accessibility-facing selectors, and observable page output.
- The harness CSP (`script-src 'self'; style-src 'self'`) forbids inline
  `<script>`/`<style>`, so styles/behavior ship as external same-origin files
  that adopt a constructable stylesheet (built HTML has no `<style>`/`style=`).
  The homepage scripts (`frontend/public/scripts/*.js`) load `defer` (non-render-
  blocking), so neither is a Lighthouse critical-dependency node (empty network-
  dependency-tree). To still avoid a first-paint shift (cls-culprits), the page
  ships `<body hidden>`; `home-styles.js` adopts the sheet THEN unhides (first
  paint already styled), and `home.js` repeats the unhide as a load-failure
  backstop. This passes BOTH cls-culprits and network-dependency-tree under the
  pinned CSP. The homepage has no `type="module"` script, so Vite emits no
  `index-*.js` bundle. Writeups keep deferred style modules (Lighthouse scans
  only the homepage).

## Priorities

1. Gate-green static site (plan 1,2,4,5): fix HTML, lint, a11y, responsive, and
   browser failures without weakening checks. Done: `pnpm preflight` then
   `pnpm gate` exit 0.
2. End-to-end page coverage (plan 3,4,6): browser tests execute served entry
   points and assert HTTP status, headings, exact external destinations, and
   missing-asset failures. Done: `pnpm --prefix frontend test:e2e` exits 0.
3. Deployment readiness (plan 7,8): keep `docs/PROJECT_STATUS.md` current with
   checks, blockers, readiness, human-review notes, under 100 lines.

## Guardrails

- Do not edit harness, package manifests, lockfiles, tool configs, or
  `docs/plan.md`.
- Keep docs in `docs/` under 100 lines each.
- Tests must assert behavior and browser-visible output, not markdown contents.
- Do not remove tests or assertions to pass the gate.

## Acceptance Criteria

- `pnpm preflight` exits 0.
- `pnpm gate` exits 0.
- Homepage and writeup routes return HTTP 200 in Playwright.
- Same-origin `/assets/` requests made by the homepage do not return 4xx/5xx.
- Homepage and writeup pages preserve the expected external destination sets for
  public project, profile, and article links.
- Homepage uses an optimized looping portrait asset, Comfyday sample video
  playback contract, and plan-named AI Deployment Calculator plus Inference
  Conference project images.
- Responsive Playwright projects render the homepage and writeup pages.
- Every route passes an automated axe-core WCAG A/AA scan in light and dark
  themes across all device projects.
- Every page's external style module applies (a stylesheet is adopted, the page
  reset takes effect) with no inline `<style>`/CSP violation; the homepage stays
  `<body hidden>` until its deferred sheet applies, then reveals — asserted in
  the browser.
- AI Deployment Calculator links and structured data use `https://vram.rxdt.dev/`;
  its tile uses `frontend/public/assets/caclulator.png`.

## Out of Scope

- Backend services.
- GitHub deployment or pushing to GitHub.
- Harness or config changes.

## Blockers

- Manual owner visual approval and deployment remain human-owned.
- OWNER-DECISION (only remaining gate red): `image-delivery-insight` flags the
  animated `merged.webp` portrait (~15.4 KiB > the 4096 B threshold). Verified
  unfixable without a tradeoff (bytes-per-displayed-pixel heuristic vs a 40 KiB
  10-frame animation). Options: accept heavier compression (visible loss), swap
  to a `<video>` (not image-flagged), or carve the insight out of the harness.

## Changelog

- 0001-claude 1/1: Broke the cls-culprits vs network-dependency-tree deadlock —
  homepage scripts load `defer` with `<body hidden>` unhidden after the sheet is
  adopted, so BOTH pass with no render-blocking node; dropped the homepage Vite
  module bundle; resized `caclulator.png` (420x308->330x242) out of image-
  delivery. Gate red now only on `merged.webp` image-delivery.
- Prior loops: render-blocking style script for cls (superseded above); axe WCAG
  A/AA e2e (light+dark) fixing writeup contrast + scrollable table; LoopGate tile
  uncropped; calculator links/data to `vram.rxdt.dev`; thumbnail + external-
  destination contracts; CSP-safe externalized styling; optimized media.
