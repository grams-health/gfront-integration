import { test, expect } from "@playwright/test";

test.describe("Base > Nutrient page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/base");
    // Navigate to the Nutrient section
    const sidebar = page.getByTestId("base-sidebar");
    await sidebar.getByText("Nutrient").click();
  });

  // ── READ ────────────────────────────────────────────────────────

  test("displays all 5 seed nutrients with correct categories", async ({ page }) => {
    const panel = page.getByTestId("detail-panel");

    // Verify all seed nutrients are displayed
    await expect(panel.getByText("Protein")).toBeVisible();
    await expect(panel.getByText("Carbohydrate")).toBeVisible();
    await expect(panel.getByText("Fat")).toBeVisible();
    await expect(panel.getByText("Vitamin A")).toBeVisible();
    await expect(panel.getByText("Lysine")).toBeVisible();

    // Verify category labels are shown alongside nutrients
    const macroLabels = panel.getByText("Macronutrient");
    await expect(macroLabels.first()).toBeVisible();

    await expect(panel.getByText("Micronutrient")).toBeVisible();
    await expect(panel.getByText("Amino Acid")).toBeVisible();
  });

  test("each nutrient card shows category and name separated by a divider", async ({ page }) => {
    const panel = page.getByTestId("detail-panel");

    // Check that the first card contains both category and nutrient name
    const firstCard = panel.locator("[data-testid='nutrient-card-1']");
    await expect(firstCard).toContainText("Macronutrient");
    await expect(firstCard).toContainText("Protein");
  });

  // ── CREATE ──────────────────────────────────────────────────────

  test("can add a new nutrient via context menu", async ({ page }) => {
    const panel = page.getByTestId("detail-panel");

    // Right-click on the hint text (empty area below cards) to open context menu
    const hint = page.getByText("Right-click to add or remove");
    await hint.click({ button: "right" });

    // Click "Add Nutrient" in the context menu
    await page.getByRole("menuitem", { name: "Add Nutrient" }).click();

    // The add row should appear
    await expect(page.getByTestId("nutrient-add-row")).toBeVisible();

    // Fill in the nutrient name
    await page.getByLabel("New nutrient name").fill("Vitamin C");

    // Click Add
    await page.getByRole("button", { name: "Add" }).click();

    // Verify the new nutrient appears in the list
    await expect(panel.getByText("Vitamin C")).toBeVisible();
  });

  test("can add a nutrient with a specific category", async ({ page }) => {
    const panel = page.getByTestId("detail-panel");

    // Right-click on empty area
    const hint = page.getByText("Right-click to add or remove");
    await hint.click({ button: "right" });
    await page.getByRole("menuitem", { name: "Add Nutrient" }).click();

    // Select "Amino Acid" category
    await page.getByLabel("New nutrient category").selectOption("Amino Acid");

    // Fill name
    await page.getByLabel("New nutrient name").fill("Tryptophan");
    await page.getByRole("button", { name: "Add" }).click();

    // Verify it appears
    await expect(panel.getByText("Tryptophan")).toBeVisible();
  });

  test("can cancel adding a nutrient", async ({ page }) => {
    // Right-click on empty area
    const hint = page.getByText("Right-click to add or remove");
    await hint.click({ button: "right" });
    await page.getByRole("menuitem", { name: "Add Nutrient" }).click();

    await expect(page.getByTestId("nutrient-add-row")).toBeVisible();

    // Click cancel
    await page.getByRole("button", { name: "Cancel" }).click();

    // Add row should disappear
    await expect(page.getByTestId("nutrient-add-row")).not.toBeVisible();
  });

  // ── UPDATE ──────────────────────────────────────────────────────

  test("can edit a nutrient name by clicking the card", async ({ page }) => {
    const panel = page.getByTestId("detail-panel");

    // Click on the "Protein" card to start editing
    const proteinCard = panel.locator("[data-testid='nutrient-card-1']");
    await proteinCard.click();

    // The edit input should appear with the current name
    const nameInput = page.getByLabel("Nutrient name");
    await expect(nameInput).toBeVisible();
    await expect(nameInput).toHaveValue("Protein");

    // Clear and type new name
    await nameInput.clear();
    await nameInput.fill("Whey Protein");

    // Save
    await page.getByRole("button", { name: "Save" }).click();

    // Verify updated name
    await expect(panel.getByText("Whey Protein")).toBeVisible();
    await expect(panel.getByText("Protein", { exact: true })).not.toBeVisible();
  });

  test("can change a nutrient category via dropdown", async ({ page }) => {
    const panel = page.getByTestId("detail-panel");

    // Click on Lysine card (category_id: 3 = Amino Acid)
    const lysineCard = panel.locator("[data-testid='nutrient-card-5']");
    await lysineCard.click();

    // Change category to Micronutrient
    const categorySelect = page.getByLabel("Nutrient category");
    await categorySelect.selectOption("Micronutrient");

    // Save
    await page.getByRole("button", { name: "Save" }).click();

    // After save, the card should show "Micronutrient" as category for Lysine
    const updatedCard = panel.locator("[data-testid='nutrient-card-5']");
    await expect(updatedCard).toContainText("Micronutrient");
    await expect(updatedCard).toContainText("Lysine");
  });

  test("can cancel editing a nutrient", async ({ page }) => {
    const panel = page.getByTestId("detail-panel");

    // Click on Protein card
    const card = panel.locator("[data-testid='nutrient-card-1']");
    await card.click();

    // Modify the name
    const nameInput = page.getByLabel("Nutrient name");
    await nameInput.clear();
    await nameInput.fill("Changed Name");

    // Cancel
    await page.getByRole("button", { name: "Cancel" }).click();

    // Original name should still be shown
    await expect(panel.getByText("Protein")).toBeVisible();
    await expect(panel.getByText("Changed Name")).not.toBeVisible();
  });

  test("can save an edit by pressing Enter", async ({ page }) => {
    const panel = page.getByTestId("detail-panel");

    const card = panel.locator("[data-testid='nutrient-card-3']");
    await card.click();

    const nameInput = page.getByLabel("Nutrient name");
    await nameInput.clear();
    await nameInput.fill("Healthy Fat");
    await nameInput.press("Enter");

    await expect(panel.getByText("Healthy Fat")).toBeVisible();
  });

  test("can cancel an edit by pressing Escape", async ({ page }) => {
    const panel = page.getByTestId("detail-panel");

    const card = panel.locator("[data-testid='nutrient-card-2']");
    await card.click();

    const nameInput = page.getByLabel("Nutrient name");
    await nameInput.clear();
    await nameInput.fill("Something Else");
    await nameInput.press("Escape");

    await expect(panel.getByText("Carbohydrate")).toBeVisible();
    await expect(panel.getByText("Something Else")).not.toBeVisible();
  });

  // ── DELETE ──────────────────────────────────────────────────────

  test("can delete a nutrient via context menu", async ({ page }) => {
    const panel = page.getByTestId("detail-panel");
    const hint = page.getByText("Right-click to add or remove");

    // Create a temp nutrient so we don't destroy seed data
    await hint.click({ button: "right" });
    await page.getByRole("menuitem", { name: "Add Nutrient" }).click();
    await page.getByLabel("New nutrient name").fill("TempNutrient");
    await page.getByRole("button", { name: "Add" }).click();
    await expect(panel.getByText("TempNutrient")).toBeVisible();

    // Right-click on TempNutrient to delete it
    await panel.getByText("TempNutrient").click({ button: "right" });
    await page.getByRole("menuitem", { name: /Remove "TempNutrient"/ }).click();

    // Verify it's gone
    await expect(panel.getByText("TempNutrient")).not.toBeVisible();
  });

  test("can delete multiple nutrients", async ({ page }) => {
    const panel = page.getByTestId("detail-panel");
    const hint = page.getByText("Right-click to add or remove");

    // Create TempN1
    await hint.click({ button: "right" });
    await page.getByRole("menuitem", { name: "Add Nutrient" }).click();
    await page.getByLabel("New nutrient name").fill("TempN1");
    await page.getByRole("button", { name: "Add" }).click();
    await expect(panel.getByText("TempN1")).toBeVisible();

    // Create TempN2
    await hint.click({ button: "right" });
    await page.getByRole("menuitem", { name: "Add Nutrient" }).click();
    await page.getByLabel("New nutrient name").fill("TempN2");
    await page.getByRole("button", { name: "Add" }).click();
    await expect(panel.getByText("TempN2")).toBeVisible();

    // Delete TempN1
    await panel.getByText("TempN1").click({ button: "right" });
    await page.getByRole("menuitem", { name: /Remove "TempN1"/ }).click();
    await expect(panel.getByText("TempN1")).not.toBeVisible();

    // Delete TempN2
    await panel.getByText("TempN2").click({ button: "right" });
    await page.getByRole("menuitem", { name: /Remove "TempN2"/ }).click();
    await expect(panel.getByText("TempN2")).not.toBeVisible();

    // Seed data should still have some nutrients
    await expect(panel.getByText("Carbohydrate")).toBeVisible();
  });
});
