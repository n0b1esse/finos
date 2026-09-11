"""Credits: payment math and validation.

Payments only shrink the outstanding balance (unlike goal contributions,
negatives make no sense here), the balance floors at zero instead of going
negative on overpayment, and a fully repaid credit reports is_paid.
"""
from httpx import AsyncClient

from tests.helpers import money

_CREDIT = {
    "name": "Car loan",
    "credit_type": "auto",
    "total_amount": "10000",
    "annual_rate": "12.5",
    "monthly_payment": "500",
    "start_date": "2026-01-01",
}


async def _credit(client: AsyncClient, **overrides) -> dict:
    payload = {**_CREDIT, **overrides}
    resp = await client.post("/credits", json=payload)
    assert resp.status_code == 201, resp.text
    return resp.json()


async def test_create_credit_reports_full_remaining(client: AsyncClient):
    credit = await _credit(client)

    assert money(credit["paid_total"]) == money(0)
    assert money(credit["remaining"]) == money("10000")
    assert credit["percent"] == 0.0
    assert credit["is_paid"] is False


async def test_payments_shrink_remaining(client: AsyncClient):
    credit = await _credit(client)
    await client.post(f"/credits/{credit['id']}/payments", json={"amount": "1500", "date": "2026-02-01"})

    resp = await client.post(
        f"/credits/{credit['id']}/payments", json={"amount": "500", "date": "2026-03-01", "note": "extra"}
    )

    assert resp.status_code == 201
    assert money(resp.json()["paid_total"]) == money("2000")
    assert money(resp.json()["remaining"]) == money("8000")
    assert resp.json()["percent"] == 20.0
    assert resp.json()["is_paid"] is False


async def test_overpayment_floors_remaining_at_zero_and_marks_paid(client: AsyncClient):
    credit = await _credit(client)

    resp = await client.post(
        f"/credits/{credit['id']}/payments", json={"amount": "12000", "date": "2026-02-01"}
    )

    assert resp.status_code == 201
    assert money(resp.json()["paid_total"]) == money("12000")
    assert money(resp.json()["remaining"]) == money(0)
    assert resp.json()["is_paid"] is True


async def test_zero_and_negative_payments_are_rejected(client: AsyncClient):
    credit = await _credit(client)

    for amount in ("0", "-100"):
        resp = await client.post(
            f"/credits/{credit['id']}/payments", json={"amount": amount, "date": "2026-02-01"}
        )
        assert resp.status_code == 422

    assert money((await client.get("/credits")).json()[0]["paid_total"]) == money(0)


async def test_payment_to_unknown_credit_is_404(client: AsyncClient):
    resp = await client.post("/credits/999/payments", json={"amount": "100", "date": "2026-02-01"})

    assert resp.status_code == 404


async def test_crud_roundtrip(client: AsyncClient):
    credit = await _credit(client)

    resp = await client.patch(f"/credits/{credit['id']}", json={"monthly_payment": "600"})
    assert resp.status_code == 200
    assert money(resp.json()["monthly_payment"]) == money("600")

    resp = await client.delete(f"/credits/{credit['id']}")
    assert resp.status_code == 204
    assert (await client.get("/credits")).json() == []
