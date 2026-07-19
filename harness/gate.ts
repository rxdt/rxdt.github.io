// The gate engine: git/spawn/containment logic for preflight and gate checks.
//
// 1) runPreflight: fast pre-commit checks plus agent containment.
// 2) runGate: full pre-push gate; mirrors what runs on GitHub.

import { spawnSync, type SpawnSyncReturns } from "node:child_process";
import path from "node:path";

import {
  COMMIT_CHECKS,
  FORBIDDEN_BASENAMES,
  FORBIDDEN_DIRS,
  FORBIDDEN_FILES,
  FORBIDDEN_PATTERNS,
  FULL_CHECKS,
} from "./gate-data.js";
import { preferencesViolations } from "./preferences.js";

// Re-export the static data so consumers import everything gate-related from ./gate.js.
export {
  checkCommand,
  COMMIT_CHECK_NAMES,
  COMMIT_CHECKS,
  FORBIDDEN_BASENAMES,
  FORBIDDEN_DIRS,
  FORBIDDEN_FILES,
  FORBIDDEN_PATTERNS,
  FULL_CHECK_NAMES,
  FULL_CHECKS,
  scriptsMap,
  tokenizeCommand,
} from "./gate-data.js";

// Preflight fast checks must fail fast if they hang; the full gate has no timeout because its
// heavy checks (browser, build, coverage, networked audits) legitimately run for a long time.
const PREFLIGHT_TIMEOUT_MS = 30_000;

// Env vars that inject code into Node/npm subprocesses. `NODE_OPTIONS=--require ./evil.js` (and
// the npm-prefixed variants) run attacker code inside the very tools that judge the diff, with no
// trace in the repo. Stripped alongside GIT_* so neither Git calls nor checks can be redirected.
const UNSAFE_ENV_KEYS = new Set([
  "NODE_OPTIONS",
  "NODE_REPL_EXTERNAL_MODULE",
  "npm_config_node_options",
]);
const UNSAFE_ENV_PREFIXES = ["GIT_"];

// process.env minus GIT_* and code-injection vars, so a poisoned env can't redirect our Git calls
// or run arbitrary code inside the checks. PATH/HOME/NODE_* the toolchain needs are preserved.
/**
Build the environment for Git calls: process.env with the code-injection keys and every GIT_* variable removed.
@returns The filtered environment, safe to pass to Git subprocesses.
*/
export function gitSafeEnvironment(): NodeJS.ProcessEnv {
  return Object.fromEntries(
    Object.entries(process.env).filter(
      ([key]) =>
        !UNSAFE_ENV_KEYS.has(key) &&
        UNSAFE_ENV_PREFIXES.every((prefix) => !key.startsWith(prefix)),
    ),
  );
}

// Check environment: the safe env plus the harness's own binary dir on PATH, so checks invoke
// their tools by bare name (`eslint`, `prettier`, …) instead of a hard-coded path. This mirrors
// what `pnpm run` does and resolves the tools wherever pnpm links them, while external tools
// (semgrep, osv-scanner, pnpm) still resolve from the machine's own PATH.
/**
Build the environment for check subprocesses: the safe Git env with the harness's node_modules/.bin prepended to PATH.
@param repo - Repository root; its harness/node_modules/.bin is added to PATH.
@returns The environment used to spawn each check.
*/
function checkEnvironment(repo: string): NodeJS.ProcessEnv {
  const environment = gitSafeEnvironment();
  const binDirectory = path.join(repo, "harness", "node_modules", ".bin");
  environment.PATH = `${binDirectory}${path.delimiter}${environment.PATH ?? ""}`;
  return environment;
}

// Run a Git command in the repo and return its stdout.
/**
Run a Git command in the repo and return its stdout, throwing if Git exits non-zero.
@param repo - Repository root, passed to Git via -C.
@param args - Git arguments following the -C flag.
@returns The command's stdout.
*/
export function runGit(repo: string, args: string[]): string {
  const result = spawnSync("git", ["-C", repo, ...args], {
    encoding: "utf8",
    env: gitSafeEnvironment(),
  });
  if (result.status !== 0) {
    throw new Error(`git ${args.join(" ")} failed: ${result.stderr}`);
  }
  return result.stdout;
}

// Per-run invariants shared by every check in a runChecks pass.
interface CheckContext {
  repo: string;
  environment: NodeJS.ProcessEnv;
  timeoutMs: number;
}

// A missing tool is a spawn ENOENT (error.code "ENOENT"). Every check tool is a pinned harness
// devDependency, so on a correctly-installed repo they are all present. A missing one therefore
// means a broken install, not an optional extra — so it FAILS the gate (matching Semgrep/Lighthouse
// CI, which fail on a missing tool/environment). Silent skips would let a check quietly not run.
/**
Report whether a spawn failed because the tool binary was missing (ENOENT).
@param result - The spawnSync return value to inspect.
@returns True when the spawn error code is "ENOENT".
*/
function isToolMissing(result: SpawnSyncReturns<string>): boolean {
  const code =
    result.error !== undefined && "code" in result.error
      ? result.error.code
      : undefined;
  return code === "ENOENT";
}

// Failure detail from a non-passing spawn; empty output falls back to the command. stdout/stderr
// are typed string but are undefined at runtime on ENOENT, so coalesce each.
/**
Build failure detail from a non-passing spawn: joined stdout/stderr/signal plus any error, falling back to the command line when the output is empty.
@param result - The spawnSync return value describing the failure.
@param command - The command tokens, used as the fallback message.
@returns The failure detail string.
*/
function describeFailure(
  result: SpawnSyncReturns<string>,
  command: readonly string[],
): string {
  const error = result.error === undefined ? "" : String(result.error);
  const parts = [result.stdout, result.stderr, result.signal].map(
    (part) => part ?? "",
  );
  const output = `${parts.join("")}${error}`;
  return output.length > 0 ? output : command.join(" ");
}

/**
Run one named check command and report its outcome. Spawns the command in the repo, logs start/finish to stderr, and returns undefined on success.
@param context - Shared run invariants: repo, environment, and per-check timeout.
@param name - Human-readable check name used in log and failure messages.
@param command - The executable and its arguments to run.
@returns A failure message, or undefined when the check passes.
*/
function runOneCheck(
  context: CheckContext,
  name: string,
  command: readonly string[],
): string | undefined {
  const [executable, ...rest] = command;
  if (executable === undefined || executable.length === 0) {
    return `${name} failed:\nempty command`;
  }
  const started = Date.now();
  process.stderr.write(`gate: starting ${name}: ${command.join(" ")}\n`);
  const result = spawnSync(executable, rest, {
    cwd: context.repo,
    encoding: "utf8",
    env: context.environment,
    // 0 => undefined => no timeout: the full gate must run long browser/build checks.
    timeout: context.timeoutMs > 0 ? context.timeoutMs : undefined,
  });
  const elapsedMs = Date.now() - started;
  process.stderr.write(
    `gate: finished ${name} in ${String(elapsedMs)}ms ` +
      `status=${String(result.status)} signal=${String(result.signal)} ` +
      `error=${result.error === undefined ? "none" : String(result.error)}\n`,
  );
  if (isToolMissing(result)) {
    return (
      `${name} failed:\n'${executable}' is not installed — it is a pinned harness ` +
      `dependency, so a missing binary means a broken install. Run the harness setup / ` +
      `pnpm install to restore it; the gate does not skip checks.`
    );
  }
  if (
    result.status === 0 &&
    result.signal === null &&
    result.error === undefined
  ) {
    return undefined;
  }
  return `${name} failed:\n${describeFailure(result, command)}`;
}

/**
List the paths of all files staged in the index.
@param repo - Repository root.
@returns The staged file paths, empty entries removed.
*/
function stagedNames(repo: string): string[] {
  return runGit(repo, ["diff", "--cached", "--name-only"])
    .split("\n")
    .filter((line) => line.length > 0);
}

// Staged symlinks (Git mode 120000). A symlink's path may look like ordinary source but
// point at a protected file or outside the repo, so the loop must unstage it, not read it
/**
List the paths of staged symlinks (Git mode 120000) in the index.
@param repo - Repository root.
@returns The staged symlink paths.
*/
function stagedSymlinks(repo: string): string[] {
  return runGit(repo, ["ls-files", "--stage", "-z"])
    .split("\0")
    .filter((entry) => entry.length > 0)
    .flatMap((entry) => {
      const [meta = "", file = ""] = entry.split("\t", 2);
      return meta.startsWith("120000") ? [file] : [];
    });
}

interface StagedChange {
  // Non-empty by construction (a record always has at least its primary path), so consumers
  // can read paths[0] / at(-1) without an undefined fallback branch.
  paths: [string, ...string[]];
  status: string;
}

// How many path fields follow a `-z` status token: 2 for a rename/copy (R/C), else 1.
/**
Report how many path fields follow a `-z` name-status token: 2 for a rename/copy (R/C), else 1.
@param status - The name-status token (e.g. "M", "R100", "C075").
@returns 2 for rename/copy statuses, otherwise 1.
*/
function pathCountFor(status: string): number {
  return status.startsWith("R") || status.startsWith("C") ? 2 : 1;
}

/**
Parse the staged name-status diff (rename/copy detection on) into per-change records of status plus paths.
@param repo - Repository root.
@returns One record per staged change, each with its status and one or two paths.
*/
function stagedChanges(repo: string): StagedChange[] {
  const fields = runGit(repo, [
    "diff",
    "--cached",
    "--name-status",
    "-z",
    "-M20%",
    "-C20%",
    "--find-copies-harder",
  ])
    .split("\0")
    .filter((field) => field.length > 0);
  // Walk the `-z` fields by value (never by index, so no `?? ""` undefined branch). State moves
  // status -> first path -> (extra path) -> emit. Seeding `paths` with the first path field
  // types it as a non-empty tuple; the record is emitted once it holds all its paths.
  const changes: StagedChange[] = [];
  let status: string | undefined;
  let change: StagedChange | undefined;
  for (const field of fields) {
    if (status === undefined) {
      status = field;
    } else if (change === undefined) {
      change = { status, paths: [field] };
    } else {
      change.paths.push(field);
    }
    if (change?.paths.length === pathCountFor(status)) {
      changes.push(change);
      status = undefined;
      change = undefined;
    }
  }
  return changes;
}

// Match case-insensitively (both sides lowercased) so a case-insensitive filesystem (macOS:
// `Harness/gate.ts`) cannot slip a forbidden path past the FORBIDDEN_* sets.
/**
Report whether a path is forbidden, matching the FORBIDDEN_FILES, FORBIDDEN_BASENAMES, and FORBIDDEN_DIRS sets case-insensitively.
@param file - The path to test.
@returns True when the path (or its basename or a parent directory) is forbidden.
*/
export function isForbiddenPath(file: string): boolean {
  const lower = file.toLowerCase();
  const base = path.posix.basename(lower);
  return (
    [...FORBIDDEN_FILES].some((entry) => entry.toLowerCase() === lower) ||
    [...FORBIDDEN_BASENAMES].some((entry) => entry.toLowerCase() === base) ||
    [...FORBIDDEN_DIRS].some((entry) => {
      const directory = entry.toLowerCase();
      return lower === directory || lower.startsWith(`${directory}/`);
    })
  );
}

/**
Collect the added lines (leading "+", excluding the "+++" header) from the staged diff of the given paths.
@param repo - Repository root.
@param paths - Paths to restrict the diff to.
@returns The added diff lines.
*/
function stagedDiffAddedLines(
  repo: string,
  paths: readonly string[],
): string[] {
  return runGit(repo, ["diff", "--cached", "--unified=0", "--", ...paths])
    .split("\n")
    .filter((line) => line.startsWith("+") && !line.startsWith("+++"));
}

/**
Read the staged (index) content of a file via `Git show :<file>`.
@param repo - Repository root.
@param file - Path of the staged file to read.
@returns The staged content, or undefined when the Git show command fails (e.g. path not staged).
*/
function stagedContent(repo: string, file: string): string | undefined {
  const result = spawnSync("git", ["-C", repo, "show", `:${file}`], {
    encoding: "utf8",
    env: gitSafeEnvironment(),
  });
  return result.status === 0 ? result.stdout : undefined;
}

// Forbidden patterns (eslint-disable, ts-ignore, .only(, …) are REPORTED, not unstaged: the file
// stays staged so the author sees exactly where the escape hatch is and must remove it themselves.
// A non-empty problem list fails preflight (and later the push), naming the pattern and its file.
/**
Report each forbidden pattern found in a staged change's added lines, one problem per matched pattern, named against the change's destination path.
@param repo - Repository root.
@param change - The staged change whose added lines are scanned.
@returns One message per forbidden pattern occurrence.
*/
function bannedPatternProblems(repo: string, change: StagedChange): string[] {
  // For a rename/copy, Git emits [source, destination]; the added lines live in the
  // destination, so report against it (the last path). For an add/modify there is one path.
  // `paths` is a non-empty tuple, so the first element is the fallback and destructuring the
  // rest yields the destination when present.
  const [first, ...rest] = change.paths;
  const file = rest.at(-1) ?? first;
  return stagedDiffAddedLines(repo, change.paths).flatMap((line) => {
    const lower = line.toLowerCase();
    return FORBIDDEN_PATTERNS.filter((pattern) =>
      lower.includes(pattern.toLowerCase()),
    ).map((pattern) => `forbidden pattern '${pattern}' in ${file}`);
  });
}

/**
Check each staged .ts file's content against the human-preference rules, sorted by path.
@param repo - Repository root.
@param files - Staged file paths to check.
@returns One entry per preference violation found across the files.
*/
export function preferenceProblems(
  repo: string,
  files: readonly string[],
): string[] {
  return files
    .toSorted((left, right) => left.localeCompare(right))
    .flatMap((file) => {
      const content = file.endsWith(".ts")
        ? stagedContent(repo, file)
        : undefined;
      return content === undefined ? [] : preferencesViolations(file, content);
    });
}

// Run each named check; one failure entry per command that fails.
/**
Run each named check command in the repo; one failure entry per command that fails.
@param repo - Repository root the checks run in.
@param checks - Map of check name to its command tokens.
@param timeoutMs - Per-check timeout in milliseconds; 0 disables the timeout. Defaults to PREFLIGHT_TIMEOUT_MS.
@returns The failure messages, empty when every check passes.
*/
export function runChecks(
  repo: string,
  checks: Record<string, string[]>,
  timeoutMs: number = PREFLIGHT_TIMEOUT_MS,
): string[] {
  const context: CheckContext = {
    repo,
    environment: checkEnvironment(repo),
    timeoutMs,
  };
  return Object.entries(checks).flatMap(([name, command]) => {
    const failure = runOneCheck(context, name, command);
    return failure === undefined ? [] : [failure];
  });
}

// Pre-commit: fast lint/format for everyone. For agents in the loop (RALPH_LOOP) also
// drop forbidden staged paths and flag banned patterns + human-preference breaks.
/**
Run pre-commit checks: fast lint/format for everyone, plus (under RALPH_LOOP) agent containment that unstages forbidden paths and symlinks, flags banned patterns, and reports human-preference breaks.
@param repo - Repository root.
@param runner - Check runner, injectable for tests; defaults to runChecks.
@returns The preflight problems, empty when preflight passes.
*/
export function runPreflight(
  repo: string,
  runner: typeof runChecks = runChecks,
): string[] {
  const problems: string[] = [];
  if (process.env.RALPH_LOOP === "1") {
    const changes = stagedChanges(repo);
    // Forbidden PATHS and symlinks are unstaged (kept out of the commit); forbidden PATTERNS are
    // only reported, so the author must remove the escape hatch before the commit/push can pass.
    const forbidden = new Set([
      ...changes.flatMap((change) =>
        change.paths.some((file) => isForbiddenPath(file)) ? change.paths : [],
      ),
      ...stagedSymlinks(repo),
    ]);
    if (forbidden.size > 0) {
      const files = [...forbidden].toSorted((a, b) => a.localeCompare(b));
      runGit(repo, ["reset", "-q", "HEAD", "--", ...files]);
      process.stderr.write(
        `harness kept forbidden paths out of the commit: ${files.join(", ")}\n`,
      );
    }
    problems.push(
      ...changes.flatMap((change) => bannedPatternProblems(repo, change)),
    );
    const staged = stagedNames(repo);
    if (staged.length === 0) {
      // Warn but do not fail: an empty commit (e.g. only forbidden paths, now unstaged) is a
      // no-op the agent can recover from, not a preflight error that should abort the loop.
      process.stderr.write("Empty commit: nothing staged after containment.\n");
    }
    problems.push(...preferenceProblems(repo, staged));
  }
  problems.push(...runner(repo, COMMIT_CHECKS));
  return problems;
}

// Pre-push / CI: lint, format, types, security, build, 100% tests, browser checks.
/**
Run the full pre-push / CI gate (FULL_CHECKS) with no per-check timeout, so long browser/build/coverage checks can complete.
@param repo - Repository root.
@param runner - Check runner, injectable for tests; defaults to runChecks.
@returns The gate problems, empty when the gate passes.
*/
export function runGate(
  repo: string,
  runner: typeof runChecks = runChecks,
): string[] {
  // 0 = no per-check timeout: the full gate runs long browser/build/coverage checks.
  return runner(repo, FULL_CHECKS, 0);
}
