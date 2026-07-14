# Project Status

> Current truth of the repo. Keep it short and current < 100 lines.

## Current Focus

- Active spec: `docs/specs/frontend.md`
- Active milestones: plan milestones 1, 2, 4, 5, and 6.

## Current State

- Frontend spec is filled from `docs/plan.md`.
- Homepage uses tracked/local optimized assets only: the hero portrait uses
  animated `merged.webp`, and project thumbnails no longer depend on ignored
  PNGs.
- Homepage and three writeup routes have Playwright coverage for HTTP 200,
  headings, expected links, and same-origin asset failures.
- Homepage now has Playwright coverage for plan-required media: animated
  portrait, Comfyday sample video loop/autoplay properties, and Inference
  Conference PNG.
- Article HTML now has language/charset fixes, no inline styles, and no
  repeated unnamed aside landmarks.
- Page styles and homepage behavior are inline runtime scripts that use
  constructable stylesheets, keeping HTML free of inline `<style>` blocks and
  avoiding production render-blocking requests.
- Comfyday sample video and Inference Conference PNG are compressed for the
  production Lighthouse budget.
- Manual owner visual approval and deployment are still pending.

## Checks

- `pnpm --prefix frontend test:e2e`: PASS, 42 tests.
- `pnpm preflight`: PASS.
- `harness/node_modules/.bin/lhci autorun --config harness/lighthouserc.cjs`:
  PASS after `pnpm --dir frontend run build`.
- `pnpm gate`: FAIL in coverage only; e2e and Lighthouse pass.

## Next

1. Human or harness owner resolves forbidden harness/package/config/doc-plan
   mismatches failing harness coverage tests.
2. Re-run `pnpm gate`.
3. Owner reviews the site visually and deploys when satisfied.

## Changelog

- 0001-codex 1/1: Replaced placeholder frontend spec/status, removed homepage
  reliance on missing or ignored project images, added static WebP portrait,
  expanded Playwright route/asset coverage, and fixed frontend HTML/lint.
- 0001-codex 1/1: Added media-contract e2e coverage, switched the portrait to
  `merged.gif`, rendered `inference-conference.png`, and moved inline frontend
  styles/scripts to external scripts.
- 0005-codex 1/1: Optimized production media, replaced `merged.gif` with
  animated `merged.webp`, inlined runtime scripts under CSP, and cleared
  frontend preflight/e2e/Lighthouse.

## Blockers (verify before fully trusting these items)

- Full gate coverage fails in forbidden harness-owned tests: missing
  `docs/PROMPT.md` in harness temp loops, forbidden file set missing
  `docs/plan.md`, cruise command scope, root package script menu, app tsconfig
  include set, and vitest coverage include set.
