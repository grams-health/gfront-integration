import { test, expect } from "@playwright/test";

test.describe("Dish details tab", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/dish");
    // Select the Chicken Stir Fry dish
    await page.getByTestId("dish-item-1").click();
    await expect(page.getByTestId("dish-content")).toBeVisible();
    // Switch to Details tab
    await page.getByTestId("dish-details-tab").click();
  });

  test("shows dish details content", async ({ page }) => {
    await expect(page.getByTestId("dish-details-tab-content")).toBeVisible();
  });

  test("shows image upload area", async ({ page }) => {
    const imageArea = page.getByTestId("dish-image-area");
    await expect(imageArea).toBeVisible();
    await expect(imageArea).toContainText("Drop image or click to upload");
  });

  test("shows description field with current value", async ({ page }) => {
    const description = page.getByTestId("dish-description");
    await expect(description).toBeVisible();
    await expect(description).toContainText("A quick stir fry with chicken and vegetables");
  });

  test("can edit dish description", async ({ page }) => {
    const description = page.getByTestId("dish-description");
    await description.click();

    const textarea = description.getByRole("textbox");
    await expect(textarea).toBeVisible();
    await textarea.fill("Updated description");
    await textarea.blur();

    await expect(description).toContainText("Updated description");
  });

  test("shows weight bounds", async ({ page }) => {
    const bounds = page.getByTestId("dish-bounds");
    await expect(bounds).toBeVisible();
    await expect(bounds).toContainText("Weight Bounds");
  });

  test("shows raw/cooked conversion", async ({ page }) => {
    const conversion = page.getByTestId("dish-conversion");
    await expect(conversion).toBeVisible();
    await expect(conversion).toContainText("Raw / Cooked Conversion");
  });

  test("shows nutrients list (read-only)", async ({ page }) => {
    const nutrientList = page.getByTestId("dish-nutrient-list");
    await expect(nutrientList).toBeVisible();
    await expect(nutrientList).toContainText("Nutrients");
    await expect(nutrientList).toContainText("Protein");
    await expect(nutrientList).toContainText("25");
  });

  test("shows restrictions list (read-only)", async ({ page }) => {
    const restrictionList = page.getByTestId("dish-restriction-list");
    await expect(restrictionList).toBeVisible();
    await expect(restrictionList).toContainText("Restrictions");
    await expect(restrictionList).toContainText("Peanut");
  });
});
