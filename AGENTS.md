# Agent Rules

- Never edit forbidden paths: `harness/`, `.githooks/`, `.github/`, `AGENTS.md`,
  `PROMPT.md`, `docs/plan.md`, any `package.json`, lockfiles, tool configs.
  Full list: `harness/gate-data.ts`.
- Fix failures without weakening checks.
