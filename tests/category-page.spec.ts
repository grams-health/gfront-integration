import { test, expect } from "@playwright/test";

test.describe("Base > Category page", () => {
  test("displays header, tab nav, sidebar, and detail panel", async ({ page }) => {
    await page.goto("/base");

    // Header
    await expect(page.getByTestId("header")).toBeVisible();
    await expect(page.getByTestId("header")).toContainText("Grams Admin");

    // Tab nav with 3 tabs
    await expect(page.getByTestId("tab-nav")).toBeVisible();
    await expect(page.getByRole("link", { name: "Base" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Food" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Dish" })).toBeVisible();

    // Sidebar with 7 sections
    const sidebar = page.getByTestId("base-sidebar");
    await expect(sidebar).toBeVisible();
    for (const name of ["Category", "Restriction", "Nutrient", "Equipment", "Prepare", "Cook", "Food Category"]) {
      await expect(sidebar.getByText(name, { exact: true })).toBeVisible();
    }

    // Detail panel
    await expect(page.getByTestId("detail-panel")).toBeVisible();
  });

  test("shows the 3 seed nutrient categories", async ({ page }) => {
    await page.goto("/base");

    const panel = page.getByTestId("detail-panel");
    await expect(panel).toContainText("Macronutrient");
    await expect(panel).toContainText("Micronutrient");
    await expect(panel).toContainText("Amino Acid");
  });

  test("can add a new category and see it in the list", async ({ page }) => {
    await page.goto("/base");

    // Right-click to open context menu, then click "Add Category"
    const hint = page.getByText("Right-click to add or delete");
    await hint.click({ button: "right" });
    await page.getByRole("menuitem", { name: "Add Category" }).click();

    await page.getByPlaceholder("Category name").fill("Vitamin");
    await page.getByRole("button", { name: "Add" }).click();

    await expect(page.getByTestId("detail-panel")).toContainText("Vitamin");
  });

  test("can delete a category and see it disappear", async ({ page }) => {
    await page.goto("/base");

    const panel = page.getByTestId("detail-panel");

    // Create a temp category first so we don't destroy seed data
    const hint = page.getByText("Right-click to add or delete");
    await hint.click({ button: "right" });
    await page.getByRole("menuitem", { name: "Add Category" }).click();
    await page.getByPlaceholder("Category name").fill("TempCategory");
    await page.getByRole("button", { name: "Add" }).click();
    await expect(panel).toContainText("TempCategory");

    // Right-click the temp item to delete it
    const row = panel.getByText("TempCategory");
    await row.click({ button: "right" });
    await page.getByRole("menuitem", { name: /Delete "TempCategory"/ }).click();

    await expect(panel).not.toContainText("TempCategory");
  });
});
