import { test, expect } from "@playwright/test";

test.describe("Base > Food Category page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/base");
    await page.getByTestId("base-sidebar").getByText("Food Category").click();
  });

  test("shows the 3 seed food categories", async ({ page }) => {
    const panel = page.getByTestId("detail-panel");
    await expect(panel).toContainText("Fruit");
    await expect(panel).toContainText("Vegetable");
    await expect(panel).toContainText("Grain");
  });

  test("can add a new food category via context menu", async ({ page }) => {
    const hint = page.getByText("Right-click to add or delete food categories");
    await hint.click({ button: "right" });
    await page.getByRole("menuitem", { name: "Add Food Category" }).click();

    await expect(page.getByTestId("food-type-add-row")).toBeVisible();
    await page.getByPlaceholder("Name").fill("Legume");
    await page.getByRole("button", { name: "Add" }).click();

    await expect(page.getByTestId("detail-panel")).toContainText("Legume");
  });

  test("can cancel adding a food category", async ({ page }) => {
    const hint = page.getByText("Right-click to add or delete food categories");
    await hint.click({ button: "right" });
    await page.getByRole("menuitem", { name: "Add Food Category" }).click();

    await expect(page.getByTestId("food-type-add-row")).toBeVisible();
    await page.getByRole("button", { name: "Cancel" }).click();

    await expect(page.getByTestId("food-type-add-row")).not.toBeVisible();
  });

  test("can add a food category by pressing Enter", async ({ page }) => {
    const hint = page.getByText("Right-click to add or delete food categories");
    await hint.click({ button: "right" });
    await page.getByRole("menuitem", { name: "Add Food Category" }).click();

    const input = page.getByPlaceholder("Name");
    await input.fill("Dairy");
    await input.press("Enter");

    await expect(page.getByTestId("detail-panel")).toContainText("Dairy");
  });

  test("can cancel adding by pressing Escape", async ({ page }) => {
    const hint = page.getByText("Right-click to add or delete food categories");
    await hint.click({ button: "right" });
    await page.getByRole("menuitem", { name: "Add Food Category" }).click();

    const input = page.getByPlaceholder("Name");
    await input.press("Escape");

    await expect(page.getByTestId("food-type-add-row")).not.toBeVisible();
  });

  test("can delete a food category via context menu", async ({ page }) => {
    const panel = page.getByTestId("detail-panel");
    const hint = page.getByText("Right-click to add or delete food categories");

    // Create a temp food category so we don't destroy seed data
    await hint.click({ button: "right" });
    await page.getByRole("menuitem", { name: "Add Food Category" }).click();
    await page.getByPlaceholder("Name").fill("TempFoodType");
    await page.getByRole("button", { name: "Add" }).click();
    await expect(panel).toContainText("TempFoodType");

    // Delete it
    const row = panel.getByText("TempFoodType");
    await row.click({ button: "right" });
    await page.getByRole("menuitem", { name: /Delete "TempFoodType"/ }).click();

    await expect(panel).not.toContainText("TempFoodType");
  });

  test("can delete multiple food categories", async ({ page }) => {
    const panel = page.getByTestId("detail-panel");
    const hint = page.getByText("Right-click to add or delete food categories");

    // Create TempF1
    await hint.click({ button: "right" });
    await page.getByRole("menuitem", { name: "Add Food Category" }).click();
    await page.getByPlaceholder("Name").fill("TempF1");
    await page.getByRole("button", { name: "Add" }).click();
    await expect(panel).toContainText("TempF1");

    // Create TempF2
    await hint.click({ button: "right" });
    await page.getByRole("menuitem", { name: "Add Food Category" }).click();
    await page.getByPlaceholder("Name").fill("TempF2");
    await page.getByRole("button", { name: "Add" }).click();
    await expect(panel).toContainText("TempF2");

    // Delete TempF1
    await panel.getByText("TempF1").click({ button: "right" });
    await page.getByRole("menuitem", { name: /Delete "TempF1"/ }).click();
    await expect(panel).not.toContainText("TempF1");

    // Delete TempF2
    await panel.getByText("TempF2").click({ button: "right" });
    await page.getByRole("menuitem", { name: /Delete "TempF2"/ }).click();
    await expect(panel).not.toContainText("TempF2");

    // Seed data should still be intact
    await expect(panel).toContainText("Grain");
  });
});
