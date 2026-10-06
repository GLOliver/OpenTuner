import { expect, test } from "@playwright/test";

test("loads the OpenTuner tuner screen", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/OpenTuner/);
  await expect(page.getByRole("heading", { name: "OpenTuner" })).toBeVisible();
  await expect(page.getByRole("region", { name: "Chromatic tuner" })).toBeVisible();
  await expect(page.getByRole("button", { name: /start tuner/i })).toBeVisible();
});
