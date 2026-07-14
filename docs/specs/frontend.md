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
- Homepage uses an optimized looping portrait asset, Comfyday sample video
  playback contract, and Inference Conference image named in `docs/plan.md`.
- Responsive Playwright projects render the homepage and writeup pages.

## Out of Scope

- Backend services.
- GitHub deployment or pushing to GitHub.
- Harness or config changes.

## Blockers

- Manual owner visual approval and deployment remain human-owned.
- Full `pnpm gate` is blocked by harness coverage tests that require forbidden
  harness/package/config/doc-plan edits outside this frontend spec.

## Changelog

- 0001-codex 1/1: Replaced placeholder spec with plan-derived frontend scope;
  replaced missing homepage project images with local panels; added Playwright
  coverage for asset failures and writeup route status; cleared frontend
  preflight, e2e, and Lighthouse issues.
- 0001-codex 1/1: Added end-to-end coverage for plan-required media; restored
  animated portrait, Inference Conference PNG, and script-started Comfyday video
  playback; moved inline page styles/scripts into external frontend scripts.
- 0005-codex 1/1: Cleared frontend production Lighthouse by inlining runtime
  style/behavior scripts under CSP, converting the portrait GIF to animated
  WebP, compressing Comfyday video and the conference PNG, and extending CSP
  e2e coverage.
