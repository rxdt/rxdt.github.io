Code will go in `frontend/`

## Objective

Finish styling and hardening of a static Github site personal website for the owner. This repo should be an exemplary case of using the harness within it.

## Features and functionality

- [ ] Owner has a fully functioning personal website which is deployable to Github sites.
- [ ] Harness rules are enforced and implemented or documented as blockers.
- [ ] The site has a main page and a few links to blog-like pages
- [ ] All links to external sites work as expected
- [ ] Visual checks are made on the browser for different devices
- [ ] The site is responsive
- [ ] The site is accessible
- [ ] The video for "Comfyday" `frontend/public/assets/comfyday-sample.mp4`starts and auto-plays on loop
- [ ] The portrait `merged.svg` plays on loop
- [ ] `frontend/public/assets/inference-conference.png` is used for the "Inference Conference" div
- [ ] `frontend/public/assets/caclulator.png` is the image for `AI Deployment Calculator` div
- [ ] the image for 'LoopGate Harness' is fully visible and not cut off

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

## Milestones

- [ ] HTML errors are fixed from ~60 to zero
- [ ] All lint checks pass
- [ ] Tests are written to cover code 100%
- [ ] Lighthouse and Playwright pass 100%
- [ ] All checks pass
- [ ] All work in `frontend/specs` is complete
- [ ] The owner verifies manually the site 'looks' right locally
- [ ] The owner deploys the app to the site

## Out of Scope

Creating a backend app
