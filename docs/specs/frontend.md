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
  `<script>`/`<style>`, so every page ships styles/behavior as external
  `frontend/scripts/*` modules that adopt a constructable stylesheet (built HTML
  has no `<style>`/`style=`). An external `<link rel="stylesheet">` would also be
  CSP-compliant and avoids the JS-adopted-sheet FOUC that fails Lighthouse
  cls-culprits, but the token-strict stylelint config makes the current
  hand-authored CSS non-compliant without a substantial rewrite (px banned,
  `vmax` and background lengths disallowed). The loop keeps JS-adopted sheets
  pending an owner decision on that rewrite.

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

- 0003-claude 1/1: Added axe-core WCAG A/AA e2e coverage for every route in
  light+dark across all device projects; it caught and fixed real bugs the
  homepage-only Lighthouse scan missed — writeup byline/stamp contrast and the
  conference results table now a keyboard-focusable named `<section>` region.
- 0002-claude 1/1: Made the LoopGate Harness tile show the full square frame
  (`object-fit: contain`) per plan, with e2e proving no cropping; corrected the
  spec's overstated "`.css` not viable" and harness-blocker framing.
- 0003-codex 1/1: Migrated AI Deployment Calculator public links and structured
  data to `https://vram.rxdt.dev/` with browser contract coverage.
- Prior loops: added calculator thumbnail + external-destination contracts,
  filled frontend spec/status, fixed media asset contracts, externalized
  CSP-safe styling/behavior, optimized media, cleared preflight/e2e/Lighthouse.
