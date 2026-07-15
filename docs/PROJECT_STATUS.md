# Project Status

> Current truth of the repo. Keep it short and current < 100 lines.

## Current Focus

- Active spec: `docs/specs/frontend.md`
- Active milestones: plan milestones 1, 2, 4, 5, and 6.

## Current State

- Each page's CSS-injection script and the homepage behavior now live in
  external `frontend/scripts/*` modules; built HTML has no inline
  `<script>`/`<style>` and renders with zero CSP violations.
- The AI Deployment Calculator tile now uses the plan-named
  `frontend/public/assets/caclulator.png` as a real decoded browser image.
- Browser coverage loads the homepage and writeups end to end, checks route
  status/headings/assets/CSP-applied styles, and now preserves the exact
  external destination set for public project, profile, and article links.

## Checks

- `pnpm preflight`: PASS (format, eslint, style, html) — 0 issues.
- `pnpm gate`: FAIL on forbidden `sast` plus strict Lighthouse insights. All
  frontend structural checks pass: typecheck, cruise, deadcode, spelling, build,
  coverage, e2e.
  - `coverage` (incl. `csp.test.ts`): PASS — was the blocker, now green.
  - `e2e`: PASS, 84 tests across 6 device projects.
  - `sast`: FAIL — 2 semgrep findings, both in forbidden `harness/csp.test.ts`.
  - `lighthouse`: FAIL — cls-culprits, image-delivery, network-dependency-tree;
    CLS warning remains 0.02. Responsive-image and modern-format findings are
    clear after optimizing the calculator PNG.

## Next

1. Human fixes or approves the forbidden `harness/csp.test.ts` semgrep blocker.
2. Human decides whether Lighthouse insight assertions need a harness carve-out
   for JS-applied styles/media, or accepts lower visual quality for the portrait.
3. Owner reviews the site visually and deploys when satisfied.

## Changelog

- 0002-codex 1/1: Replaced the calculator project text placeholder with the
  required PNG thumbnail, optimized it to avoid new Lighthouse image findings,
  and added e2e coverage that asserts the asset decodes.
- 0001-claude 1/1: Externalized inline CSS/behavior into `frontend/scripts/*`
  modules to satisfy the harness CSP check; added e2e proving external styles
  apply under CSP; coverage and e2e now pass.
- 0005-codex 1/1: Optimized production media, replaced `merged.gif` with
  animated `merged.webp`, inlined runtime scripts under CSP, and cleared
  frontend preflight/e2e/Lighthouse.
- 0001-codex 1/1: Added e2e external destination contracts for the homepage and
  all writeup routes; targeted frontend e2e passes with 84 browser tests.

## Blockers (harness-owned; loop cannot edit `harness/`)

- `harness/csp.test.ts` error string `... inline <script> body/bodies ...` trips
  semgrep `unknown-value-with-script-tag` -> `sast` fails. Needs a semgrep-safe
  rewrite or allow-comment in the harness.
- `lighthouse:recommended` asserts new insight audits (cls-culprits,
  network-dependency-tree, image-delivery) at minScore 0.9. CSP forbids
  render-blocking inline styles and stylelint rejects the CSS as `.css`, so
  styles must be JS-applied; the minor FOUC (CLS 0.02) fails cls-culprits.
- Recompressing/resizing the animated portrait can reduce `image-delivery`, but
  acceptable versions do not clear the audit; lower settings visibly degrade it.

## Harness improvement notes

- The CSP check + token-strict stylelint together make render-blocking styles
  impossible for hand-authored CSS; consider a stylelint carve-out for a
  critical-CSS file, or relax `lighthouse:recommended` insight assertions.
- `csp.test.ts` should assert on ALL pages (aggregate), not throw on the first,
  so agents see every offender in one run.
- b7dcc00 landed harness files that fail the harness's own format and sast
  checks; a pre-merge run of `pnpm gate` on harness changes would catch this.
