import { expect, test } from "@playwright/test";

test("homepage renders the greeting", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("body")).toContainText("Hello, world");
});
