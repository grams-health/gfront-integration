"""Seed 0_admin with test data matching the frontend mock data.

All seeding is done via REST API calls.
"""
import requests


def _post(base_url, path, json_body, expected_status=201):
    resp = requests.post(f"{base_url}{path}", json=json_body)
    assert resp.status_code == expected_status, (
        f"POST {base_url}{path} returned {resp.status_code}: {resp.text}\n"
        f"Body: {json_body}"
    )
    return resp.json()


def seed_admin(admin_url):
    """Seed admin data matching gfront/admin/src/mocks/data.ts."""

    # Food types: Fruit(1), Vegetable(2), Grain(3)
    _post(admin_url, "/food_types", {"type_name": "Fruit"})
    _post(admin_url, "/food_types", {"type_name": "Vegetable"})
    _post(admin_url, "/food_types", {"type_name": "Grain"})

    # Foods: Apple(1), Banana(2), Bread(3), Carrot(4), Zucchini(5)
    _post(admin_url, "/foods", {"food_name": "Apple", "type_id": 1})
    _post(admin_url, "/foods", {"food_name": "Banana", "type_id": 1})
    _post(admin_url, "/foods", {"food_name": "Bread", "type_id": 3})
    _post(admin_url, "/foods", {"food_name": "Carrot", "type_id": 2})
    _post(admin_url, "/foods", {"food_name": "Zucchini", "type_id": 2})

    # Nutrients: Protein(1), Carbohydrate(2), Fat(3), Vitamin A(4), Lysine(5)
    _post(admin_url, "/nutrients", {"nutrient_name": "Protein"})
    _post(admin_url, "/nutrients", {"nutrient_name": "Carbohydrate"})
    _post(admin_url, "/nutrients", {"nutrient_name": "Fat"})
    _post(admin_url, "/nutrients", {"nutrient_name": "Vitamin A"})
    _post(admin_url, "/nutrients", {"nutrient_name": "Lysine"})

    # Restrictions: Dairy(1), Peanut(2), Almond(3)
    _post(admin_url, "/restrictions", {"restriction_name": "Dairy"})
    _post(admin_url, "/restrictions", {"restriction_name": "Peanut"})
    _post(admin_url, "/restrictions", {"restriction_name": "Almond"})

    # Food nutrients (Apple: Protein=0.1, Fat=0.2, Carbohydrate=0.8)
    _post(admin_url, "/food_nutrients", {"food_id": 1, "nutrient_id": 1, "quantity": 0.1})
    _post(admin_url, "/food_nutrients", {"food_id": 1, "nutrient_id": 3, "quantity": 0.2})
    _post(admin_url, "/food_nutrients", {"food_id": 1, "nutrient_id": 2, "quantity": 0.8})

    # Food restrictions (Apple -> Peanut)
    _post(admin_url, "/food_restrictions", {"food_id": 1, "restriction_id": 2})

    # Equipment: Pot(1), Pan(2), Colander(3), Knife(4)
    _post(admin_url, "/equipment", {"equipment_name": "Pot"})
    _post(admin_url, "/equipment", {"equipment_name": "Pan"})
    _post(admin_url, "/equipment", {"equipment_name": "Colander"})
    _post(admin_url, "/equipment", {"equipment_name": "Knife"})

    # Preparations: Chop(1), Grate(2), Dice(3), Mince(4)
    _post(admin_url, "/preparations", {"preparation_name": "Chop", "description": "Cut food into small, roughly even pieces using a knife."})
    _post(admin_url, "/preparations", {"preparation_name": "Grate", "description": "Shred food into fine pieces by rubbing it against a grater."})
    _post(admin_url, "/preparations", {"preparation_name": "Dice", "description": "Cut food into small, uniform cube-shaped pieces."})
    _post(admin_url, "/preparations", {"preparation_name": "Mince", "description": "Cut or chop food into very small, fine pieces."})

    # Cook operations: Boil(1), Fry(2), Bake(3), Steam(4)
    _post(admin_url, "/cook_operations", {"operation_name": "Boil", "operation_instructions": "Cook food in water or liquid heated to its boiling point."})
    _post(admin_url, "/cook_operations", {"operation_name": "Fry", "operation_instructions": "Cook food in hot oil or fat in a pan."})
    _post(admin_url, "/cook_operations", {"operation_name": "Bake", "operation_instructions": "Cook food using dry heat in an oven."})
    _post(admin_url, "/cook_operations", {"operation_name": "Steam", "operation_instructions": "Cook food using the vapor from boiling water."})

    # Dishes: Chicken Stir Fry(1), Vegetable Soup(2), Pasta Primavera(3)
    _post(admin_url, "/dishes", {"dish_name": "Chicken Stir Fry", "description": "A quick stir fry with chicken and vegetables"})
    _post(admin_url, "/dishes", {"dish_name": "Vegetable Soup", "description": "Hearty vegetable soup"})
    _post(admin_url, "/dishes", {"dish_name": "Pasta Primavera"})

    # Ingredients
    _post(admin_url, "/ingredients", {"dish_id": 1, "food_id": 4, "quantity": 150, "preparation_id": 1})  # Carrot, chopped
    _post(admin_url, "/ingredients", {"dish_id": 1, "food_id": 5, "quantity": 200, "preparation_id": 3})  # Zucchini, diced
    _post(admin_url, "/ingredients", {"dish_id": 1, "food_id": 3, "quantity": 50, "preparation_id": 4})   # Bread, minced
    _post(admin_url, "/ingredients", {"dish_id": 2, "food_id": 4, "quantity": 100, "preparation_id": 1})  # Carrot, chopped
    _post(admin_url, "/ingredients", {"dish_id": 2, "food_id": 5, "quantity": 100, "preparation_id": 3})  # Zucchini, diced
    _post(admin_url, "/ingredients", {"dish_id": 2, "food_id": 1, "quantity": 50, "preparation_id": 1})   # Apple, chopped

    # Dish bounds
    _post(admin_url, "/dish_bounds", {"dish_id": 1, "max_quantity": 500, "min_quantity": 350})
    _post(admin_url, "/dish_bounds", {"dish_id": 2, "max_quantity": 600, "min_quantity": 400})

    # Dish conversions
    _post(admin_url, "/dish_conversions", {"dish_id": 1, "raw_weight": 450, "cooked_weight": 380})
    _post(admin_url, "/dish_conversions", {"dish_id": 2, "raw_weight": 500, "cooked_weight": 480})

    # Containers
    _post(admin_url, "/containers", {"dish_id": 1, "container_name": "Veggie Bowl", "abstract_container_id": 101})
    _post(admin_url, "/containers", {"dish_id": 1, "container_name": "Sauteed Veggies", "abstract_container_id": 102})
    _post(admin_url, "/containers", {"dish_id": 1, "container_name": "Final Plate", "abstract_container_id": 103})
    _post(admin_url, "/containers", {"dish_id": 2, "container_name": "Soup Base", "abstract_container_id": 104})
    _post(admin_url, "/containers", {"dish_id": 2, "container_name": "Finished Soup", "abstract_container_id": 105})

    # Container ingredients
    _post(admin_url, "/container_ingredients", {"container_id": 1, "ingredient_id": 1, "quantity": 150})
    _post(admin_url, "/container_ingredients", {"container_id": 1, "ingredient_id": 2, "quantity": 200})
    _post(admin_url, "/container_ingredients", {"container_id": 1, "ingredient_id": 3, "quantity": 50})
    _post(admin_url, "/container_ingredients", {"container_id": 4, "ingredient_id": 4, "quantity": 100})
    _post(admin_url, "/container_ingredients", {"container_id": 4, "ingredient_id": 5, "quantity": 100})
    _post(admin_url, "/container_ingredients", {"container_id": 4, "ingredient_id": 6, "quantity": 50})

    # Dish cook steps
    _post(admin_url, "/dish_cook_steps", {"dish_id": 1, "operation_id": 2, "step_number": 1, "step_name": "Fry Vegetables"})
    _post(admin_url, "/dish_cook_steps", {"dish_id": 1, "operation_id": 2, "step_number": 2, "step_name": "Combine & Plate"})
    _post(admin_url, "/dish_cook_steps", {"dish_id": 2, "operation_id": 1, "step_number": 1, "step_name": "Boil Vegetables"})
    _post(admin_url, "/dish_cook_steps", {"dish_id": 2, "operation_id": 4, "step_number": 2, "step_name": "Steam Finish"})

    # Cook step outputs
    _post(admin_url, "/dish_cook_step_outputs", {"step_id": 1, "output_name": "Sauteed Veggies"})
    _post(admin_url, "/dish_cook_step_outputs", {"step_id": 2, "output_name": "Final Plate"})
    _post(admin_url, "/dish_cook_step_outputs", {"step_id": 3, "output_name": "Finished Soup"})

    # Cook step container assignments
    _post(admin_url, "/cook_step_container_assignments", {"step_id": 1, "abstract_container_id": 101})
    _post(admin_url, "/cook_step_container_assignments", {"step_id": 2, "abstract_container_id": 102})
    _post(admin_url, "/cook_step_container_assignments", {"step_id": 3, "abstract_container_id": 104})
    _post(admin_url, "/cook_step_container_assignments", {"step_id": 4, "abstract_container_id": 105})

    # Equipment cook step assignments
    _post(admin_url, "/equipment_dish_cook_step_assignments", {"step_id": 1, "equipment_id": 2})  # Pan for frying
    _post(admin_url, "/equipment_dish_cook_step_assignments", {"step_id": 1, "equipment_id": 4})  # Knife
    _post(admin_url, "/equipment_dish_cook_step_assignments", {"step_id": 3, "equipment_id": 1})  # Pot for boiling
    _post(admin_url, "/equipment_dish_cook_step_assignments", {"step_id": 4, "equipment_id": 1})  # Pot for steaming
