import { test, expect } from "@playwright/test";

test.describe("Base > Restriction page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/base");
    // Navigate to Restriction section
    await page.getByTestId("base-sidebar").getByText("Restriction").click();
  });

  test("shows the 3 seed restrictions", async ({ page }) => {
    const panel = page.getByTestId("detail-panel");
    await expect(panel).toContainText("Dairy");
    await expect(panel).toContainText("Peanut");
    await expect(panel).toContainText("Almond");
  });

  test("can add a new restriction via context menu", async ({ page }) => {
    const hint = page.getByText("Right-click to add or delete restrictions");
    await hint.click({ button: "right" });
    await page.getByRole("menuitem", { name: "Add Restriction" }).click();

    await expect(page.getByTestId("restriction-add-row")).toBeVisible();
    await page.getByPlaceholder("Restriction name").fill("Gluten");
    await page.getByRole("button", { name: "Add" }).click();

    await expect(page.getByTestId("detail-panel")).toContainText("Gluten");
  });

  test("can cancel adding a restriction", async ({ page }) => {
    const hint = page.getByText("Right-click to add or delete restrictions");
    await hint.click({ button: "right" });
    await page.getByRole("menuitem", { name: "Add Restriction" }).click();

    await expect(page.getByTestId("restriction-add-row")).toBeVisible();
    await page.getByRole("button", { name: "Cancel" }).click();

    await expect(page.getByTestId("restriction-add-row")).not.toBeVisible();
  });

  test("can add a restriction by pressing Enter", async ({ page }) => {
    const hint = page.getByText("Right-click to add or delete restrictions");
    await hint.click({ button: "right" });
    await page.getByRole("menuitem", { name: "Add Restriction" }).click();

    const input = page.getByPlaceholder("Restriction name");
    await input.fill("Soy");
    await input.press("Enter");

    await expect(page.getByTestId("detail-panel")).toContainText("Soy");
  });

  test("can cancel adding by pressing Escape", async ({ page }) => {
    const hint = page.getByText("Right-click to add or delete restrictions");
    await hint.click({ button: "right" });
    await page.getByRole("menuitem", { name: "Add Restriction" }).click();

    const input = page.getByPlaceholder("Restriction name");
    await input.press("Escape");

    await expect(page.getByTestId("restriction-add-row")).not.toBeVisible();
  });

  test("can delete a restriction via context menu", async ({ page }) => {
    const panel = page.getByTestId("detail-panel");
    const hint = page.getByText("Right-click to add or delete restrictions");

    // Create a temp restriction so we don't destroy seed data
    await hint.click({ button: "right" });
    await page.getByRole("menuitem", { name: "Add Restriction" }).click();
    await page.getByPlaceholder("Restriction name").fill("TempRestriction");
    await page.getByRole("button", { name: "Add" }).click();
    await expect(panel).toContainText("TempRestriction");

    // Delete it
    const row = panel.getByText("TempRestriction");
    await row.click({ button: "right" });
    await page.getByRole("menuitem", { name: /Delete "TempRestriction"/ }).click();

    await expect(panel).not.toContainText("TempRestriction");
  });

  test("can delete multiple restrictions", async ({ page }) => {
    const panel = page.getByTestId("detail-panel");
    const hint = page.getByText("Right-click to add or delete restrictions");

    // Create TempA
    await hint.click({ button: "right" });
    await page.getByRole("menuitem", { name: "Add Restriction" }).click();
    await page.getByPlaceholder("Restriction name").fill("TempA");
    await page.getByRole("button", { name: "Add" }).click();
    await expect(panel).toContainText("TempA");

    // Create TempB
    await hint.click({ button: "right" });
    await page.getByRole("menuitem", { name: "Add Restriction" }).click();
    await page.getByPlaceholder("Restriction name").fill("TempB");
    await page.getByRole("button", { name: "Add" }).click();
    await expect(panel).toContainText("TempB");

    // Delete TempA
    await panel.getByText("TempA").click({ button: "right" });
    await page.getByRole("menuitem", { name: /Delete "TempA"/ }).click();
    await expect(panel).not.toContainText("TempA");

    // Delete TempB
    await panel.getByText("TempB").click({ button: "right" });
    await page.getByRole("menuitem", { name: /Delete "TempB"/ }).click();
    await expect(panel).not.toContainText("TempB");

    // Seed data should still be intact
    await expect(panel).toContainText("Dairy");
  });
});
