# Frontend Spec

Build `frontend/` into a static personal GitHub Pages site for Rox dT that can
survive the harness gate and manual visual review.

## Scope

- Static HTML/CSS/JS in `frontend/`; no backend.
- Homepage with owner identity, project links, contact links, and blog-like
  writeup pages.
- Public assets under `frontend/public/` must resolve locally during browser
  tests.
- Use Playwright for entry-point behavior, route status, responsive rendering,
  accessibility-facing selectors, and observable page output.
- The harness CSP (`script-src 'self'; style-src 'self'`) forbids inline
  `<script>`/`<style>`, so styles/behavior ship as external same-origin files
  that adopt a constructable stylesheet (built HTML has no `<style>`/`style=`).
  Homepage scripts load `defer` with `<body hidden>` until the sheet is
  adopted, passing BOTH cls-culprits and network-dependency-tree. Writeups
  keep deferred style modules.

## Design system

- `DESIGN.md` (repo root) is the single source of the look, extracted from the
  homepage: dark-only violet/amber over near-black, Inter, glass panels. Every
  page, including writeups, must use its tokens. It must stay designmd-lint
  clean (`pnpm --prefix harness lint:design`).

## Content rules

- Visible bylines and copy say "Rox dT" (or "rox"/"rxdt"). The owner's full
  name may appear ONLY inside JSON-LD structured data, never in rendered text.
- Article prose uses no em-dashes and no semicolons (commas, "and"/"or", or
  sentence splits). Quoted or stylized material keeps original punctuation.
- Do not reword the owner's article prose beyond what an instructed edit
  requires.

## SEO

- Every page: unique title, meta description, canonical, OG + twitter:card,
  favicon, single h1, no heading-level skips.
- All three writeups are SELF-canonical on rxdt.dev and listed in
  `frontend/public/sitemap.xml` (only canonical URLs belong in the sitemap).
- JSON-LD: Person + WebApplication on the homepage; Article on each writeup.
- robots.txt allows all and names the sitemap; llms.txt stays current.

## Acceptance Criteria

- `pnpm preflight` and `pnpm gate` exit 0.
- Homepage and writeup routes return HTTP 200 in Playwright; same-origin
  `/assets/` requests do not 4xx/5xx.
- Pages preserve the expected external destination sets for public project,
  profile, and article links (`externalLinkContracts`).
- Homepage portrait is `merged.svg`, an infinitely looping animated SVG
  (asserted from served bytes); Comfyday video playback contract holds; the
  AI Deployment Calculator and Inference Conference tiles use their plan-named
  images.
- Responsive Playwright projects render all pages; every route passes axe-core
  WCAG A/AA in light and dark themes across all device projects.
- Every page's external style module applies with no CSP violation; the
  homepage stays `<body hidden>` until its deferred sheet applies.
- Calculator links and structured data use `https://vram.rxdt.dev/`.
- The `404.html` fallback returns 200 and meta-refreshes to the homepage.

## Out of Scope

- Backend services.
- GitHub deployment or pushing to GitHub.
- Harness or config changes.

## Blockers

- None blocking the gate. Human-owned: push, dev.to `canonical_url` updates,
  disabling the legacy Jekyll pages-build-deployment workflow.

## Changelog

- 0005: SEO pass (meta/OG/canonical/JSON-LD/sitemap everywhere, internal link
  mesh); writeups self-canonicalized; DESIGN.md extracted and writeups rethemed
  to the homepage system; margin h3 pull-quotes demoted to p.margin-quote;
  em-dashes/semicolons removed from prose; CONFERENCE.json receipts fill the
  conference article's empty margins.
- 0004-claude 2/2: e2e contract for the `404.html` fallback.
- 0002-claude 1/2: portrait swapped to SMIL-animated `merged.svg`, clearing the
  last Lighthouse image-delivery red; e2e loop contract added.
- 0001-claude: `defer` + `<body hidden>` broke the cls vs
  network-dependency-tree deadlock; homepage Vite bundle dropped.
- Prior loops: axe WCAG A/AA e2e; LoopGate tile uncropped; calculator links to
  `vram.rxdt.dev`; CSP-safe externalized styling; optimized media.
