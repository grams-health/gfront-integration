import { test, expect } from "@playwright/test";

test.describe("Dish builder tab", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/dish");
    // Select the Chicken Stir Fry dish
    await page.getByTestId("dish-item-1").click();
    await expect(page.getByTestId("dish-content")).toBeVisible();
  });

  test("shows the graph canvas, detail pane hidden until selection", async ({ page }) => {
    await expect(page.getByTestId("dish-graph")).toBeVisible();
    await expect(page.getByTestId("node-detail-pane")).not.toBeVisible();
  });

  test("detail pane is hidden when no node is selected", async ({ page }) => {
    await expect(page.getByTestId("node-detail-pane")).not.toBeVisible();
  });

  test("right-click canvas shows context menu with Add Container and Add Step", async ({ page }) => {
    const graph = page.getByTestId("dish-graph");
    // Click on a clearly empty area of the ReactFlow pane (bottom-right corner)
    const pane = graph.locator(".react-flow__pane");
    await pane.click({ button: "right", position: { x: 10, y: 10 } });

    await expect(page.getByRole("menuitem", { name: "Add Container" })).toBeVisible();
    await expect(page.getByRole("menuitem", { name: "Add Step" })).toBeVisible();
  });

  test("right-click canvas → Add Container creates a container node", async ({ page }) => {
    const graph = page.getByTestId("dish-graph");
    const pane = graph.locator(".react-flow__pane");
    await pane.click({ button: "right", position: { x: 10, y: 10 } });
    await page.getByRole("menuitem", { name: "Add Container" }).click();

    // New container should appear in the graph
    await expect(graph).toContainText("New Container");
  });

  test("right-click canvas → Add Step creates a step node", async ({ page }) => {
    const graph = page.getByTestId("dish-graph");
    // Wait for existing step nodes to load so step_number is computed correctly
    await expect(graph).toContainText("Fry Vegetables");
    const pane = graph.locator(".react-flow__pane");
    await pane.click({ button: "right", position: { x: 10, y: 10 } });
    await page.getByRole("menuitem", { name: "Add Step" }).click();

    // New step should appear in the graph
    await expect(graph).toContainText("New Step");
  });

  test("clicking a container node shows container detail", async ({ page }) => {
    // Click on an existing container node
    const containerNode = page.getByTestId("container-node-1");
    await containerNode.click();

    const detailPane = page.getByTestId("node-detail-pane");
    await expect(page.getByTestId("container-detail")).toBeVisible();
    await expect(detailPane).toContainText("Veggie Bowl");
  });

  test("clicking a step node shows step detail", async ({ page }) => {
    // Click on an existing step node
    const stepNode = page.getByTestId("step-node-1");
    await stepNode.click();

    const detailPane = page.getByTestId("node-detail-pane");
    await expect(page.getByTestId("step-detail")).toBeVisible();
    await expect(detailPane).toContainText("Fry Vegetables");
  });

  test("step detail shows equipment list", async ({ page }) => {
    const stepNode = page.getByTestId("step-node-1");
    await stepNode.click();

    const equipmentList = page.getByTestId("step-equipment-list");
    await expect(equipmentList).toBeVisible();
    await expect(equipmentList).toContainText("Equipment");
    await expect(equipmentList).toContainText("Pan");
  });

  test("container detail shows foods list", async ({ page }) => {
    const containerNode = page.getByTestId("container-node-1");
    await containerNode.click();

    const foodList = page.getByTestId("container-food-list");
    await expect(foodList).toBeVisible();
    await expect(foodList).toContainText("Foods");
    await expect(foodList).toContainText("Carrot");
  });

  test("right-click node shows delete context menu", async ({ page }) => {
    const containerNode = page.getByTestId("container-node-1");
    // Right-click directly on the node element
    await containerNode.click({ button: "right", force: true });

    await expect(page.getByRole("menuitem", { name: /Delete "Veggie Bowl"/ })).toBeVisible();
  });
});
