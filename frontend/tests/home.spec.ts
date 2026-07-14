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

for (const { heading, route } of writeupRoutes) {
  test(`writeup route ${route} returns the article page`, async ({ page }) => {
    const response = await page.goto(route);

    expect(response?.status()).toBe(200);
    await expect(page.getByRole("heading", { name: heading })).toBeVisible();
    await expect(
      page.getByRole("link", { name: /back to rox dt/i }),
    ).toHaveAttribute("href", "/");
  });
}
