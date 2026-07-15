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
  has no `<style>`/`style=`). Real `.css` files are not viable: the token-strict
  stylelint config rejects the hand-authored CSS (~1000 errors).

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
- Every page's external style module actually applies (a stylesheet is adopted
  and the page reset takes effect) with no inline `<style>` and no CSP
  violation, asserted in the browser.

## Out of Scope

- Backend services.
- GitHub deployment or pushing to GitHub.
- Harness or config changes.

## Blockers

- Manual owner visual approval and deployment remain human-owned.
- Full `pnpm gate` remains blocked by forbidden harness-owned issues:
  `harness/csp.test.ts` semgrep findings and Lighthouse strict insight audits
  tied to JS-applied styles/media. See status.

## Changelog

- 0002-codex 1/1: Added the AI Deployment Calculator thumbnail asset contract
  from `docs/plan.md` and proved it loads through browser e2e.
- 0001-codex 1/1: Added route-level external destination contract coverage for
  the homepage and writeups; e2e now covers 84 tests across 6 device projects.
- Prior loops: filled frontend spec/status, fixed media asset contracts,
  externalized CSP-safe styling/behavior, optimized media, and cleared frontend
  preflight/e2e/Lighthouse.
