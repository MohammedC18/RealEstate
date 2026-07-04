"""Aayat Real Estate Phase 1 backend tests."""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://estate-portal-121.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"
ADMIN_EMAIL = "admin@aayat.com"
ADMIN_PASSWORD = "aayat2026"


@pytest.fixture(scope="session")
def admin_token():
    r = requests.post(f"{API}/admin/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}, timeout=15)
    assert r.status_code == 200, r.text
    data = r.json()
    assert "token" in data
    return data["token"]


@pytest.fixture
def admin_headers(admin_token):
    return {"X-Admin-Token": admin_token, "Content-Type": "application/json"}


# ---------- Properties ----------
class TestProperties:
    def test_list_properties(self):
        r = requests.get(f"{API}/properties", timeout=15)
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list) and len(data) > 0
        assert "id" in data[0]

    def test_get_property_increments_views(self):
        props = requests.get(f"{API}/properties", timeout=15).json()
        pid = props[0]["id"]
        r1 = requests.get(f"{API}/properties/{pid}", timeout=15)
        assert r1.status_code == 200
        v1 = r1.json().get("views", 0)
        r2 = requests.get(f"{API}/properties/{pid}", timeout=15)
        v2 = r2.json().get("views", 0)
        assert v2 > v1, f"views did not increment: {v1} -> {v2}"

    def test_create_requires_admin(self):
        r = requests.post(f"{API}/properties", json={"name": "X"}, timeout=15)
        assert r.status_code in (401, 403)

    def test_property_crud(self, admin_headers):
        payload = {
            "name": "TEST_Property",
            "tagline": "test",
            "type": "apartment",
            "location": "Bandra West",
            "price": "₹ 1 Cr",
            "price_numeric": 10000000,
            "bhk": 2,
            "area_sqft": 900,
            "status": "ready",
            "collection": "luxury",
            "images": ["data:image/png;base64,iVBORw0KGgo="],
            "description": "test",
        }
        r = requests.post(f"{API}/properties", json=payload, headers=admin_headers, timeout=15)
        assert r.status_code in (200, 201), r.text
        pid = r.json()["id"]

        # GET verify
        g = requests.get(f"{API}/properties/{pid}", timeout=15)
        assert g.status_code == 200
        assert g.json()["name"] == "TEST_Property"

        # UPDATE (PUT requires full Property model)
        full = g.json()
        full["name"] = "TEST_Property_Updated"
        u = requests.put(f"{API}/properties/{pid}", json=full, headers=admin_headers, timeout=15)
        assert u.status_code == 200, u.text
        g2 = requests.get(f"{API}/properties/{pid}", timeout=15)
        assert g2.json()["name"] == "TEST_Property_Updated"

        # DELETE
        d = requests.delete(f"{API}/properties/{pid}", headers=admin_headers, timeout=15)
        assert d.status_code in (200, 204)
        g3 = requests.get(f"{API}/properties/{pid}", timeout=15)
        assert g3.status_code == 404


# ---------- Settings ----------
class TestSettings:
    def test_get_settings(self):
        r = requests.get(f"{API}/settings", timeout=15)
        assert r.status_code == 200
        d = r.json()
        for k in ("hero_headline", "about_headline", "footer_tagline"):
            assert k in d, f"missing {k}"

    def test_update_settings(self, admin_headers):
        r = requests.put(f"{API}/settings", json={"hero_headline": "Live Mumbai."}, headers=admin_headers, timeout=15)
        assert r.status_code == 200
        assert r.json()["hero_headline"] == "Live Mumbai."


# ---------- Leads ----------
class TestLeads:
    def test_lead_flow(self, admin_headers):
        payload = {"full_name": "TEST_Lead", "phone": "9999999999", "email": "t@test.com", "source": "website"}
        c = requests.post(f"{API}/leads", json=payload, timeout=15)
        assert c.status_code in (200, 201), c.text
        lid = c.json()["id"]

        # list (admin only)
        no_auth = requests.get(f"{API}/leads", timeout=15)
        assert no_auth.status_code in (401, 403)
        l = requests.get(f"{API}/leads", headers=admin_headers, timeout=15)
        assert l.status_code == 200
        assert any(x["id"] == lid for x in l.json())

        # update status
        u = requests.put(f"{API}/leads/{lid}", json={"status": "contacted"}, headers=admin_headers, timeout=15)
        assert u.status_code == 200

        # delete
        d = requests.delete(f"{API}/leads/{lid}", headers=admin_headers, timeout=15)
        assert d.status_code in (200, 204)


# ---------- Analytics ----------
class TestAnalytics:
    def test_analytics_requires_admin(self):
        r = requests.get(f"{API}/admin/analytics", timeout=15)
        assert r.status_code in (401, 403)

    def test_analytics_shape(self, admin_headers):
        r = requests.get(f"{API}/admin/analytics", headers=admin_headers, timeout=15)
        assert r.status_code == 200, r.text
        d = r.json()
        assert "kpis" in d
        for k in ("properties", "total_leads", "new_leads", "total_views"):
            assert k in d["kpis"], f"missing kpi {k}"
        for k in ("leads_series", "leads_by_source", "leads_by_status", "props_by_type", "top_views"):
            assert k in d, f"missing {k}"
        assert isinstance(d["leads_series"], list)
        assert len(d["leads_series"]) == 30, f"expected 30 items, got {len(d['leads_series'])}"


# ---------- Testimonials / FAQs ----------
class TestCMS:
    def test_testimonials(self, admin_headers):
        r = requests.get(f"{API}/testimonials", timeout=15)
        assert r.status_code == 200
        c = requests.post(f"{API}/testimonials",
                          json={"name": "TEST_T", "role": "Buyer", "quote": "great", "rating": 5},
                          headers=admin_headers, timeout=15)
        assert c.status_code in (200, 201), c.text
        tid = c.json()["id"]
        d = requests.delete(f"{API}/testimonials/{tid}", headers=admin_headers, timeout=15)
        assert d.status_code in (200, 204)

    def test_faqs(self, admin_headers):
        r = requests.get(f"{API}/faqs", timeout=15)
        assert r.status_code == 200
        c = requests.post(f"{API}/faqs",
                          json={"question": "TEST_Q?", "answer": "A"},
                          headers=admin_headers, timeout=15)
        assert c.status_code in (200, 201), c.text
        fid = c.json()["id"]
        d = requests.delete(f"{API}/faqs/{fid}", headers=admin_headers, timeout=15)
        assert d.status_code in (200, 204)
