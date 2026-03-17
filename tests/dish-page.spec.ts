import { test, expect } from "@playwright/test";

test.describe("Dish page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/dish");
  });

  test("shows the dish sidebar with search and dish items", async ({ page }) => {
    const sidebar = page.getByTestId("dish-sidebar");
    await expect(sidebar).toBeVisible();
    await expect(sidebar.getByTestId("dish-search")).toBeVisible();
    await expect(sidebar).toContainText("Chicken Stir Fry");
    await expect(sidebar).toContainText("Vegetable Soup");
    await expect(sidebar).toContainText("Pasta Primavera");
  });

  test("shows placeholder when no dish is selected", async ({ page }) => {
    await expect(page.getByTestId("dish-placeholder")).toContainText("Select a dish to view details");
  });

  test("search filters dish items in sidebar", async ({ page }) => {
    const sidebar = page.getByTestId("dish-sidebar");
    const searchInput = sidebar.getByTestId("dish-search");

    await searchInput.fill("chicken");
    await expect(sidebar.getByTestId("dish-item-1")).toBeVisible(); // Chicken Stir Fry
    await expect(sidebar.getByTestId("dish-item-2")).not.toBeVisible(); // Vegetable Soup hidden
    await expect(sidebar.getByTestId("dish-item-3")).not.toBeVisible(); // Pasta Primavera hidden

    await searchInput.fill("");
    await expect(sidebar.getByTestId("dish-item-2")).toBeVisible(); // Vegetable Soup visible again
  });

  test("can add a new dish via context menu", async ({ page }) => {
    const sidebar = page.getByTestId("dish-sidebar");
    await expect(sidebar).toContainText("Chicken Stir Fry");

    await sidebar.click({ button: "right" });
    await page.getByRole("menuitem", { name: "Add Dish" }).click();

    const addRow = page.getByTestId("dish-add-row");
    await expect(addRow).toBeVisible();
    const input = addRow.getByRole("textbox");
    await input.fill("Ramen");
    await input.press("Enter");

    await expect(sidebar).toContainText("Ramen");
  });

  test("can cancel adding a dish", async ({ page }) => {
    const sidebar = page.getByTestId("dish-sidebar");
    await sidebar.click({ button: "right" });
    await page.getByRole("menuitem", { name: "Add Dish" }).click();

    await expect(page.getByTestId("dish-add-row")).toBeVisible();
    await page.getByRole("button", { name: "Cancel" }).click();

    await expect(page.getByTestId("dish-add-row")).not.toBeVisible();
  });

  test("can delete a dish via context menu", async ({ page }) => {
    const sidebar = page.getByTestId("dish-sidebar");
    await expect(sidebar).toContainText("Pasta Primavera");

    await sidebar.getByTestId("dish-item-3").click({ button: "right" });
    await page.getByRole("menuitem", { name: /Delete "Pasta Primavera"/ }).click();

    await expect(sidebar).not.toContainText("Pasta Primavera");
  });

  test("selecting a dish shows content area with name and tabs", async ({ page }) => {
    await page.getByTestId("dish-item-1").click();

    const content = page.getByTestId("dish-content");
    await expect(content).toBeVisible();
    await expect(content).toContainText("Chicken Stir Fry");
    await expect(page.getByTestId("dish-builder-tab")).toBeVisible();
    await expect(page.getByTestId("dish-details-tab")).toBeVisible();
  });
});
