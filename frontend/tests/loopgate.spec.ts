// LoopGate is the one page outside the shared dark design system (see DESIGN.md
// "Exceptions"): it ships its own light stylesheet instead of tokens.css. That
// makes it the page most likely to drift, so its contracts live here rather than
// folded into the homepage/writeup suites, which assume the shared system.
import { expect, test } from "@playwright/test";

const ROUTE = "/loopgate.html";
const HEADING = /loopgate makes agents prove the code works/i;

// Public outbound links are part of the page contract; assert the
// browser-resolved destinations rather than trusting source text.
const expectedDestinations = [
  "https://github.com/rxdt",
  "https://github.com/rxdt/loopgate_harness",
  "https://rxdt.dev/",
];

const compareAlphabetically = (left: string, right: string): number =>
  left.localeCompare(right);

const uniqueSorted = (values: readonly string[]): string[] =>
  [...new Set(values)].sort(compareAlphabetically);

type AuthoredRecord = Record<string, unknown>;

const isRecord = (value: unknown): value is AuthoredRecord =>
  typeof value === "object" && value !== null && !Array.isArray(value);

test("the LoopGate page serves and styles itself under CSP", async ({
  page,
}) => {
  // Styling must come from a real same-origin <link> under style-src 'self',
  // never an inline <style>, so a blocked script can never leave it unstyled.
  await page.addInitScript(() => {
    document.addEventListener("securitypolicyviolation", (violationEvent) => {
      document.documentElement.dataset.cspViolation =
        violationEvent.violatedDirective;
    });
  });

  const response = await page.goto(ROUTE);

  expect(response?.status()).toBe(200);
  await expect(page.getByRole("heading", { name: HEADING })).toBeVisible();
  await expect(page.locator("head > style")).toHaveCount(0);
  await expect(
    page.locator('head > link[rel="stylesheet"][href="/styles/loopgate.css"]'),
  ).toHaveCount(1);
  await expect(page.locator("html")).not.toHaveAttribute("data-csp-violation");
  await expect(page.locator("body")).toHaveCSS("margin", "0px");

  // The light scheme is the deliberate exception, not a regression: assert it
  // is applied so a future "make everything dark" sweep fails here instead of
  // silently reskinning the product page.
  await expect(page.locator(":root")).toHaveCSS("color-scheme", "light");
});

test("the LoopGate page preserves its external destination contract", async ({
  page,
}) => {
  const response = await page.goto(ROUTE);

  expect(response?.status()).toBe(200);
  await expect(page.getByRole("heading", { name: HEADING })).toBeVisible();
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

test("the LoopGate page keeps the full legal name out of visible copy", async ({
  page,
}) => {
  // Repo rule (docs/PROJECT_STATUS.md): visible bylines say "Rox dT"; the full
  // legal name belongs only in machine-readable JSON-LD.
  await page.goto(ROUTE);

  await expect(page.locator("body")).not.toContainText("Roxana del Toro");

  const structuredData: unknown = JSON.parse(
    await page.locator('script[type="application/ld+json"]').innerText(),
  );
  const author = isRecord(structuredData) ? structuredData.author : undefined;

  expect(isRecord(author) ? author.name : undefined).toBe("Roxana del Toro");
});
