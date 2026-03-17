import { test, expect } from "@playwright/test";

test.describe("Base > Cook page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/base");
    await page.getByTestId("base-sidebar").getByText("Cook").click();
  });

  test("shows the 4 seed cook actions with descriptions", async ({ page }) => {
    const panel = page.getByTestId("detail-panel");
    await expect(panel).toContainText("Boil");
    await expect(panel).toContainText("Fry");
    await expect(panel).toContainText("Bake");
    await expect(panel).toContainText("Steam");
    await expect(panel).toContainText("Cook food in water or liquid");
    await expect(panel).toContainText("Cook food in hot oil or fat");
  });

  test("can add a new cook action via context menu", async ({ page }) => {
    const hint = page.getByText("Right-click to add or delete cook actions");
    await hint.click({ button: "right" });
    await page.getByRole("menuitem", { name: "Add Cook" }).click();

    await expect(page.getByTestId("cook-add-row")).toBeVisible();
    await page.getByPlaceholder("Name").fill("Grill");
    await page.getByPlaceholder("Description").fill("Cook food over direct heat on a grate");
    await page.getByRole("button", { name: "Add" }).click();

    const detailPanel = page.getByTestId("detail-panel");
    await expect(detailPanel).toContainText("Grill");
    await expect(detailPanel).toContainText("Cook food over direct heat on a grate");
  });

  test("can cancel adding a cook action", async ({ page }) => {
    const hint = page.getByText("Right-click to add or delete cook actions");
    await hint.click({ button: "right" });
    await page.getByRole("menuitem", { name: "Add Cook" }).click();

    await expect(page.getByTestId("cook-add-row")).toBeVisible();
    await page.getByRole("button", { name: "Cancel" }).click();

    await expect(page.getByTestId("cook-add-row")).not.toBeVisible();
  });

  test("can add a cook action by pressing Enter", async ({ page }) => {
    const hint = page.getByText("Right-click to add or delete cook actions");
    await hint.click({ button: "right" });
    await page.getByRole("menuitem", { name: "Add Cook" }).click();

    await page.getByPlaceholder("Name").fill("Roast");
    const descInput = page.getByPlaceholder("Description");
    await descInput.fill("Cook food with dry heat in an oven or over a fire");
    await descInput.press("Enter");

    await expect(page.getByTestId("detail-panel")).toContainText("Roast");
  });

  test("can cancel adding by pressing Escape", async ({ page }) => {
    const hint = page.getByText("Right-click to add or delete cook actions");
    await hint.click({ button: "right" });
    await page.getByRole("menuitem", { name: "Add Cook" }).click();

    const input = page.getByPlaceholder("Name");
    await input.press("Escape");

    await expect(page.getByTestId("cook-add-row")).not.toBeVisible();
  });

  test("can delete a cook action via context menu", async ({ page }) => {
    const panel = page.getByTestId("detail-panel");
    const hint = page.getByText("Right-click to add or delete cook actions");

    // Create a temp cook action so we don't destroy seed data
    await hint.click({ button: "right" });
    await page.getByRole("menuitem", { name: "Add Cook" }).click();
    await page.getByPlaceholder("Name").fill("TempCook");
    await page.getByPlaceholder("Description").fill("Temporary cook action");
    await page.getByRole("button", { name: "Add" }).click();
    await expect(panel).toContainText("TempCook");

    // Delete it
    const row = panel.getByText("TempCook").first();
    await row.click({ button: "right" });
    await page.getByRole("menuitem", { name: /Delete "TempCook"/ }).click();

    await expect(panel).not.toContainText("TempCook");
  });

  test("shows implement dropdowns with correct assignments", async ({ page }) => {
    const panel = page.getByTestId("detail-panel");

    // Boil is assigned to Pot (id 1)
    const boilSelect = panel.getByRole("combobox", { name: "Equipment for Boil" });
    await expect(boilSelect).toHaveValue("1");

    // Bake has no implement
    const bakeSelect = panel.getByRole("combobox", { name: "Equipment for Bake" });
    await expect(bakeSelect).toHaveValue("");
  });

  test("can change implement assignment on a cook action", async ({ page }) => {
    const panel = page.getByTestId("detail-panel");

    // Wait for equipment options to load, then change Bake from None to Pan
    const bakeSelect = panel.getByRole("combobox", { name: "Equipment for Bake" });
    await expect(bakeSelect).toContainText("Pan");
    await bakeSelect.selectOption("2");
    await expect(bakeSelect).toHaveValue("2");
  });

  test("can delete multiple cook actions", async ({ page }) => {
    const panel = page.getByTestId("detail-panel");
    const hint = page.getByText("Right-click to add or delete cook actions");

    // Create TempC1
    await hint.click({ button: "right" });
    await page.getByRole("menuitem", { name: "Add Cook" }).click();
    await page.getByPlaceholder("Name").fill("TempC1");
    await page.getByPlaceholder("Description").fill("Temp 1");
    await page.getByRole("button", { name: "Add" }).click();
    await expect(panel).toContainText("TempC1");

    // Create TempC2
    await hint.click({ button: "right" });
    await page.getByRole("menuitem", { name: "Add Cook" }).click();
    await page.getByPlaceholder("Name").fill("TempC2");
    await page.getByPlaceholder("Description").fill("Temp 2");
    await page.getByRole("button", { name: "Add" }).click();
    await expect(panel).toContainText("TempC2");

    // Delete TempC1
    await panel.getByText("TempC1").first().click({ button: "right" });
    await page.getByRole("menuitem", { name: /Delete "TempC1"/ }).click();
    await expect(panel).not.toContainText("TempC1");

    // Delete TempC2
    await panel.getByText("TempC2").first().click({ button: "right" });
    await page.getByRole("menuitem", { name: /Delete "TempC2"/ }).click();
    await expect(panel).not.toContainText("TempC2");

    // Seed data should still be intact
    await expect(panel).toContainText("Steam");
  });
});
