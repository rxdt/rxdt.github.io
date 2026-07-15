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

// Injects the pinned CSP as a <meta> tag at the very top of <head> on every
// built page. Vite's transformIndexHtml fires once per HTML entry in a
// multi-page build, so all portfolio pages get the policy. `head-prepend`
// places the meta before any resource-referencing tag, as CSP requires.
/**

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

export default defineConfig({
  root: frontendRoot,
  plugins: [cspMeta()],
  build: {
    rollupOptions: {
      input: htmlEntries,
    },
  },
});
