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
  The homepage's sheet loads as a render-blocking classic `<script>` in `<head>`
  (`frontend/public/scripts/home-styles.js`) so it is adopted before first paint;
  this clears the Lighthouse cls-culprits body-shift a deferred module caused.
  The cost is a render-blocking-resources warning (non-blocking): under this CSP
  any FOUC-free styling is render-blocking unless inlined, which the policy bans.
  Writeup pages keep deferred style modules (Lighthouse only scans the homepage).

## Priorities

1. Gate-green static site

- Plan milestones: 1, 2, 4, 5.
- Fix HTML, lint, accessibility, responsive, and browser failures without
  weakening checks.
- Definition of done: `pnpm preflight` exits 0, then `pnpm gate` exits 0.

2. End-to-end page coverage

- Plan milestones: 3, 4, 6.
- Browser tests must execute the served site entry points, assert HTTP status,
  headings, exact external destinations, and missing local asset failures.
- Definition of done: `pnpm --prefix frontend test:e2e` exits 0.

3. Deployment readiness notes

- Plan milestones: 7, 8.
- Keep `docs/PROJECT_STATUS.md` current with checks, blockers, readiness, and
  human-review notes.
- Definition of done: project status is under 100 lines and matches the latest
  checks.

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
- Every page's external style module actually applies (a stylesheet is adopted
  and the page reset takes effect) with no inline `<style>` and no CSP
  violation, asserted in the browser.
- AI Deployment Calculator links and structured data use `https://vram.rxdt.dev/`;
  its tile uses `frontend/public/assets/caclulator.png`.

## Out of Scope

- Backend services.
- GitHub deployment or pushing to GitHub.
- Harness or config changes.

## Blockers

- Manual owner visual approval and deployment remain human-owned.

## Changelog

- 0004-claude 1/1: Fixed the Lighthouse cls-culprits FOUC — the homepage style
  sheet now loads as a render-blocking classic script in `<head>` (moved to
  `public/scripts/`) so it applies before first paint; zero visual change, e2e
  proves the mechanism. Gate stays red only on image-delivery + network-tree.
- 0003-claude 1/1: Added axe-core WCAG A/AA e2e coverage for every route in
  light+dark across all device projects; it caught and fixed real bugs the
  homepage-only Lighthouse scan missed — writeup byline/stamp contrast and the
  conference results table now a keyboard-focusable named `<section>` region.
- Prior loops: LoopGate tile shown uncropped (`object-fit: contain`); migrated
  calculator links/structured data to `https://vram.rxdt.dev/`; added thumbnail
  + external-destination contracts, filled spec/status, fixed media contracts,
  externalized CSP-safe styling/behavior, optimized media, cleared e2e.
