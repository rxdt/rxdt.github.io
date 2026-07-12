# Agent Rules

- Follow root `PROMPT.md` each iteration. It is the standing instruction.
- Specs in `docs/specs/` define the work; pick the most important unfinished item.
- Never edit forbidden paths: `harness/`, `.githooks/`, `.github/`, `AGENTS.md`,
  `PROMPT.md`, `docs/plan.md`, any `package.json`, lockfiles, tool configs.
  Full list: `harness/gate-data.ts`.
- Run `pnpm gate` before pushing; fix failures without weakening checks.
- Commit message format is defined in `PROMPT.md`.
