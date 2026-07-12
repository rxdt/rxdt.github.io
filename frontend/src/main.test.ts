// @vitest-environment jsdom
import { expect, test } from "vitest";

test("the entry module renders the greeting into the document body", async () => {
  await import("./main.ts");
  expect(document.body.textContent).toContain("Hello, world");
});
