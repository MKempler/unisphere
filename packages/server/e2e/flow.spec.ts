import { test, expect } from "@playwright/test";

test("basic user flow", async ({ page }) => {
  test.setTimeout(60_000);
  
  // Basic test placeholder
  await page.goto("/");
  expect(await page.title()).toBeTruthy();
}); 