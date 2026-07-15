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
- The LoopGate Harness tile now renders the square `py-ralph-frame.svg` with
  `object-fit: contain` (was `cover`, which cropped ~125px top/bottom in the
  wide card), so the full frame is visible per plan requirement.
- Browser coverage loads the homepage and writeups end to end, checks route
  status/headings/assets/CSP-applied styles, and now preserves the exact
  external destination set for public project, profile, and article links.

## Checks

- `pnpm preflight`: PASS (format, eslint, style, html) — 0 issues.
- `pnpm gate`: FAIL on forbidden `sast` plus strict Lighthouse insights. All
  frontend structural checks pass: typecheck, cruise, deadcode, spelling, build,
  coverage, e2e.
  - `coverage` (incl. `csp.test.ts`): PASS — was the blocker, now green.
  - `e2e`: PASS, 90 tests across 6 device projects.
  - `sast`: FAIL — 2 semgrep findings, both in forbidden `harness/csp.test.ts`.
  - `lighthouse`: FAIL — cls-culprits (whole `<body>` shifts once, score 1),
    image-delivery (`merged.webp`, ~15 KiB), network-dependency-tree (critical
    chain HTML -> Vite `index-*.js` + `modulepreload-polyfill`).

## Next

1. Human fixes or approves the forbidden `harness/csp.test.ts` semgrep blocker
   (this alone keeps `gate` red regardless of any frontend work).
2. Owner decides on the cls-culprits fix: it is NOT harness-blocked — an
   external `<link rel="stylesheet">` is CSP-compliant and lintable, and would
   remove the FOUC. The cost is rewriting ~536 lines of home CSS to satisfy the
   token-strict stylelint config, an unverifiable visual-regression risk on an
   already-approved design. See Blockers.
3. Owner reviews the site visually and deploys when satisfied.

## Changelog

- 0002-claude 1/1: Fixed the cropped LoopGate Harness tile (`object-fit:
  contain`), added e2e proving the full frame renders, and corrected the
  Lighthouse blocker notes (cls-culprits is frontend-fixable, not harness-owned).
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

## Blockers

- HARNESS-OWNED: `harness/csp.test.ts` error string `... inline <script>
  body/bodies ...` trips semgrep `unknown-value-with-script-tag` -> `sast`
  fails. Loop cannot edit `harness/`. Needs a semgrep-safe rewrite or
  allow-comment. This alone keeps `gate` red no matter what the loop does.
- OWNER-DECISION (not harness-blocked): `lighthouse:recommended` fails three
  insights at minScore 0.9.
  - cls-culprits: the JS-adopted stylesheet applies after first paint, so the
    `<body>` shifts once. Fixable in frontend with an external
    `<link rel="stylesheet">` (CSP `style-src 'self'` allows same-origin CSS;
    the file would be stylelint-linted). Cost: rewrite ~536 lines of home CSS to
    the token-strict config; some effects (1px grid gradient, `vmax`) have no
    compliant equivalent and would change. Unverifiable visual risk -> owner call.
  - network-dependency-tree: critical chain is HTML -> Vite `index-*.js` +
    `modulepreload-polyfill`. A `<link>` CSS may or may not clear it.
  - image-delivery: `merged.webp` shows ~15 KiB savings; prior loops confirmed
    acceptable recompression does not clear the audit without visible loss.

## Harness improvement notes

- The token-strict stylelint config makes hand-authored CSS very painful (px
  banned, background/-image cannot contain px/rem/em lengths, `vmax` disallowed),
  which pushed styles into JS and caused the cls-culprits FOUC. Consider a
  stylelint carve-out for a critical-CSS file, or relaxing the strict insight
  assertions in `lighthouse:recommended`.
- `csp.test.ts` should assert on ALL pages (aggregate), not throw on the first,
  so agents see every offender in one run.
- b7dcc00 landed harness files that fail the harness's own format and sast
  checks; a pre-merge run of `pnpm gate` on harness changes would catch this.
