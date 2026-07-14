import { expect, test } from "@playwright/test";

test("homepage renders portfolio with ambient cursor and grid effects", async ({
  page,
}) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", { name: /human in the loop/i }),
  ).toBeVisible();
  await expect(page.locator(".background-grid")).toHaveCount(1);

  const expectsCursorTrail = await page.evaluate(
    () =>
      !("ontouchstart" in window) &&
      navigator.maxTouchPoints === 0 &&
      window.innerWidth >= 768 &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  await expect(page.locator(".cursor-gold-dot")).toHaveCount(
    expectsCursorTrail ? 30 : 0,
  );
});
