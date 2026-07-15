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
  ).toHaveAttribute("href", "https://aideploymentcalculator.vercel.app/");
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

  await expect(page.getByAltText("Portrait of Rox dT")).toHaveAttribute(
    "src",
    "/assets/merged.webp",
  );
  await expect(page.getByAltText("Portrait of Rox dT")).toHaveAttribute(
    "fetchpriority",
    "high",
  );
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
