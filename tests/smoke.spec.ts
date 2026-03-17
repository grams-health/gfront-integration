import { test, expect } from "@playwright/test";

test.describe("Smoke — app loads with real backends", () => {
  test("homepage loads", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/admin/i);
  });

  test("base page shows seeded nutrients", async ({ page }) => {
    await page.goto("/base");
    const sidebar = page.getByTestId("base-sidebar");
    await sidebar.getByText("Nutrient").click();

    const panel = page.getByTestId("detail-panel");
    await expect(panel.getByText("Protein")).toBeVisible();
    await expect(panel.getByText("Carbohydrate")).toBeVisible();
    await expect(panel.getByText("Fat")).toBeVisible();
    await expect(panel.getByText("Vitamin A")).toBeVisible();
    await expect(panel.getByText("Lysine")).toBeVisible();
  });

  test("base page shows seeded foods", async ({ page }) => {
    await page.goto("/base");
    const sidebar = page.getByTestId("base-sidebar");
    await sidebar.getByText("Food").click();

    const panel = page.getByTestId("detail-panel");
    await expect(panel.getByText("Apple")).toBeVisible();
    await expect(panel.getByText("Carrot")).toBeVisible();
  });

  test("base page shows seeded equipment", async ({ page }) => {
    await page.goto("/base");
    const sidebar = page.getByTestId("base-sidebar");
    await sidebar.getByText("Equipment").click();

    const panel = page.getByTestId("detail-panel");
    await expect(panel.getByText("Pot")).toBeVisible();
    await expect(panel.getByText("Pan")).toBeVisible();
  });

  test("dish page shows seeded dishes", async ({ page }) => {
    await page.goto("/dish");
    await expect(page.getByText("Chicken Stir Fry")).toBeVisible();
    await expect(page.getByText("Vegetable Soup")).toBeVisible();
  });
});
