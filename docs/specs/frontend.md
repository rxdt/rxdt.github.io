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

## Priorities

1. Gate-green static site

- Plan milestones: 1, 2, 4, 5.
- Fix HTML, lint, accessibility, responsive, and browser failures without
  weakening checks.
- Definition of done: `pnpm preflight` exits 0, then `pnpm gate` exits 0.

2. End-to-end page coverage

- Plan milestones: 3, 4, 6.
- Browser tests must execute the served site entry points, assert HTTP status,
  headings, expected links, and missing local asset failures.
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
- Responsive Playwright projects render the homepage and writeup pages.

## Out of Scope

- Backend services.
- GitHub deployment or pushing to GitHub.
- Harness or config changes.

## Blockers

- Manual owner visual approval and deployment remain human-owned.
- Existing dirty `harness/` changes are outside this spec and must not be
  staged by frontend work.

## Changelog

- 0001-codex 1/1: Replaced placeholder spec with plan-derived frontend scope;
  replaced missing homepage project images with local panels; added Playwright
  coverage for asset failures and writeup route status; cleared frontend
  preflight, e2e, and Lighthouse issues.
