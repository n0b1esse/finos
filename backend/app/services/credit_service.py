"""Credits (loans): CRUD for the credit itself, plus an outstanding balance —
total_amount minus the sum of all logged CreditPayment rows, computed on
read rather than stored, so it's never out of sync with the log. Same shape
as goals (services/goal_service.py), mirrored because the two features are
intentional duals: goals grow toward a target, credits shrink toward zero."""
from decimal import Decimal

from fastapi import HTTPException
from sqlalchemy import func, select
from sqlalchemy.engine import Row
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.credit import Credit, CreditPayment
from app.schemas.credit import CreditCreate, CreditPaymentCreate, CreditRead, CreditUpdate

_SELECT_WITH_TOTAL = (
    select(
        Credit.id,
        Credit.name,
        Credit.credit_type,
        Credit.total_amount,
        Credit.annual_rate,
        Credit.monthly_payment,
        Credit.start_date,
        Credit.end_date,
        func.coalesce(func.sum(CreditPayment.amount), 0).label("paid_total"),
    )
    .outerjoin(CreditPayment, CreditPayment.credit_id == Credit.id)
    .group_by(
        Credit.id,
        Credit.name,
        Credit.credit_type,
        Credit.total_amount,
        Credit.annual_rate,
        Credit.monthly_payment,
        Credit.start_date,
        Credit.end_date,
        Credit.created_at,
    )
    .order_by(Credit.created_at)
)


def _to_read(row: Row) -> CreditRead:
    paid = row.paid_total
    total = row.total_amount
    # Overpaying past zero would turn a repaid loan into a phantom asset —
    # floor it, the extra simply means the loan is done.
    remaining = max(total - paid, Decimal("0"))
    percent = float(paid / total * 100) if total else 0.0
    return CreditRead(
        id=row.id,
        name=row.name,
        credit_type=row.credit_type,
        total_amount=total,
        annual_rate=row.annual_rate,
        monthly_payment=row.monthly_payment,
        start_date=row.start_date,
        end_date=row.end_date,
        paid_total=paid,
        remaining=remaining,
        percent=percent,
        is_paid=paid >= total,
    )


async def _read_one(session: AsyncSession, credit_id: int) -> CreditRead:
    row = (await session.execute(_SELECT_WITH_TOTAL.where(Credit.id == credit_id))).one()
    return _to_read(row)


async def list_credits(session: AsyncSession) -> list[CreditRead]:
    rows = (await session.execute(_SELECT_WITH_TOTAL)).all()
    return [_to_read(row) for row in rows]


async def create_credit(session: AsyncSession, payload: CreditCreate) -> CreditRead:
    credit = Credit(
        name=payload.name,
        credit_type=payload.credit_type,
        total_amount=payload.total_amount,
        annual_rate=payload.annual_rate,
        monthly_payment=payload.monthly_payment,
        start_date=payload.start_date,
        end_date=payload.end_date,
    )
    session.add(credit)
    await session.commit()
    return CreditRead(
        id=credit.id,
        name=credit.name,
        credit_type=credit.credit_type,
        total_amount=credit.total_amount,
        annual_rate=credit.annual_rate,
        monthly_payment=credit.monthly_payment,
        start_date=credit.start_date,
        end_date=credit.end_date,
        paid_total=Decimal("0"),
        remaining=credit.total_amount,
        percent=0.0,
        is_paid=False,
    )


async def update_credit(session: AsyncSession, credit_id: int, payload: CreditUpdate) -> CreditRead:
    credit = await session.get(Credit, credit_id)
    if credit is None:
        raise HTTPException(status_code=404, detail="Credit not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(credit, field, value)
    await session.commit()
    return await _read_one(session, credit_id)


async def delete_credit(session: AsyncSession, credit_id: int) -> None:
    credit = await session.get(Credit, credit_id)
    if credit is None:
        raise HTTPException(status_code=404, detail="Credit not found")
    await session.delete(credit)
    await session.commit()


async def add_payment(session: AsyncSession, credit_id: int, payload: CreditPaymentCreate) -> CreditRead:
    credit = await session.get(Credit, credit_id)
    if credit is None:
        raise HTTPException(status_code=404, detail="Credit not found")
    session.add(CreditPayment(credit_id=credit_id, amount=payload.amount, date=payload.date, note=payload.note))
    await session.commit()
    return await _read_one(session, credit_id)
