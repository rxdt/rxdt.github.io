# Project Status

> Current truth of the repo. Keep it short and current < 100 lines.

## Current Focus

- Active spec: `docs/specs/frontend.md`
- Active milestones: plan milestones 1, 2, 4, 5, and 6.

## Current State

- Frontend spec is filled from `docs/plan.md`.
- Homepage uses tracked/local assets only: the animated GIF is no longer the
  hero image, and project thumbnails no longer depend on ignored PNGs.
- Homepage and three writeup routes have Playwright coverage for HTTP 200,
  headings, expected links, and same-origin asset failures.
- Article HTML now has language/charset fixes, no inline styles, and no
  repeated unnamed aside landmarks.
- Manual owner visual approval and deployment are still pending.

## Checks

- `pnpm --prefix frontend test:e2e`: PASS, 30 tests.
- `pnpm preflight`: PASS, 0 issues.
- `pnpm gate`: FAIL on forbidden harness/config scope, not frontend checks.
- Gate frontend checks reached PASS for format, eslint, style, html,
  audit, build, e2e, and Lighthouse.

## Next

1. Human or harness owner resolves forbidden-path gate failures.
2. Re-run `pnpm gate` after harness/config blockers are resolved.
3. Owner reviews the site visually and deploys when satisfied.

## Changelog

- 0001-codex 1/1: Replaced placeholder frontend spec/status, removed homepage
  reliance on missing or ignored project images, added static WebP portrait,
  expanded Playwright route/asset coverage, and fixed frontend HTML/lint.

## Blockers (verify before fully trusting these items)

- No explicit agent id was exposed in environment; run log path indicates
  `0001-codex`, used for traceability.
- Pre-existing forbidden `harness/cli.ts` and `harness/ralph.sh` edits remain
  untouched.
- `pnpm gate` typecheck fails in `harness/gate.test.ts` exact optional typing.
- `pnpm gate` coverage fails in harness tests expecting `docs/PROMPT.md`,
  cruise frontend scoping, app tsconfig frontend includes, and frontend coverage
  include settings.
