// Guards the BUILT output's style delivery so the "everything huge, unstyled"
// outage cannot regress. It builds the site the way CI does and asserts, on each
// emitted page, that styling is a real render-blocking <link rel="stylesheet">
// (applies at parse time, no script in the critical path), that a matching
// <link rel="preload" as="style"> precedes it (keeps Lighthouse's
// network-dependency-tree green without weakening robustness), and that no page
// ships <body hidden> (the fail-open reveal scheme that rendered raw HTML when a
// script was blocked). Dev-server e2e cannot catch build-only breakage, so this
// inspects the actual dist output.
import { mkdtempSync, readdirSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import { type HtmlElement, Parser, StaticConfigLoader } from "html-validate";
import { build } from "vite";
import { afterAll, beforeAll, describe, expect, test } from "vitest";

const HARNESS_CONFIG = path.resolve(import.meta.dirname, "vite.config.ts");

/**
Builds one html-validate parser for the suite.
@returns A parser resolved with the loader's page.html config.
*/
async function makeParser(): Promise<Parser> {
  return new Parser(await new StaticConfigLoader().getConfigFor("page.html"));
}

/**
Reads one element attribute value, or null when it is absent.
@param element - The element to read from.
@param name - The attribute name.
@returns The attribute value, or null.
*/
function attribute(element: HtmlElement, name: string): string | null {
  const value = element.getAttribute(name)?.value;
  return typeof value === "string" ? value : null;
}

describe("built pages deliver styles as render-blocking stylesheets", () => {
  let outDirectory: string;
  let pages: { name: string; html: string; root: HtmlElement }[];

  beforeAll(async () => {
    const parser = await makeParser();
    outDirectory = mkdtempSync(path.join(tmpdir(), "harness-styles-"));
    await build({
      configFile: HARNESS_CONFIG,
      build: { outDir: outDirectory, emptyOutDir: true },
      logLevel: "warn",
    });
    pages = readdirSync(outDirectory, { recursive: true })
      .map(String)
      // 404.html is a bare meta-refresh redirect with no rendered content to
      // style, so the stylesheet contract does not apply to it.
      .filter((file) => file.endsWith(".html") && file !== "404.html")
      .map((name) => {
        const html = readFileSync(path.join(outDirectory, name), "utf8");
        return { name, html, root: parser.parseHtml(html) };
      });
  }, 60_000);

  afterAll(() => {
    if (outDirectory) {
      rmSync(outDirectory, { recursive: true, force: true });
    }
  });

  test("the build emits every styled portfolio page", () => {
    expect(pages.length).toBeGreaterThanOrEqual(4);
  });

  test("every page links at least one same-origin stylesheet", () => {
    for (const { name, root } of pages) {
      const sheets = root
        .querySelectorAll('link[rel="stylesheet"]')
        .map((link) => attribute(link, "href") ?? "");
      expect(
        sheets.length,
        `${name} links no <link rel="stylesheet"> — styles would not apply`,
      ).toBeGreaterThan(0);
      for (const href of sheets) {
        expect(
          href.startsWith("/"),
          `${name} stylesheet ${href} is not same-origin`,
        ).toBe(true);
      }
    }
  });

  test("a matching preload precedes each stylesheet in <head>", () => {
    for (const { name, root, html } of pages) {
      for (const link of root.querySelectorAll('link[rel="stylesheet"]')) {
        const href = attribute(link, "href") ?? "";
        const preload = `<link rel="preload" as="style" href="${href}">`;
        expect(
          html.indexOf(preload),
          `${name} is missing a preload hint for ${href}`,
        ).toBeGreaterThanOrEqual(0);
        expect(
          html.indexOf(preload),
          `${name} preload for ${href} must precede its stylesheet`,
        ).toBeLessThan(
          html.indexOf(`href="${href}"`, html.indexOf(preload) + 1),
        );
      }
    }
  });

  test("no page ships <body hidden> (fail-open reveal scheme)", () => {
    for (const { name, root } of pages) {
      const body = root.querySelector("body");
      expect(
        body === null ? null : attribute(body, "hidden"),
        `${name} ships <body hidden>; a blocked script would leave it unstyled`,
      ).toBeNull();
    }
  });
});
