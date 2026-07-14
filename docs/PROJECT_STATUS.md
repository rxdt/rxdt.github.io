# Project Status

> Current truth of the repo. Keep it short and current < 100 lines.

## Current Focus

- Active spec: `docs/specs/frontend.md`
- Active milestones: plan milestones 1, 2, 4, 5, and 6.

## Current State

- Frontend spec is filled from `docs/plan.md`.
- Homepage uses tracked/local assets only: the hero portrait uses `merged.gif`,
  and project thumbnails no longer depend on ignored PNGs.
- Homepage and three writeup routes have Playwright coverage for HTTP 200,
  headings, expected links, and same-origin asset failures.
- Homepage now has Playwright coverage for plan-required media: animated
  portrait, Comfyday sample video loop/autoplay properties, and Inference
  Conference PNG.
- Article HTML now has language/charset fixes, no inline styles, and no
  repeated unnamed aside landmarks.
- Page styles and homepage behavior are loaded from external frontend scripts,
  keeping HTML free of inline `<style>` blocks.
- Manual owner visual approval and deployment are still pending.

## Checks

- `pnpm --prefix frontend test:e2e`: PASS, 36 tests.
- `pnpm preflight`: FAIL in `html-validate`; format, eslint, and style pass.
- `pnpm gate`: NOT RUN because `pnpm preflight` did not pass.

## Next

1. Human or harness owner resolves undefined `html-validate` rule
   `no-inline-script`.
2. Re-run `pnpm preflight`; if it passes, run `pnpm gate`.
3. Owner reviews the site visually and deploys when satisfied.

## Changelog

- 0001-codex 1/1: Replaced placeholder frontend spec/status, removed homepage
  reliance on missing or ignored project images, added static WebP portrait,
  expanded Playwright route/asset coverage, and fixed frontend HTML/lint.
- 0001-codex 1/1: Added media-contract e2e coverage, switched the portrait to
  `merged.gif`, rendered `inference-conference.png`, and moved inline frontend
  styles/scripts to external scripts.

## Blockers (verify before fully trusting these items)

- No explicit agent id was exposed in environment; `0001-codex` is used for
  traceability.
- Pre-existing forbidden `harness/cli.ts` edit remains untouched.
- `pnpm preflight` fails because harness `html-validate` config references
  undefined rule `no-inline-script`.
