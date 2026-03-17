import { test, expect } from "@playwright/test";

test.describe("Food page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/food");
  });

  test("shows the food sidebar with search and food items", async ({ page }) => {
    const sidebar = page.getByTestId("food-sidebar");
    await expect(sidebar).toBeVisible();
    await expect(sidebar.getByTestId("food-search")).toBeVisible();
    await expect(sidebar).toContainText("Apple");
    await expect(sidebar).toContainText("Banana");
    await expect(sidebar).toContainText("Bread");
    await expect(sidebar).toContainText("Carrot");
    await expect(sidebar).toContainText("Zucchini");
  });

  test("shows placeholder when no food is selected", async ({ page }) => {
    await expect(page.getByTestId("food-placeholder")).toContainText("Select a food to view details");
  });

  test("selecting a food shows its detail with name, nutrients, and restrictions", async ({ page }) => {
    await page.getByTestId("food-item-1").click();

    const detail = page.getByTestId("food-detail");
    await expect(detail).toBeVisible();
    await expect(detail).toContainText("Apple");

    await expect(page.getByTestId("food-nutrient-list")).toBeVisible();
    await expect(page.getByTestId("food-nutrient-list")).toContainText("Nutrients");
    await expect(page.getByTestId("food-nutrient-list")).toContainText("Protein");
    await expect(page.getByTestId("food-nutrient-list")).toContainText("0.1");

    await expect(page.getByTestId("food-restriction-list")).toBeVisible();
    await expect(page.getByTestId("food-restriction-list")).toContainText("Restrictions");
    await expect(page.getByTestId("food-restriction-list")).toContainText("Peanut");
  });

  test("search filters food items in sidebar", async ({ page }) => {
    const sidebar = page.getByTestId("food-sidebar");
    const searchInput = sidebar.getByTestId("food-search");

    await searchInput.fill("app");
    await expect(sidebar.getByTestId("food-item-1")).toBeVisible(); // Apple
    await expect(sidebar.getByTestId("food-item-2")).not.toBeVisible(); // Banana hidden
    await expect(sidebar.getByTestId("food-item-3")).not.toBeVisible(); // Bread hidden

    await searchInput.fill("");
    await expect(sidebar.getByTestId("food-item-2")).toBeVisible(); // Banana visible again
  });

  test("can add a food via context menu", async ({ page }) => {
    const sidebar = page.getByTestId("food-sidebar");
    // Wait for initial mock data to load
    await expect(sidebar).toContainText("Apple");

    await sidebar.click({ button: "right" });
    await page.getByRole("menuitem", { name: "Add Food" }).click();

    const addRow = page.getByTestId("food-add-row");
    await expect(addRow).toBeVisible();
    const input = addRow.getByRole("textbox");
    await input.fill("Mango");
    await input.press("Enter");

    await expect(sidebar).toContainText("Mango");
  });

  test("can cancel adding a food", async ({ page }) => {
    const hint = page.getByText("Right-click to add or delete foods");
    await hint.click({ button: "right" });
    await page.getByRole("menuitem", { name: "Add Food" }).click();

    await expect(page.getByTestId("food-add-row")).toBeVisible();
    await page.getByRole("button", { name: "Cancel" }).click();

    await expect(page.getByTestId("food-add-row")).not.toBeVisible();
  });

  test("can delete a food via context menu", async ({ page }) => {
    const sidebar = page.getByTestId("food-sidebar");
    await expect(sidebar).toContainText("Zucchini");

    await sidebar.getByTestId("food-item-5").click({ button: "right" });
    await page.getByRole("menuitem", { name: /Delete "Zucchini"/ }).click();

    await expect(sidebar).not.toContainText("Zucchini");
  });

  test("nutrients are displayed as cards with name and quantity", async ({ page }) => {
    await page.getByTestId("food-item-1").click();

    const nutrientList = page.getByTestId("food-nutrient-list");
    const proteinCard = nutrientList.getByTestId("food-nutrient-card-1");
    await expect(proteinCard).toBeVisible();
    await expect(proteinCard).toContainText("Protein");
    await expect(proteinCard).toContainText("0.1");
    await expect(proteinCard).toContainText("g/g");

    const fatCard = nutrientList.getByTestId("food-nutrient-card-2");
    await expect(fatCard).toBeVisible();
    await expect(fatCard).toContainText("Fat");
    await expect(fatCard).toContainText("0.2");
  });

  test("selecting a different food clears and loads new data", async ({ page }) => {
    // Select Apple first
    await page.getByTestId("food-item-1").click();
    await expect(page.getByTestId("food-detail")).toContainText("Apple");
    await expect(page.getByTestId("food-nutrient-list")).toContainText("Protein");

    // Select Banana (has no nutrients in mock data)
    await page.getByTestId("food-item-2").click();
    await expect(page.getByTestId("food-detail")).toContainText("Banana");
  });
});
