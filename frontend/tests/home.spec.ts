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
      "https://github.com/rxdt",
      "https://spacy.io/",
      "https://vram.rxdt.dev/",
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

  await expect(page.locator("canvas.cursor-canvas")).toHaveCount(
    shouldExpectCursorTrail ? 1 : 0,
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
  const portrait = page.getByAltText("Portrait of Rox dT");
  await expect(portrait).toHaveAttribute("src", "/assets/merged.webp");
  await expect(portrait).toHaveAttribute("width", "174");
  await expect(portrait).toHaveAttribute("height", "174");
  await expect(portrait).toHaveAttribute("fetchpriority", "high");
  // The portrait is served as a single animated WebP (no <picture>/AVIF): the
  // AVIF variant had zero per-frame delay and rendered frozen, so it was dropped.
  const portraitSource = await portrait.evaluate((image) =>
    image instanceof HTMLImageElement ? image.currentSrc : "",
  );
  expect(portraitSource).toMatch(/\/assets\/merged\.webp$/);
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
  await expect(portrait).toHaveJSProperty("complete", true);
  expect(
    await portrait.evaluate((img) =>
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
  // Assert the playsinline attribute, not the JS property: Firefox honors the
  // attribute but does not expose the `playsInline` reflected property, so the
  // property check fails there while the inline-playback intent still holds.
  await expect(comfydayVideo).toHaveAttribute("playsinline", "");
});

test("portrait asset serves an animated WebP", async ({ page }) => {
  const webpResponse = await page.request.get("/assets/merged.webp");
  expect(webpResponse.status()).toBe(200);
  expect(webpResponse.headers()["content-type"]).toContain("image/webp");
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

  test(`writeup route ${route} applies styles from a linked stylesheet under CSP`, async ({
    page,
  }) => {
    // Styles ship as real same-origin <link rel="stylesheet"> files (allowed by
    // style-src 'self'), not assembled in JS. They apply at parse time with no
    // script in the critical path, so a blocked or stale script can never leave
    // the page unstyled. Assert the stylesheet is linked, the page-reset
    // `body { margin: 0 }` actually took effect, and there is no inline <style>
    // or CSP violation — proving the styling works end to end.
    await page.addInitScript(() => {
      document.addEventListener("securitypolicyviolation", (violationEvent) => {
        document.documentElement.dataset.cspViolation =
          violationEvent.violatedDirective;
      });
    });

    const response = await page.goto(route);

    expect(response?.status()).toBe(200);
    await expect(page.locator("head > style")).toHaveCount(0);
    await expect(page.locator('head > link[rel="stylesheet"]')).not.toHaveCount(
      0,
    );
    await expect(page.locator("html")).not.toHaveAttribute(
      "data-csp-violation",
    );
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

test("homepage is styled at first paint via a linked stylesheet, not a script", async ({
  page,
}) => {
  // The homepage CSS ships as real same-origin <link rel="stylesheet"> files
  // (tokens + page styles), applied at parse time. No <body hidden>, no
  // constructable stylesheet, no script in the styling critical path — so the
  // page can never render as raw unstyled HTML if a script is blocked or stale.
  // Assert the stylesheet is linked, the body is visible and reset, and there is
  // no inline <style> or CSP violation.
  await page.addInitScript(() => {
    document.addEventListener("securitypolicyviolation", (violationEvent) => {
      document.documentElement.dataset.cspViolation =
        violationEvent.violatedDirective;
    });
  });

  const response = await page.goto("/");
  expect(response?.status()).toBe(200);

  await expect(page.locator('head > link[rel="stylesheet"]')).not.toHaveCount(
    0,
  );
  // The body is styled and visible with no reveal step and no hidden gate.
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

/* Layout regression guards. The structural checks above stay green even when
   the hero breaks, mobile overflows sideways, or section dividers return, so
   each of those visual invariants is asserted explicitly below. */

test("homepage never scrolls horizontally at the project viewport", async ({
  page,
}) => {
  await page.goto("/");
  // WCAG reflow: content must fit the viewport width with no sideways scroll.
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);
});

test("hero H1 stays in its intended size band on desktop", async ({ page }) => {
  await page.goto("/");
  // Guards the hero type scale both ways: a shrunk H1 (too small, ~56px) and a
  // ballooned one (billboard, ~76px+) have both regressed here before. On wide
  // desktop the rendered H1 must land in a sane band.
  const size = await page.evaluate(() => {
    if (window.innerWidth < 1200) {
      return null;
    }
    const h1 = document.querySelector("h1");
    return h1 === null
      ? null
      : Number(getComputedStyle(h1).fontSize.replace("px", ""));
  });
  if (size === null) {
    return;
  }
  expect(size).toBeGreaterThanOrEqual(56);
  expect(size).toBeLessThanOrEqual(70);
});

test("hero keeps the portrait beside the copy, not drifting far right", async ({
  page,
}) => {
  await page.goto("/");
  // On viewports below 900px the portrait wraps below the copy (gap is null),
  // so the side-by-side geometry is only asserted where the row layout applies.
  const geometry = await page.evaluate(() => {
    if (window.innerWidth < 900) {
      return null;
    }
    const copy = document.querySelector(".hero-copy");
    const portrait = document.querySelector(".portrait");
    const hero = document.querySelector(".hero");
    if (copy === null || portrait === null || hero === null) {
      return null;
    }
    const copyBox = copy.getBoundingClientRect();
    const portraitBox = portrait.getBoundingClientRect();
    const heroBox = hero.getBoundingClientRect();
    return {
      gap: portraitBox.left - copyBox.right,
      centerSkew: Math.abs(heroBox.left - (window.innerWidth - heroBox.right)),
    };
  });
  if (geometry === null) {
    return;
  }
  // The portrait must hug the copy (no dead gap like the far-right drift bug).
  expect(geometry.gap).toBeGreaterThanOrEqual(0);
  expect(geometry.gap).toBeLessThanOrEqual(96);
  // The hero row is centered: left and right margins match within a few px.
  expect(geometry.centerSkew).toBeLessThanOrEqual(2);
});

test("homepage sections have no horizontal divider rules", async ({ page }) => {
  await page.goto("/");
  const borderedSections = await page.evaluate(
    () =>
      [...document.querySelectorAll("main section")].filter((section) => {
        const style = getComputedStyle(section);
        return (
          style.borderTopWidth !== "0px" || style.borderBottomWidth !== "0px"
        );
      }).length,
  );
  expect(borderedSections).toBe(0);
});

test("nav links stay small and the byline is a single line", async ({
  page,
}) => {
  await page.goto("/");
  const navFontPx = await page.evaluate(() => {
    const nav = document.querySelector(".nav-links");
    if (nav === null) {
      return 0;
    }
    // fontSize is a "<n>px" string; drop the unit and coerce the number.
    return Number(getComputedStyle(nav).fontSize.replace("px", ""));
  });
  expect(navFontPx).toBeGreaterThan(0);
  expect(navFontPx).toBeLessThan(14);

  await page.goto("/calculator-writeup.html");
  // The byline wraps to multiple lines only on narrow phones by design, so the
  // single-line assertion applies from 600px up (null signals "skip below").
  const bylineLines = await page.evaluate(() => {
    if (window.innerWidth < 600) {
      return null;
    }
    const byline = document.querySelector(".byline");
    if (byline === null) {
      return null;
    }
    const tops = [...byline.querySelectorAll("span")].map((span) =>
      Math.round(span.getBoundingClientRect().top),
    );
    return new Set(tops).size;
  });
  if (bylineLines === null) {
    return;
  }
  expect(bylineLines).toBe(1);
});
