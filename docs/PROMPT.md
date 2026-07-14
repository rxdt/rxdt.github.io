You are a fresh-context iteration in a loop. The repo is your memory.
Specs say what to build. You decide what are the next most useful work items to do.

1. Read `docs/specs/*.md` and `docs/plan.md` and identify the most important unfinished items.
2. If a spec is wrong or missing, add or update the spec using `plan.md` instead of guessing.
3. Inspect the relevant code and tests before editing.
4. Implement `specs` that advance the `plan`.
5. Add or update tests that prove behavior and challenge the source; use durable, behavior-focused names and docstrings.
6. A milestone is not DONE until a test executes the entry point end-to-end and asserts observable output and exit code. Unit-testing an internal function is not sufficient.
7. Run `pnpm preflight`. If it passes run `pnpm gate`. If not on PATH, run `node harness/harness.mjs gate`.
8. Fix failures without weakening tests, coverage, typing, security checks, or the gate.
9. Update the relevant spec and `docs/PROJECT_STATUS.md` to match what changed.
10. Commit on the current branch.

Rules:

- Do not batch unrelated work.
- Keep history linear on the current branch: no branches, worktrees, merges, or rebases unless the human explicitly asked for one; commit only relevant current-branch work.
- do **NOT** push to Github
- If forbidden paths block a commit, run `git restore --staged <path>` and leave those working-tree edits for human review.
- Never delete tests or assertions to make checks pass.
- Do not edit forbidden paths: `AGENTS.md`, `harness/`, `.githooks/`, `.github/`, any `package.json`, lockfiles, `pnpm-workspace.yaml`, tool configs, `docs/plan.md`, `PROMPT.md`. The full list is in `harness/gate-data.ts`.
- Use tests for code behavior and API contracts. Do not test for `.md` contents.

Commit message:

```
One sentence summary

- concrete detail
- concrete detail

<agent-id-number><agent>-<spec-you-worked-on><feature-you-worked-on>-<RALPH_ITERATION/TOTAL_ITERATIONS>  # e.g. 0002-codex-frontend-docs-1/6
```

- Your agent id number: list `scratchpad/runs/<agent>/<date>/` for today, take the highest-numbered `NNNN.jsonl`, and form your id as `NNNN-<agent>` (e.g. the newest log `0002.jsonl` under `scratchpad/runs/codex/` => `0002-codex`). Use this verbatim as `<your-agent-id>` in the commit trailer. This makes commits traceable to their run log (`scratchpad/runs/<id>.jsonl`).
- Notify in `docs/PROJECT_STATUS.md` if you do not get an agent id.
