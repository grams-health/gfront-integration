import { test, expect } from "@playwright/test";

test.describe("Base > Equipment page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/base");
    // Navigate to Equipment section
    await page.getByTestId("base-sidebar").getByText("Equipment").click();
  });

  test("shows the 4 seed equipment items with descriptions", async ({ page }) => {
    const panel = page.getByTestId("detail-panel");
    await expect(panel).toContainText("Pot");
    await expect(panel).toContainText("Pan");
    await expect(panel).toContainText("Colander");
    await expect(panel).toContainText("Knife");
    await expect(panel).toContainText("A cooking implement that can be used for soups");
    await expect(panel).toContainText("A shallow container used for frying");
  });

  test("shows images for equipment", async ({ page }) => {
    const panel = page.getByTestId("equipment-panel");
    const images = panel.locator("img");
    await expect(images).toHaveCount(4);
  });

  test("can add a new equipment item via context menu", async ({ page }) => {
    const hint = page.getByText("Right-click to add or delete equipment");
    await hint.click({ button: "right" });
    await page.getByRole("menuitem", { name: "Add Equipment" }).click();

    await expect(page.getByTestId("equipment-add-row")).toBeVisible();
    await page.getByPlaceholder("Name").fill("Spatula");
    await page.getByPlaceholder("Description").fill("A flat tool for flipping food");
    await page.getByRole("button", { name: "Add" }).click();

    const detailPanel = page.getByTestId("detail-panel");
    await expect(detailPanel).toContainText("Spatula");
    await expect(detailPanel).toContainText("A flat tool for flipping food");
  });

  test("can cancel adding an equipment item", async ({ page }) => {
    const hint = page.getByText("Right-click to add or delete equipment");
    await hint.click({ button: "right" });
    await page.getByRole("menuitem", { name: "Add Equipment" }).click();

    await expect(page.getByTestId("equipment-add-row")).toBeVisible();
    await page.getByRole("button", { name: "Cancel" }).click();

    await expect(page.getByTestId("equipment-add-row")).not.toBeVisible();
  });

  test("can add an equipment item by pressing Enter", async ({ page }) => {
    const hint = page.getByText("Right-click to add or delete equipment");
    await hint.click({ button: "right" });
    await page.getByRole("menuitem", { name: "Add Equipment" }).click();

    await page.getByPlaceholder("Name").fill("Whisk");
    const descInput = page.getByPlaceholder("Description");
    await descInput.fill("A tool for beating and mixing");
    await descInput.press("Enter");

    await expect(page.getByTestId("detail-panel")).toContainText("Whisk");
  });

  test("can cancel adding by pressing Escape", async ({ page }) => {
    const hint = page.getByText("Right-click to add or delete equipment");
    await hint.click({ button: "right" });
    await page.getByRole("menuitem", { name: "Add Equipment" }).click();

    const input = page.getByPlaceholder("Name");
    await input.press("Escape");

    await expect(page.getByTestId("equipment-add-row")).not.toBeVisible();
  });

  test("can delete an equipment item via context menu", async ({ page }) => {
    const panel = page.getByTestId("detail-panel");
    const hint = page.getByText("Right-click to add or delete equipment");

    // Create a temp equipment so we don't destroy seed data
    await hint.click({ button: "right" });
    await page.getByRole("menuitem", { name: "Add Equipment" }).click();
    await page.getByPlaceholder("Name").fill("TempEquipment");
    await page.getByPlaceholder("Description").fill("Temporary equipment");
    await page.getByRole("button", { name: "Add" }).click();
    await expect(panel).toContainText("TempEquipment");

    // Delete it
    const row = panel.getByText("TempEquipment").first();
    await row.click({ button: "right" });
    await page.getByRole("menuitem", { name: /Delete "TempEquipment"/ }).click();

    await expect(panel).not.toContainText("TempEquipment");
  });

  test("can delete multiple equipment items", async ({ page }) => {
    const panel = page.getByTestId("detail-panel");
    const hint = page.getByText("Right-click to add or delete equipment");

    // Create TempE1
    await hint.click({ button: "right" });
    await page.getByRole("menuitem", { name: "Add Equipment" }).click();
    await page.getByPlaceholder("Name").fill("TempE1");
    await page.getByPlaceholder("Description").fill("Temp 1");
    await page.getByRole("button", { name: "Add" }).click();
    await expect(panel).toContainText("TempE1");

    // Create TempE2
    await hint.click({ button: "right" });
    await page.getByRole("menuitem", { name: "Add Equipment" }).click();
    await page.getByPlaceholder("Name").fill("TempE2");
    await page.getByPlaceholder("Description").fill("Temp 2");
    await page.getByRole("button", { name: "Add" }).click();
    await expect(panel).toContainText("TempE2");

    // Delete TempE1
    await panel.getByText("TempE1").first().click({ button: "right" });
    await page.getByRole("menuitem", { name: /Delete "TempE1"/ }).click();
    await expect(panel).not.toContainText("TempE1");

    // Delete TempE2
    await panel.getByText("TempE2").first().click({ button: "right" });
    await page.getByRole("menuitem", { name: /Delete "TempE2"/ }).click();
    await expect(panel).not.toContainText("TempE2");

    // Seed data should still be intact
    await expect(panel).toContainText("Knife");
  });
});
