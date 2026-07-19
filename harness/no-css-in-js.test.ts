// Guard: CSS must live in real .css files linked from HTML, never assembled in
// JavaScript. A constructable-stylesheet ("CSS-in-JS") scheme makes the whole
// page's styling depend on a script executing successfully — one blocked or
// stale script and the page renders as raw unstyled HTML. Real <link
// rel="stylesheet"> files apply at parse time with no script in the critical
// path, and are covered by the strict stylelint gate. This test fails the build
// if any frontend source JS reintroduces the CSS-in-JS pattern, so the outage it
// caused cannot regress.
//
// It scans hand-written source under frontend/ (not the built dist/, which is
// generated) for the stylesheet-construction APIs. It deliberately does NOT flag
// element.style.* assignments: setting an individual element's inline style at
// runtime (e.g. positioning a cursor-trail dot) is normal DOM work, not a
// stylesheet, and the CSP gate governs page-level inline styles separately.
import { globSync, readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, test } from "vitest";

const frontendRoot = path.resolve(import.meta.dirname, "../frontend");

// Each pattern names one way to build or install a stylesheet from JS.
const BANNED_PATTERNS: readonly { label: string; pattern: RegExp }[] = [
  { label: "new CSSStyleSheet()", pattern: /new\s+CSSStyleSheet\b/ },
  { label: "document.adoptedStyleSheets", pattern: /adoptedStyleSheets/ },
  { label: "CSSStyleSheet.replaceSync()", pattern: /\.replaceSync\s*\(/ },
];

/**
Lists hand-written frontend source .js files, excluding the generated dist/.
@returns Absolute paths of the frontend source scripts to scan.
*/
function sourceJsFiles(): string[] {
  return globSync("**/*.js", { cwd: frontendRoot })
    .filter((file) => !file.startsWith("dist/"))
    .map((file) => path.join(frontendRoot, file));
}

describe("no CSS-in-JS in frontend source", () => {
  test("no source .js builds a stylesheet (use <link rel=stylesheet> instead)", () => {
    const offenders: string[] = [];
    for (const file of sourceJsFiles()) {
      const text = readFileSync(file, "utf8");
      for (const { label, pattern } of BANNED_PATTERNS) {
        if (pattern.test(text)) {
          offenders.push(`${path.relative(frontendRoot, file)}: ${label}`);
        }
      }
    }
    expect(
      offenders,
      `CSS-in-JS found; move these styles to a real .css file linked from the HTML:\n${offenders.join("\n")}`,
    ).toEqual([]);
  });
});
