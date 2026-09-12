import { expect, test } from "@playwright/test";

test("homepage distinguishes the Python and JS harnesses", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "LoopGate", exact: true }),
  ).toHaveCount(1);
  await expect(
    page.getByRole("heading", { name: "LoopGate Harness", exact: true }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("heading", { name: "LoopGate JS", exact: true }),
  ).toHaveCount(1);
  const card = page.getByRole("article").filter({
    has: page.getByRole("heading", { name: "LoopGate JS", exact: true }),
  });
  await expect(card).toContainText(
    "This site itself was built using loopgate_js.",
  );
  await expect(
    card.getByRole("link", {
      name: "LoopGate JS GitHub repository",
      exact: true,
    }),
  ).toHaveAttribute("href", "https://github.com/rxdt/loopgate_js");
  const image = card.getByRole("img");
  await image.scrollIntoViewIfNeeded();
  await expect(image).toHaveJSProperty("naturalWidth", 384);
  await card
    .getByRole("link", { name: "Why frontend gates are harder", exact: true })
    .click();
  await expect(page).toHaveURL(/\/loopgate-js\.html$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Why frontend gates are harder",
  );
  await expect(
    page.getByRole("link", { name: "Explore LoopGate JS" }),
  ).toHaveAttribute("href", "https://github.com/rxdt/loopgate_js");
  await expect(
    page.getByRole("link", { name: "LoopGate JS README", exact: true }),
  ).toHaveAttribute(
    "href",
    "https://github.com/rxdt/loopgate_js#why-frontend-loops-are-harder",
  );
  await expect(
    page.getByRole("link", { name: "Back to Rox dT" }),
  ).toHaveAttribute("href", "/");
});
