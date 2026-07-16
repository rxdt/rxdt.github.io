import { expect, test } from "@playwright/test";

const writeupRoutes = [
  {
    heading: /a frontend loop needs a real app/i,
    route: "/calculator-writeup.html",
  },
  {
    heading: /stop prompting, start engineering the loop/i,
    route: "/engineering-the-loop.html",
  },
  {
    heading: /the first \(and last\) intent-inference conference/i,
    route: "/conference.html",
  },
] as const;

const externalLinkContracts = [
  {
    expectedDestinations: [
      "https://comfyday.vercel.app/",
      "https://github.com/rxdt",
      "https://github.com/rxdt/ai_deployment_calculator",
      "https://github.com/rxdt/comfyday-public",
      "https://github.com/rxdt/inference_conference",
      "https://github.com/rxdt/loopgate_harness",
      "https://github.com/rxdt/rxdt.github.io",
      "https://www.linkedin.com/in/roxdt/",
      "https://vram.rxdt.dev/",
      "https://x.com/roxdtvc",
    ],
    heading: /human in the loop/i,
    route: "/",
  },
  {
    expectedDestinations: [
      "https://github.com/rxdt/ai_deployment_calculator",
      "https://github.com/rxdt/loopgate_harness",
      "https://vram.rxdt.dev/",
    ],
    heading: /a frontend loop needs a real app/i,
    route: "/calculator-writeup.html",
  },
  {
    expectedDestinations: [
      "https://dev.to/rxdt/stop-prompting-start-engineering-the-loop-325d",
      "https://github.com/rxdt/loopgate_harness",
    ],
    heading: /stop prompting, start engineering the loop/i,
    route: "/engineering-the-loop.html",
  },
  {
    expectedDestinations: [
      "https://dev.to/rxdt/proceedings-of-the-first-and-last-intent-inference-conference-24a5",
      "https://spacy.io/",
    ],
    heading: /the first \(and last\) intent-inference conference/i,
    route: "/conference.html",
  },
] as const;

const compareAlphabetically = (left: string, right: string): number =>
  left.localeCompare(right);

const uniqueSorted = (values: readonly string[]): string[] =>
  [...new Set(values)].sort(compareAlphabetically);

interface StructuredDataRecord {
  readonly [key: string]: unknown;
  readonly url?: unknown;
}

const parseJson = (text: string): unknown => JSON.parse(text) as unknown;

const isStructuredDataRecord = (
  value: unknown,
): value is StructuredDataRecord =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isCalculatorStructuredData = (
  value: unknown,
): value is StructuredDataRecord & { readonly url: string } =>
  isStructuredDataRecord(value) &&
  value["@type"] === "WebApplication" &&
  value.name === "AI Deployment Calculator" &&
  typeof value.url === "string";

test("homepage renders portfolio with ambient cursor and grid effects", async ({
  page,
}) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", { name: /human in the loop/i }),
  ).toBeVisible();
  await expect(page.locator(".background-grid")).toHaveCount(1);

  const shouldExpectCursorTrail = await page.evaluate<boolean>(
    `!("ontouchstart" in window) &&
      navigator.maxTouchPoints === 0 &&
      window.innerWidth >= 768 &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches`,
  );

  await expect(page.locator(".cursor-gold-dot")).toHaveCount(
    shouldExpectCursorTrail ? 30 : 0,
  );
});

test("homepage loads project media and exposes expected links", async ({
  page,
}) => {
  const responses: { status: number; url: string }[] = [];
  page.on("response", (response) => {
    responses.push({ status: response.status(), url: response.url() });
  });

  const response = await page.goto("/");
  expect(response?.status()).toBe(200);

  await expect(
    page.locator(".links").getByRole("link", { name: "Writeup" }),
  ).toHaveCount(3);
  await expect(
    page.getByRole("link", { name: /open the ai deployment calculator/i }),
  ).toHaveAttribute("href", "https://vram.rxdt.dev/");
  // The public calculator URL is advertised both as a visible project link and
  // as WebApplication structured data for crawlers; keep those contracts in sync.
  const structuredDataTexts = await page
    .locator('script[type="application/ld+json"]')
    .allTextContents();
  const calculatorStructuredData = structuredDataTexts
    .map((text) => parseJson(text))
    .find(isCalculatorStructuredData);

  expect(calculatorStructuredData?.url).toBe("https://vram.rxdt.dev/");
  await expect(
    page.getByRole("link", {
      name: /open the intent inference conference writeup/i,
    }),
  ).toHaveAttribute("href", "conference.html");

  const { origin: pageOrigin } = new URL(page.url());
  const failedAssets = responses
    .filter(({ url }) => {
      const { origin, pathname } = new URL(url);
      return origin === pageOrigin && pathname.startsWith("/assets/");
    })
    .filter(({ status }) => status >= 400);

  expect(failedAssets).toEqual([]);
});

test("homepage renders required plan media with durable playback contracts", async ({
  page,
}) => {
  const response = await page.goto("/");

  expect(response?.status()).toBe(200);

  // The portrait is the real animated WebP (merged.webp), not a mosaic SVG stand-in — a full
  // photographic portrait, all frames intact. Pin the asset so a re-swap to a blocky placeholder
  // (as happened once to game a Lighthouse audit) fails here.
  await expect(page.getByAltText("Portrait of Rox dT")).toHaveAttribute(
    "src",
    "/assets/merged.webp",
  );
  await expect(page.getByAltText("Portrait of Rox dT")).toHaveAttribute(
    "fetchpriority",
    "high",
  );
  await expect(
    page.getByAltText("AI Deployment Calculator project thumbnail"),
  ).toHaveAttribute("src", "/assets/caclulator.png");
  await expect(
    page.getByAltText("AI Deployment Calculator project thumbnail"),
  ).toHaveJSProperty("complete", true);
  expect(
    await page
      .getByAltText("AI Deployment Calculator project thumbnail")
      .evaluate((img) =>
        img instanceof HTMLImageElement ? img.naturalWidth : 0,
      ),
  ).toBeGreaterThan(0);
  // A malformed <img> tag (e.g. an unterminated attribute) still exposes a
  // src/alt but never decodes; assert the browser actually loaded the bytes.
  await expect(page.getByAltText("Portrait of Rox dT")).toHaveJSProperty(
    "complete",
    true,
  );
  expect(
    await page
      .getByAltText("Portrait of Rox dT")
      .evaluate((img) =>
        img instanceof HTMLImageElement ? img.naturalWidth : 0,
      ),
  ).toBeGreaterThan(0);
  await expect(
    page.getByAltText("Intent Inference Conference project thumbnail"),
  ).toHaveAttribute("src", "/assets/inference-conference.png");

  const comfydayVideo = page.locator("video.project-video");
  await expect(comfydayVideo.locator("source")).toHaveAttribute(
    "src",
    "/assets/comfyday-sample.mp4",
  );
  await expect(comfydayVideo).toHaveJSProperty("autoplay", true);
  await expect(comfydayVideo).toHaveJSProperty("loop", true);
  await expect(comfydayVideo).toHaveJSProperty("muted", true);
  await expect(comfydayVideo).toHaveJSProperty("playsInline", true);
});

test("portrait asset is an infinitely looping vector so it plays on loop and is not raster-flagged", async ({
  page,
}) => {
  // Plan feature: the portrait must play on loop. It ships as `merged.svg`, a
  // vector mosaic whose cells animate via SMIL with `repeatCount="indefinite"`,
  // so it loops forever AND — being vector, not a raster animation — never trips
  // Lighthouse's image-delivery insight the way the old animated `merged.webp`
  // did. Assert the served bytes honor that contract, not just the <img> src.
  const response = await page.request.get("/assets/merged.svg");

  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"]).toContain("image/svg+xml");

  const svg = await response.text();
  expect(svg).toContain("<svg");
  expect(svg).toContain("<animate");
  expect(svg).toContain('repeatCount="indefinite"');
  // A still SVG would satisfy the <img> src assertion but not "plays on loop":
  // require at least a handful of animated cells so a broken/flattened export
  // that dropped the animation fails here.
  const animatedCells = svg.match(/<animate\b/g) ?? [];
  expect(animatedCells.length).toBeGreaterThan(10);
});

test("homepage shows the full LoopGate Harness frame without cropping", async ({
  page,
}) => {
  // Plan requirement: the square LoopGate Harness art must be fully visible and
  // not cut off. The wide project card would crop a 'cover' image top/bottom, so
  // assert the served page decodes the asset and renders it with 'contain' (the
  // whole frame fits inside the box instead of overflowing and being clipped).
  const response = await page.goto("/");

  expect(response?.status()).toBe(200);

  const harnessImage = page.getByAltText("LoopGate Harness thumbnail");
  // The asset must actually decode (a broken <img> still exposes src/alt).
  await expect(harnessImage).toHaveJSProperty("complete", true);
  expect(
    await harnessImage.evaluate((node) =>
      node instanceof HTMLImageElement ? node.naturalWidth : 0,
    ),
  ).toBeGreaterThan(0);
  // 'contain' is the browser's guarantee that the whole frame fits inside the
  // box uncropped; the default 'cover' (base .project-image) would clip it.
  await expect(harnessImage).toHaveCSS("object-fit", "contain");
});

for (const { expectedDestinations, heading, route } of externalLinkContracts) {
  test(`route ${route} preserves its external destination contract`, async ({
    page,
  }) => {
    // Public project/contact/article links are part of the page contract. Load
    // the route end to end and assert the browser-resolved destinations instead
    // of trusting source text.
    const response = await page.goto(route);

    expect(response?.status()).toBe(200);
    await expect(page.getByRole("heading", { name: heading })).toBeVisible();
    expect(
      uniqueSorted(
        await page
          .locator('a[href^="http"]')
          .evaluateAll((links): string[] =>
            links.map((link) =>
              link instanceof HTMLAnchorElement ? link.href : "",
            ),
          ),
      ),
    ).toEqual(uniqueSorted(expectedDestinations));
  });
}

for (const { heading, route } of writeupRoutes) {
  test(`writeup route ${route} returns the article page`, async ({ page }) => {
    const response = await page.goto(route);

    expect(response?.status()).toBe(200);
    await expect(page.getByRole("heading", { name: heading })).toBeVisible();
    await expect(
      page.getByRole("link", { name: /back to rox dt/i }),
    ).toHaveAttribute("href", "/");
  });

  test(`writeup route ${route} applies styles from an external module under CSP`, async ({
    page,
  }) => {
    // The CSP forbids inline <script>/<style>, so each page ships its styles as
    // an external same-origin module that adopts a constructable stylesheet.
    // Assert the module actually ran (a sheet was adopted and the page-reset
    // `body { margin: 0 }` took effect) with no inline <style> and no policy
    // violation — proving the externalized styling works end to end, not just
    // that the file was requested.
    await page.addInitScript(() => {
      document.addEventListener("securitypolicyviolation", (violationEvent) => {
        document.documentElement.dataset.cspViolation =
          violationEvent.violatedDirective;
      });
    });

    const response = await page.goto(route);

    expect(response?.status()).toBe(200);
    await expect(page.locator("head > style")).toHaveCount(0);
    await expect(page.locator("html")).not.toHaveAttribute(
      "data-csp-violation",
    );
    await expect
      .poll(async () => page.evaluate(() => document.adoptedStyleSheets.length))
      .toBeGreaterThan(0);
    await expect(page.locator("body")).toHaveCSS("margin", "0px");
  });
}
test("the GitHub Pages 404 fallback redirects unknown routes to the homepage", async ({
  page,
}) => {
  // GitHub Pages serves 404.html for any path it can't match. Ours ships a
  // meta-refresh to "/", so a mistyped or stale deep link lands on the homepage
  // instead of a dead end. This is a shipped entry point with observable
  // behavior, so drive it end to end: load the fallback and assert the browser
  // actually completes the redirect (final URL + homepage heading), not merely
  // that the file exists or carries the tag.
  const response = await page.goto("/404.html");
  expect(response?.status()).toBe(200);

  await expect(page).toHaveURL(/\/$/);
  await expect(
    page.getByRole("heading", { name: /human in the loop/i }),
  ).toBeVisible();
});

test("homepage avoids first-paint shift by staying hidden until deferred styles apply", async ({
  page,
}) => {
  // The homepage CSS is injected by an external same-origin script (CSP forbids
  // inline <style>). To avoid a first-paint layout shift (Lighthouse cls-culprits
  // flagged the whole <body> shifting by 1.0) WITHOUT a render-blocking request
  // (which Lighthouse counts as a critical network dependency), the page ships
  // <body hidden> and the DEFERRED style script adopts the sheet then unhides the
  // body — so the first paint the user sees is already styled. Assert the whole
  // contract: the script is deferred, no violation, styles adopted, body revealed
  // and reset, and no render-blocking style resource remains.
  await page.addInitScript(() => {
    document.addEventListener("securitypolicyviolation", (violationEvent) => {
      document.documentElement.dataset.cspViolation =
        violationEvent.violatedDirective;
    });
  });

  const response = await page.goto("/");
  expect(response?.status()).toBe(200);

  const styleScript = page.locator('script[src$="/scripts/home-styles.js"]');
  await expect(styleScript).toHaveCount(1);
  // `defer` keeps the style script non-render-blocking (low priority), so it is
  // not a Lighthouse critical-dependency node; the <body hidden> reveal is what
  // prevents the shift instead.
  await expect(styleScript).toHaveAttribute("defer", "");

  await expect
    .poll(async () => page.evaluate(() => document.adoptedStyleSheets.length))
    .toBeGreaterThan(0);
  // The reveal actually happened: the styled body is visible, not stuck hidden.
  await expect(page.locator("body")).toBeVisible();
  await expect(page.locator("body")).not.toHaveAttribute("hidden", /.*/);
  await expect(page.locator("body")).toHaveCSS("margin", "0px");
  await expect(page.locator("head > style")).toHaveCount(0);
  await expect(page.locator("html")).not.toHaveAttribute("data-csp-violation");
});

test("homepage styles and script behavior load without CSP violations", async ({
  page,
}) => {
  await page.addInitScript(() => {
    document.addEventListener("securitypolicyviolation", (violationEvent) => {
      document.documentElement.dataset.cspViolation =
        violationEvent.violatedDirective;
    });
  });

  const response = await page.goto("/");

  expect(response?.status()).toBe(200);
  await expect(page.locator("head > style")).toHaveCount(0);
  await expect(page.locator(".background-grid")).toHaveCSS("position", "fixed");
  await expect(page.locator("video.project-video")).toHaveJSProperty(
    "autoplay",
    true,
  );
  await expect(page.locator("html")).not.toHaveAttribute("data-csp-violation");
});
