import { AxeBuilder } from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

// Plan feature "The site is accessible" and milestone "accessibility": prove it
// with an automated WCAG scan of the SERVED pages, not just the Lighthouse
// category. axe-core catches structure/name/role/contrast defects Lighthouse's
// subset can miss, and running it across every device project asserts the site
// stays accessible responsively (mobile nav wrap, single-column grids, etc.).
const accessibleRoutes = [
  { heading: /human in the loop/i, route: "/" },
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

// The WCAG levels the site commits to: A and AA across the 2.0/2.1/2.2 rule
// sets. Fixed here so a regression that introduces, say, an unlabeled control
// or a low-contrast token fails the gate with the offending node named.
const wcagTags = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

// The writeups theme their palette off `prefers-color-scheme`, so a token that
// passes contrast in light can still fail in dark (and vice versa). Scan both
// so both token sets are held to WCAG AA — the homepage is fixed-dark and is
// identical under either emulation.
const colorSchemes = ["light", "dark"] as const;

for (const { heading, route } of accessibleRoutes) {
  for (const colorScheme of colorSchemes) {
    test(`route ${route} has no WCAG A/AA violations in ${colorScheme} mode`, async ({
      page,
    }) => {
      await page.emulateMedia({ colorScheme });
      const response = await page.goto(route);

      expect(response?.status()).toBe(200);
      // Only scan once the page's real content is present; a blank/error page
      // would otherwise pass vacuously.
      await expect(page.getByRole("heading", { name: heading })).toBeVisible();

      const { violations } = await new AxeBuilder({ page })
        .withTags(wcagTags)
        .analyze();

      // Surface the rule ids and offending selectors in the failure message so
      // a regression is actionable without re-running locally.
      expect(
        violations.map((violation) => ({
          id: violation.id,
          nodes: violation.nodes.map((node) => node.target),
        })),
      ).toEqual([]);
    });
  }
}
