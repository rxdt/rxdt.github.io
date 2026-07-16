# Project Status

> Current truth of the repo. Keep it short and current < 100 lines.

## Current Focus

- Site is LIVE at https://rxdt.dev/ (GitHub Pages via the ci.yml `deploy` job).
- Active spec: `docs/specs/frontend.md`
- Current round: SEO hardening, design-system unification, prose cleanup.

## Current State

- Deployed: CI on main is green end to end (checks -> deploy). The gate's `sast`
  check requires semgrep; ci.yml installs it with `pip install semgrep`. The
  `audit` check passes via pnpm-workspace.yaml `overrides` forcing patched
  transitive dev deps (tmp, uuid, fast-json-patch, @opentelemetry/core).
- The legacy GitHub "pages build and deployment" Jekyll workflow is still
  ACTIVE (dynamic workflow, no file in-repo). If ci.yml's deploy is skipped it
  can overwrite the site with a Jekyll-rendered README. Owner should disable it
  (Actions tab, or `gh workflow disable 309717422`).
- SEO: every page has title, meta description, canonical, OG/twitter tags,
  favicon, JSON-LD (Person + WebApplication on home; Article on all three
  writeups). All three writeups are SELF-canonical and in sitemap.xml. The
  dev.to cross-posts must have their `canonical_url` set to the rxdt.dev URLs
  (owner action, dev.to editor) or the copies compete in search.
- Author identity: visible bylines say "By Rox dT". The full legal name appears
  ONLY inside JSON-LD (machine-readable). Never render it in visible copy.
- Design: `DESIGN.md` (repo root, designmd-lint clean) is extracted from the
  homepage system. All three writeups now use it: dark-only violet/amber over
  near-black, Inter, glass panels. The old cream-serif "journal" theme is gone.
- Prose style: no em-dashes, no semicolons in article prose (commas, "and", or
  sentence splits). Quoted/stylized material (rulebook quote-bullets, quote
  attribution) keeps its original punctuation.
- conference.html: three verbatim CONFERENCE.json excerpts fill former
  margin-empty slots (styled `pre.margin-json` code cards, each citing its
  JSON path).

## Checks

- `pnpm preflight`: PASS - 0 issues.
- `pnpm gate`: PASS - 0 issues. All 18 checks green (format, eslint, style,
  html, typecheck, harnessTypes, schema, cruise, deadcode, spelling, workflow,
  sast, secrets, audit, build, coverage, e2e, lighthouse).

## Next

1. Owner pushes main (5 gated commits pending), then sets `canonical_url` on
   both dev.to posts to the rxdt.dev URLs.
2. Owner disables the legacy Jekyll pages-build-deployment workflow.
3. Optional: og:image assets are square/small (merged.webp 480x480,
   inference-conference.png 378x252); ideal social-card size is 1200x630.
   The pixel-mosaic look is intentional brand art; owner decides.
4. Dead file: `frontend/public/assets/portrait.webp` is unreferenced; owner
   can delete.

## Changelog

- 0005 (this round): CI fixed (semgrep install, audit overrides) and site
  deployed to rxdt.dev. SEO pass (meta/OG/canonical/JSON-LD/sitemap on all
  pages, internal link mesh between home/writeups/calculator/GitHub).
  Writeups self-canonicalized. DESIGN.md extracted; writeups rethemed to the
  homepage system. Margin h3 pull-quotes demoted to p.margin-quote (heading
  outline fix). Em-dashes/semicolons removed from prose. CONFERENCE.json
  receipts added to conference.html margins.
- 0004-claude 2/2: e2e contract for the `404.html` GitHub Pages fallback.
- 0002-claude 1/2: merged.webp portrait replaced by SMIL-animated merged.svg,
  clearing the last Lighthouse image-delivery red; e2e loop contract added.
- 0001-claude: `defer` + `<body hidden>` broke the cls vs
  network-dependency-tree deadlock; homepage Vite bundle dropped.
- earlier loops: axe WCAG A/AA e2e; LoopGate tile uncropped; calculator links
  to `vram.rxdt.dev`; CSP-safe externalized styling; optimized media.

## Blockers

- None blocking the gate. Human-owned: push + dev.to canonical_url updates +
  disabling the legacy Jekyll workflow.

## Harness improvement notes

- The gate loads its check registry from harness/package.json scripts at
  import time; deleting a script a check references crashes preflight/gate
  with "no harness script named X". Working as designed, but the error should
  name the fix (restore the script or remove the check name).
- semgrep is the only check tool that is not an npm devDependency; any CI or
  fresh machine must install it out-of-band or the gate fails on `sast`.
