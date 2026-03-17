import { test, expect } from "@playwright/test";

test.describe("Base > Prepare page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/base");
    await page.getByTestId("base-sidebar").getByText("Prepare").click();
  });

  test("shows the 4 seed preparations with descriptions", async ({ page }) => {
    const panel = page.getByTestId("detail-panel");
    await expect(panel).toContainText("Chop");
    await expect(panel).toContainText("Grate");
    await expect(panel).toContainText("Dice");
    await expect(panel).toContainText("Mince");
    await expect(panel).toContainText("Cut food into small, roughly even pieces");
    await expect(panel).toContainText("Shred food into fine pieces");
  });

  test("can add a new preparation via context menu", async ({ page }) => {
    const hint = page.getByText("Right-click to add or delete preparations");
    await hint.click({ button: "right" });
    await page.getByRole("menuitem", { name: "Add Prepare" }).click();

    await expect(page.getByTestId("prepare-add-row")).toBeVisible();
    await page.getByPlaceholder("Name").fill("Julienne");
    await page.getByPlaceholder("Description").fill("Cut into thin matchstick strips");
    await page.getByRole("button", { name: "Add" }).click();

    const detailPanel = page.getByTestId("detail-panel");
    await expect(detailPanel).toContainText("Julienne");
    await expect(detailPanel).toContainText("Cut into thin matchstick strips");
  });

  test("can cancel adding a preparation", async ({ page }) => {
    const hint = page.getByText("Right-click to add or delete preparations");
    await hint.click({ button: "right" });
    await page.getByRole("menuitem", { name: "Add Prepare" }).click();

    await expect(page.getByTestId("prepare-add-row")).toBeVisible();
    await page.getByRole("button", { name: "Cancel" }).click();

    await expect(page.getByTestId("prepare-add-row")).not.toBeVisible();
  });

  test("can add a preparation by pressing Enter", async ({ page }) => {
    const hint = page.getByText("Right-click to add or delete preparations");
    await hint.click({ button: "right" });
    await page.getByRole("menuitem", { name: "Add Prepare" }).click();

    await page.getByPlaceholder("Name").fill("Peel");
    const descInput = page.getByPlaceholder("Description");
    await descInput.fill("Remove the outer skin of a fruit or vegetable");
    await descInput.press("Enter");

    await expect(page.getByTestId("detail-panel")).toContainText("Peel");
  });

  test("can cancel adding by pressing Escape", async ({ page }) => {
    const hint = page.getByText("Right-click to add or delete preparations");
    await hint.click({ button: "right" });
    await page.getByRole("menuitem", { name: "Add Prepare" }).click();

    const input = page.getByPlaceholder("Name");
    await input.press("Escape");

    await expect(page.getByTestId("prepare-add-row")).not.toBeVisible();
  });

  test("can delete a preparation via context menu", async ({ page }) => {
    const panel = page.getByTestId("detail-panel");
    const hint = page.getByText("Right-click to add or delete preparations");

    // Create a temp preparation so we don't destroy seed data
    await hint.click({ button: "right" });
    await page.getByRole("menuitem", { name: "Add Prepare" }).click();
    await page.getByPlaceholder("Name").fill("TempPrep");
    await page.getByPlaceholder("Description").fill("Temporary preparation");
    await page.getByRole("button", { name: "Add" }).click();
    await expect(panel).toContainText("TempPrep");

    // Delete it
    const row = panel.getByText("TempPrep").first();
    await row.click({ button: "right" });
    await page.getByRole("menuitem", { name: /Delete "TempPrep"/ }).click();

    await expect(panel).not.toContainText("TempPrep");
  });

  test("shows implement dropdowns with correct assignments", async ({ page }) => {
    const panel = page.getByTestId("detail-panel");

    // Chop is assigned to Knife (id 4)
    const chopSelect = panel.getByRole("combobox", { name: "Equipment for Chop" });
    await expect(chopSelect).toHaveValue("4");

    // Grate has no implement
    const grateSelect = panel.getByRole("combobox", { name: "Equipment for Grate" });
    await expect(grateSelect).toHaveValue("");
  });

  test("can change implement assignment on a preparation", async ({ page }) => {
    const panel = page.getByTestId("detail-panel");

    // Wait for equipment options to load, then change Grate from None to Pot
    const grateSelect = panel.getByRole("combobox", { name: "Equipment for Grate" });
    await expect(grateSelect).toContainText("Pot");
    await grateSelect.selectOption("1");
    await expect(grateSelect).toHaveValue("1");
  });

  test("can delete multiple preparations", async ({ page }) => {
    const panel = page.getByTestId("detail-panel");
    const hint = page.getByText("Right-click to add or delete preparations");

    // Create TempP1
    await hint.click({ button: "right" });
    await page.getByRole("menuitem", { name: "Add Prepare" }).click();
    await page.getByPlaceholder("Name").fill("TempP1");
    await page.getByPlaceholder("Description").fill("Temp 1");
    await page.getByRole("button", { name: "Add" }).click();
    await expect(panel).toContainText("TempP1");

    // Create TempP2
    await hint.click({ button: "right" });
    await page.getByRole("menuitem", { name: "Add Prepare" }).click();
    await page.getByPlaceholder("Name").fill("TempP2");
    await page.getByPlaceholder("Description").fill("Temp 2");
    await page.getByRole("button", { name: "Add" }).click();
    await expect(panel).toContainText("TempP2");

    // Delete TempP1
    await panel.getByText("TempP1").first().click({ button: "right" });
    await page.getByRole("menuitem", { name: /Delete "TempP1"/ }).click();
    await expect(panel).not.toContainText("TempP1");

    // Delete TempP2
    await panel.getByText("TempP2").first().click({ button: "right" });
    await page.getByRole("menuitem", { name: /Delete "TempP2"/ }).click();
    await expect(panel).not.toContainText("TempP2");

    // Seed data should still be intact
    await expect(panel).toContainText("Mince");
  });
});
