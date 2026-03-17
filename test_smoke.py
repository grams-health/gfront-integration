"""Smoke tests — verify backends are up, seeded, and routable through gateway."""
import requests


class TestBackendSmoke:

    def test_gateway_health(self, gateway_url):
        resp = requests.get(f"{gateway_url}/health")
        assert resp.status_code == 200
        data = resp.json()
        assert data["services"]["admin"] == "up"
        assert data["services"]["images"] == "up"

    def test_admin_nutrients_via_gateway(self, gateway_url):
        resp = requests.get(f"{gateway_url}/admin/admin/nutrients")
        assert resp.status_code == 200
        data = resp.json()
        assert len(data) == 5
        names = {n["nutrient_name"] for n in data}
        assert "Protein" in names
        assert "Lysine" in names

    def test_admin_dishes_via_gateway(self, gateway_url):
        resp = requests.get(f"{gateway_url}/admin/admin/dishes")
        assert resp.status_code == 200
        data = resp.json()
        assert len(data) == 3

    def test_admin_foods_via_gateway(self, gateway_url):
        resp = requests.get(f"{gateway_url}/admin/admin/foods")
        assert resp.status_code == 200
        data = resp.json()
        assert len(data) == 5

    def test_images_health_via_gateway(self, gateway_url):
        resp = requests.get(f"{gateway_url}/admin/images/")
        assert resp.status_code == 200
