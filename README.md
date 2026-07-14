## TL;DR: Getting Started

1. `git init` (the gate, hooks, and loop all shell out to git)
2. `pnpm setup` installs dependencies, merges harness scripts into the root `package.json`, sets `core.hooksPath` to `.githooks`

## Why frontend loops are harder

Backend loops can be judged with deterministic inputs and outputs. Frontend work adds a messier contract. The app must build, render, respond, fit, remain accessible, and keep doing that across viewports and loading paths. Not to mention it's gotta have ✨ taste ✨

That's why this harness is heavier than a plain TypeScript setup.

- TS, HTML, CSS, JSON format
- lint
- types
- architecture
- dead code
- security
- build
- unit coverage
- e2e Playwright
- Lighthouse must be 100
- preferences.ts checking for smells that an app is not responsive...
- etc.

They all cover different failure modes.

---

```sh
pnpm loop <agent> [max_iterations] [max_minutes]  # agent: claude/codex/agy/copilot
```

## A l∞ps Loop

The repo is the only memory. Each iteration is a fresh-context agent.

- `docs/specs/` say WHAT to build
- constant `PROMPT.md` tells the agent: read `docs/specs/`, review the code, build the most important unfinished thing
- agent builds
- agent commits
- every git commit passes the fast preflight (format, lint, plus loop containment for the agent)
- every git push runs the full gate: lint, types, build, security scans, tests, 100% coverage, e2e, Lighthouse
- the loop stops at `max_iterations`, a nonzero worker exit, or a timeout
- **The harness is worker-agnostic.** Any agent CLI that reads a prompt from stdin and can edit/commit works.
- Each run is logged to `scratchpad/runs/<agent>/<date>/NNNN.jsonl`

### The Gate: Tiered Checks

[`harness/gate-data.ts`](harness/gate-data.ts) holds `FORBIDDEN_DIRS`, `FORBIDDEN_FILES`, `FORBIDDEN_BASENAMES`, and `FORBIDDEN_PATTERNS`. [`harness/preferences.ts`](harness/preferences.ts) holds the human's style checks other tools can't catch. Humans own the harness (`harness/` is itself a forbidden path).

⚡ `pnpm preflight` (pre-commit) runs the four checks marked ⚡ below. When `RALPH_LOOP=1` it additionally runs, on staged files only: **containment** (un-stages forbidden paths/symlinks, fails on forbidden patterns — see below) and the **preference** AST checks (next section).

✅ `pnpm gate` (CI / pre-push) runs every check in [`FULL_CHECKS`](harness/gate-data.ts):

| Check          | Tool                                                                                                                                                                                                  | ⚡  |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --- |
| `format`       | `prettier --check` over `frontend/` + `harness/`                                                                                                                                                      | ⚡  |
| `eslint`       | `eslint --max-warnings=0` (typescript-eslint + unicorn, sonarjs, security, regexp, promise, import-x, jsdoc, n, no-only-tests)                                                                        | ⚡  |
| `style`        | `stylelint` over `frontend/**/*.css` (standard, strict-value, defensive-css, custom-media)                                                                                                            | ⚡  |
| `html`         | `html-validate` over all HTML                                                                                                                                                                         | ⚡  |
| `typecheck`    | `tsc` strict over app source (`harness/tsconfig.app.json`)                                                                                                                                            |     |
| `harnessTypes` | `tsc` strict over the harness itself (`harness/tsconfig.harness.json`)                                                                                                                                |     |
| `schema`       | `ajv` compiles `frontend/schemas/**/*.schema.json` (passes when the directory is absent)                                                                                                              |     |
| `cruise`       | `dependency-cruiser` architecture rules over `frontend`                                                                                                                                               |     |
| `deadcode`     | `knip` — unused files, exports, types, dependencies                                                                                                                                                   |     |
| `spelling`     | `cspell` (advisory: warns, never fails)                                                                                                                                                               |     |
| `workflow`     | `spectral` lints `.github/workflows/ci.yml`                                                                                                                                                           |     |
| `sast`         | `semgrep` p/typescript + p/javascript + p/security-audit (external tool: `brew install semgrep` — skipped when absent; the npm "semgrep" package is an empty name-reservation stub, don't install it) |     |
| `secrets`      | `secretlint`                                                                                                                                                                                          |     |
| `audit`        | `pnpm audit --audit-level high`                                                                                                                                                                       |     |
| `build`        | `vite build` (CSS/JS inlined into `index.html`)                                                                                                                                                       |     |
| `coverage`     | `vitest` with **hard 100%** line/branch/function coverage                                                                                                                                             |     |
| `e2e`          | `playwright` — 6 viewports, desktop + mobile, specs in `frontend/tests`                                                                                                                               |     |
| `lighthouse`   | `lhci` (Lighthouse) performance/a11y/best-practices/SEO against the built page                                                                                                                        |     |

Shipped for your tests, not separate gate checks: **`fast-check`** (property-based testing) and **`@axe-core/playwright`** (accessibility assertions for e2e specs) are devDependencies in both packages; **`jsdom`** provides the DOM for unit tests (opt-in per file with `// @vitest-environment jsdom`, as the seed test does). On pull requests, GitHub CI additionally runs **`dependency-review-action`** (fails on moderate+ vulnerabilities and license problems).

### Preferences: what the tools above can't check

[`harness/preferences.ts`](harness/preferences.ts) is where the human encodes rules none of the tools express. During loop preflight it walks the AST of every staged TypeScript file and fails the commit on:

- **DOM selector discipline** — `querySelector` / `querySelectorAll` / `closest` / `matches` must receive a string literal containing exactly one `data-*` attribute selector from the allowlist at the top of the file. Dynamic selectors, class/id selectors, compound selectors, and unlisted `data-*` hooks all fail. (No ESLint rule validates selector strings against a project allowlist.)
- **Layout-read ban** — no measuring the page from TypeScript: `getBoundingClientRect()`, element reads (`offsetWidth/Height/Top/Left`, `clientWidth/Height`, `scrollWidth/Height`), and viewport reads (`window.innerWidth/innerHeight`) are rejected. Layout belongs in CSS.

### Containment

When `RALPH_LOOP=1`, preflight un-stages any commit touching `harness/`, `.githooks/`, `.github/`, any `package.json`, lockfiles, tool configs, `AGENTS.md`, `docs/plan.md`, or `PROMPT.md` — and rejects escape hatches in staged content (`eslint-disable`, `ts-ignore`, `test.skip`, `.only(`, coverage-ignore pragmas, `--no-verify`, `hooksPath`, …). Full lists: [harness/gate-data.ts](harness/gate-data.ts).

## Layout

```
harness/        the gate, loop (ralph.sh), CLI, tool configs, custom user checks  (🤖 forbidden)
    gate.ts                  the gate engine: containment + check runner
    gate-data.ts             containment denylists + the check registry
    preferences.ts           user-defined AST checks not covered by tools
    *.test.ts                the harness's own tests
    eslint.config.js         eslint       — TS/JS lint bar
    stylelint.config.js      style        — CSS bar (scope: .stylelintignore)
    .htmlvalidate.json       html         — HTML bar
    .prettierignore          format       — prettier scope (rules: prettier defaults)
    tsconfig.app.json        typecheck    — strict flags for frontend source
    tsconfig.harness.json    harnessTypes — strict flags for the harness itself
    vite.config.ts           build + dev  — Vite root, inline-assets plugin
    vitest.config.js         coverage     — test discovery, hard 100% thresholds
    playwright.config.js     e2e          — 6 browser profiles, dev-server port
    lighthouserc.cjs         lighthouse   — perf/a11y/SEO budgets, preview port
    .dependency-cruiser.cjs  cruise       — architecture rules
    knip.json                deadcode     — unused files/exports/types
    cspell.json              spelling     — word allowlist (advisory)
    .spectral.yml            workflow     — CI-workflow lint rules
    .secretlintrc.json       secrets      — secret-scanning preset
.githooks/      pre-commit (preflight) / pre-push (gate) hooks                    (🤖 forbidden)
.github/        CI that re-runs the gate + PR dependency review                   (🤖 forbidden)
tsconfig.cruise.json  root shim for cruise (extends harness/tsconfig.app.json)    (🤖 forbidden)
pnpm-workspace.yaml   workspace members, allowed build scripts, version floors    (🤖 forbidden)
.htmlvalidateignore   scope of the html check (read from the scan root)           (🤖 forbidden)
AGENTS.md       rules for agents working in the repo                              (🤖 forbidden)
PROMPT.md       the standing per-iteration instruction                            (human maintained)
docs/plan.md    the human vision
docs/specs/     WHAT to build, one PRIORITY-bannered file per track
docs/PROJECT_STATUS.md  human-readable record, not authoritative
scratchpad/     scratch dir agents create and use for temp files + run logs       (🤖 for the bots)
frontend/       your product code: index.html, public/, src/, tests/ (e2e specs)
```

If an agent edits a forbidden file, the file will be un-staged (not allowed to commit). A forbidden pattern by an agent (e.g. `ts-ignore`) will also prevent their commit and force them to fix it.

## Why every check has its own config file

Deliberate design, not clutter:

- **Every gate command pins its config explicitly** (`--config`, `--ignore-path`, `-p` — see [`FULL_CHECKS`](harness/gate-data.ts)). Nothing relies on auto-discovery, so the file the gate names is provably the file that governs the check.
- **They all live in `harness/`, one forbidden directory.** A single containment rule protects the entire quality bar — thresholds, lint rules, coverage floors — from the agents it judges.
- **Placement doubles as defense.** Tools' own config discovery walks _up_ from the linted file; `harness/` is never on that path. If an agent drops a look-alike `eslint.config.js` at the repo root, the explicit `--config` still wins.
- **`package.json` is forbidden by basename everywhere** because scripts and dependencies define what the gate actually executes.
- **Binaries are pinned too**: checks run with `harness/node_modules/.bin` prepended to `PATH` ([gate.ts](harness/gate.ts) `checkEnvironment`), so an agent can't shadow a tool with its own executable.
- **Three root-level exceptions exist because the tools force them** — each is individually in `FORBIDDEN_FILES`: `tsconfig.cruise.json` (dependency-cruiser resolves tsconfig includes from its repo-root cwd), `pnpm-workspace.yaml` (pnpm requires it at the workspace root), and `.htmlvalidateignore` (html-validate only discovers ignore files from the scan root).

## Commands

```sh
pnpm setup      # install deps, merge root scripts, set core.hooksPath to .githooks
pnpm preflight  # fast checks: format, lint (plus loop containment)
pnpm gate       # full pass: see the table above
pnpm status     # render run/gate status
```

## Coordination

- Use `git log --oneline <branch>..HEAD` to show what's unpushed.
- Which doc does what:
  - **specs** = the product work
  - **`PROMPT.md`** = how to operate headlessly
  - **repo + green gate** = the source of truth
  - `docs/PROJECT_STATUS.md` is a human-readable record, not authoritative
