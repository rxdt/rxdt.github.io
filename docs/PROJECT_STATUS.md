# Project Status

> Current truth of the repo. Keep it short and current < 100 lines.

## Current Focus

- Active spec: `docs/specs/frontend.md`
- Active milestones: plan milestones 1, 2, 4, 5, and 6.

## Current State

- Styles/behavior are external same-origin files (no inline `<script>`/`<style>`,
  zero CSP violations). The homepage sheet loads as a render-blocking classic
  `<script>` in `<head>` (`public/scripts/home-styles.js`) so it applies before
  first paint — this fixed the Lighthouse cls-culprits body shift (CLS 1.0 -> 0).
  Writeup pages keep deferred style modules.
- The AI Deployment Calculator tile uses the plan-named
  `frontend/public/assets/caclulator.png`; homepage links, calculator writeup
  links, `llms.txt`, and WebApplication structured data now use
  `https://vram.rxdt.dev/`.
- The LoopGate Harness tile now renders the square `py-ralph-frame.svg` with
  `object-fit: contain` (was `cover`, which cropped ~125px top/bottom in the
  wide card), so the full frame is visible per plan requirement.
- Browser coverage loads the homepage and writeups end to end, checks route
  status/headings/assets/CSP-applied styles, and preserves the exact external
  destination set for public project, profile, and article links.
- Automated axe-core WCAG A/AA scans now run on every route in light and dark
  themes across all device projects. They found and fixed real bugs that the
  homepage-only Lighthouse a11y pass missed: low-contrast writeup byline
  (`--faint`) and stamp chips (`--stamp-soft`), plus the conference results
  table, which is now a keyboard-focusable named `<section>` scroll region.

## Checks

- `pnpm preflight`: PASS (format, eslint, style, html) — 0 issues.
- `pnpm gate`: FAIL on Lighthouse only. Every other check passed (format, lint,
  typecheck, harnessTypes, schema, cruise, deadcode, spelling, workflow, sast,
  secrets, audit, build, coverage, e2e) in the current dirty harness worktree.
  - `e2e`: PASS, all device projects (added a homepage render-blocking-style test).
  - `lighthouse`: FAIL on 2 error insights — image-delivery (0) and
    network-dependency-tree (0). cls-culprits/CLS now PASS; render-blocking is
    a non-blocking warning.

## Next

1. Owner decides the two remaining Lighthouse errors (see Blockers): accept
   ~21 KiB `merged.webp` recompression (visible quality loss) for image-delivery,
   and whether network-dependency-tree is worth chasing under the pinned CSP.
2. Owner reviews the site visually and deploys when satisfied.
3. Human reviews pre-existing forbidden `harness/` worktree edits; this loop
   left them unstaged.
4. Dead file: `frontend/public/assets/portrait.webp` is unreferenced (the
   homepage portrait uses `merged.webp`); owner can delete it.

## Changelog

- 0004-claude 1/1: Fixed the Lighthouse cls-culprits FOUC by loading the homepage
  style sheet as a render-blocking classic `<script>` in `<head>` (moved to
  `public/scripts/`); applies before first paint, zero visual change, e2e proves
  it. cls-culprits/CLS now pass; gate red only on image-delivery + network-tree.
- 0003-claude 1/1: Added axe-core WCAG A/AA e2e scans (every route, light+dark,
  all device projects) and fixed the contrast + scrollable-table violations they
  surfaced on the writeup pages. Gate still red only on Lighthouse (unchanged).
- 0002-claude 1/1: Fixed the cropped LoopGate Harness tile (`object-fit:
  contain`), added e2e proving the full frame renders, and corrected the
  Lighthouse blocker notes (cls-culprits is frontend-fixable, not harness-owned).
- 0003-codex 1/1: Migrated calculator links and WebApplication structured data
  to `https://vram.rxdt.dev/`; e2e and preflight pass, gate reaches Lighthouse.
- 0002-codex 1/1: Replaced the calculator project text placeholder with the
  required PNG thumbnail, optimized it to avoid new Lighthouse image findings,
  and added e2e coverage that asserts the asset decodes.
- 0001-claude 1/1: Externalized inline CSS/behavior into `frontend/scripts/*`
  modules to satisfy the harness CSP check; added e2e proving external styles
  apply under CSP; coverage and e2e now pass.
- 0005-codex 1/1: Optimized production media, replaced `merged.gif` with
  animated `merged.webp`, and cleared frontend preflight/e2e/Lighthouse.

## Blockers

- OWNER-DECISION: `lighthouse:recommended` fails two error insights at minScore
  0.9 (cls-culprits is now fixed):
  - image-delivery: `merged.webp` (animated, 480x480) shows ~21 KiB savings only
    via heavier compression; prior loops confirmed this degrades the animation.
  - network-dependency-tree: critical chain is HTML -> `home-styles.js` +
    Vite `index-*.js`/`modulepreload-polyfill` (78ms). Inherent to external
    scripts under the pinned CSP; no cheap fix found.

## Harness improvement notes

- The pinned CSP (`style-src 'self'`, no inline/nonce) + token-strict stylelint
  make it impossible to pass BOTH cls-culprits and render-blocking-resources:
  FOUC-free styling must be render-blocking (now a classic script; a `.css`
  `<link>` behaves the same), and inline critical CSS is CSP-banned. Consider a
  stylelint carve-out for a critical-CSS file or relaxing those insight asserts.
- `csp.test.ts` should assert on ALL pages (aggregate), not throw on the first,
  so agents see every offender in one run.
- b7dcc00 landed harness files that fail the harness's own format and sast
  checks; a pre-merge run of `pnpm gate` on harness changes would catch this.
