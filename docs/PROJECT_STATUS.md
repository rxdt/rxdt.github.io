# Project Status

> Current truth of the repo. Keep it short and current < 100 lines.

## Current Focus

- Active spec: `docs/specs/frontend.md`
- Active milestones: plan milestones 1, 2, 4, 5, and 6.

## Current State

- Styles/behavior are external same-origin files (no inline `<script>`/`<style>`,
  zero CSP violations). The homepage now loads `home-styles.js` + `home.js` with
  `defer` (non-render-blocking) and ships `<body hidden>`; `home-styles.js` adopts
  the sheet then unhides, so first paint is already styled. This passes BOTH
  cls-culprits (no shift) AND network-dependency-tree (empty critical chain) — the
  homepage no longer emits a Vite `index-*.js`/modulepreload bundle. Writeup pages
  keep deferred style modules.
- The AI Deployment Calculator tile uses the plan-named
  `frontend/public/assets/caclulator.png`, resized 420x308 -> 330x242 so
  image-delivery no longer flags it as oversized; homepage links, calculator
  writeup links, `llms.txt`, and WebApplication structured data use
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
  - `e2e`: PASS, all device projects (updated the homepage style test to the new
    hidden-until-styled mechanism).
  - `lighthouse`: FAIL on ONE error insight — image-delivery (0), from
    `merged.webp` only. network-dependency-tree and cls-culprits now PASS (score
    1 across all 3 runs); render-blocking is now not-applicable. perf/a11y = 1.0.

## Next

1. Owner decides the ONE remaining Lighthouse error (see Blockers): the animated
   `merged.webp` portrait fails image-delivery and can only pass with a quality
   tradeoff, a `<video>` swap, or a harness carve-out.
2. Owner reviews the site visually and deploys when satisfied. Note: the portrait
   currently renders 318x480 (non-square) because the `height` attribute defeats
   its `aspect-ratio: 1/1`; left as-is (design choice, and squaring it would only
   worsen image-delivery) — flag for the owner.
3. Human reviews pre-existing forbidden `harness/` worktree edits; this loop
   left them unstaged.
4. Dead file: `frontend/public/assets/portrait.webp` is unreferenced (the
   homepage portrait uses `merged.webp`); owner can delete it.

## Changelog

- 0001-claude 1/1: Broke the cls-culprits vs network-dependency-tree deadlock.
  Homepage scripts now load `defer` (non-render-blocking) with `<body hidden>`
  unhidden after the sheet is adopted; dropped the homepage Vite module bundle;
  resized `caclulator.png` out of image-delivery. Verified via a full gate run:
  netdep=1, cls=1, perf/a11y=1 across all 3 Lighthouse runs; gate red now ONLY on
  `merged.webp` image-delivery. Updated the homepage style e2e test accordingly.
- 0004-claude: (superseded) fixed cls via a render-blocking style script.
- 0003-claude: axe WCAG A/AA e2e fixing writeup contrast + scrollable table.
- 0002-claude: uncropped LoopGate tile (`object-fit: contain`) with e2e.
- codex + earlier claude loops: calculator links/data to `vram.rxdt.dev`; PNG
  thumbnail; optimized media, `merged.gif` -> `merged.webp`; externalized inline
  CSS/behavior for the CSP check.

## Blockers

- OWNER-DECISION: `lighthouse:recommended` fails ONE error insight at minScore
  0.9 — image-delivery, from the animated `merged.webp` portrait (~15.4 KiB >
  the 4096 B per-image threshold). The insight judges bytes-per-displayed-pixel,
  so a 40 KiB 10-frame animation shown at ~318x480 CSS on Lighthouse mobile
  always exceeds it (confirmed: gif2webp/img2webp re-encodes ≥ 40 KiB without
  visible loss; downscaling hurts desktop). Options: accept heavier compression
  (visible loss), swap the portrait to a `<video>` (not image-flagged), or carve
  the insight out of the harness. network-dependency-tree is now GREEN.

## Harness improvement notes

- CORRECTION to a prior note: passing BOTH cls-culprits and network-dependency-
  tree under the pinned CSP IS possible without inlining — ship `<body hidden>`
  and reveal it from a `defer` (non-render-blocking) script after the sheet is
  adopted. No render-blocking node, no shift. (The old note claimed this was
  impossible.)
- image-delivery penalizes any animated raster portrait regardless of encoding
  effort (per-displayed-pixel heuristic). If an animated portrait is intended,
  consider a harness carve-out for it, or expect a `<video>`.
- b7dcc00 landed harness files that fail the harness's own format and sast
  checks; a pre-merge run of `pnpm gate` on harness changes would catch this.
