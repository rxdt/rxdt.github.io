Code will go in `frontend/`

## Objective

Finish styling and hardening of a static Github site personal website for the owner. This repo should be an exemplary case of using the harness within it.

## Features and functionality

- [x] Harness rules are enforced and implemented or documented as blockers.
- [x] The site is responsive
- [x] The site is accessible

## Approach

Get the gate green.

1. Fill out `docs/specs/frontend.md`
2. Fill out `docs/PROJECT_STATUS.md`
3. Consistently keep each `*.md` file in `docs/` <= 100 lines
4. Run each check individually
5. Try to get `pnpm preflight` passing
6. Add tests where tests are expected for 100% coverage
7. Do NOT touch `harness` logic or ANY config files
8. Try to get `pnpm gate` passing
9. Notify the owner in `docs/PROJECT_STATUS.md`
   1. of all blockers
   2. if there are excess dead files that need to be deleted
   3. when the gate is green
   4. when you think the app is ready to deploy.
   5. of any issues you notice with the harness itself even if non-blocking
   6. of improvements you recommend for a more efficient harness
   7. of what should change to make agents more efficient in loops
