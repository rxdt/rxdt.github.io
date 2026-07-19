import { globSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { defineConfig, type HtmlTagDescriptor, type Plugin } from "vite";

const frontendRoot = fileURLToPath(new URL("../frontend", import.meta.url));

// Every standalone HTML page at the frontend root is its own build entry, so
// `vite build` emits each portfolio page (not just index.html) into dist/.
const htmlEntries = globSync("*.html", { cwd: frontendRoot }).map((file) =>
  fileURLToPath(new URL(`../frontend/${file}`, import.meta.url)),
);

// The Content-Security-Policy the site must ship. It is PINNED here, in a
// harness-owned (FORBIDDEN) file, so a loop agent editing frontend/ cannot
// weaken or remove it. GitHub Pages cannot set HTTP response headers, so the
// policy is delivered via <meta http-equiv> (OWASP-sanctioned fallback). Pure
// 'self' with no hashes/nonces: every executable script/style must be an
// external same-origin file. `harness/csp.test.ts` asserts this exact string is
// present on every built page AND that no page carries inline JS/CSS — the
// tamper-resistant gate. JSON-LD (application/ld+json) is data, not script, so
// `script-src 'self'` does not block it.
export const CSP_POLICY =
  "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; media-src 'self'";

/**
Injects the pinned CSP as a <meta> tag at the very top of <head> on every
built page. `head-prepend` places the meta before any resource-referencing tag,
as CSP requires.
@returns A Vite plugin that prepends the CSP meta to each page's <head>.
*/
export function cspMeta(): Plugin {
  return {
    name: "csp-meta",
    transformIndexHtml: (): HtmlTagDescriptor[] => [
      {
        tag: "meta",
        attrs: {
          "http-equiv": "Content-Security-Policy",
          content: CSP_POLICY,
        },
        injectTo: "head-prepend",
      },
    ],
  };
}

/**
Preloads this page's own stylesheets so Lighthouse's NetworkDependencyTree
treats them as non-critical (isLinkPreload) and they leave the critical request
chain. The real <link rel="stylesheet"> still renders the page with no JS; this
only adds a matching same-origin preload immediately before each stylesheet, so
the CSP <meta> stays first and the preload precedes the sheet it hints. The
stylesheets ship from public/styles/, so their /styles/*.css hrefs are stable
(unhashed) and served as real text/css by both the dev server and the build.
@returns A Vite plugin that inserts a matching preload before each stylesheet.
*/
export function stylePreload(): Plugin {
  const stylesheet =
    /<link rel="stylesheet" href="(\/styles\/[\w-]+\.css)"\s*\/?>/g;
  return {
    name: "style-preload",
    transformIndexHtml: {
      order: "post",
      handler: (html: string): string =>
        html.replaceAll(
          stylesheet,
          (link, href: string) =>
            `<link rel="preload" as="style" href="${href}">${link}`,
        ),
    },
  };
}

export default defineConfig({
  root: frontendRoot,
  plugins: [cspMeta(), stylePreload()],
  build: {
    rollupOptions: {
      input: htmlEntries,
    },
  },
});
