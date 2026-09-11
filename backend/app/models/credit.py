"""A loan/credit tracked by a payment log (CreditPayment) — the same
"you record it, we sum it" shape as Goal/GoalContribution, but inverted:
payments shrink the outstanding balance instead of growing a saved total."""
from datetime import date as date_
from decimal import Decimal

from sqlalchemy import Date, Enum, ForeignKey, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.enums import CreditType
from app.models.mixins import TimestampMixin


class Credit(Base, TimestampMixin):
    __tablename__ = "credits"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(150), nullable=False)
    credit_type: Mapped[CreditType] = mapped_column(
        Enum(CreditType, name="credit_type", native_enum=False, length=20),
        nullable=False,
        default=CreditType.OTHER,
    )
    total_amount: Mapped[Decimal] = mapped_column(Numeric(14, 2), nullable=False)
    annual_rate: Mapped[Decimal] = mapped_column(Numeric(5, 2), nullable=False, default=Decimal("0"))
    monthly_payment: Mapped[Decimal] = mapped_column(Numeric(14, 2), nullable=False)
    start_date: Mapped[date_ | None] = mapped_column(Date, nullable=True)
    end_date: Mapped[date_ | None] = mapped_column(Date, nullable=True)

    payments: Mapped[list["CreditPayment"]] = relationship(
        back_populates="credit", cascade="all, delete-orphan", order_by="CreditPayment.date"
    )


class CreditPayment(Base):
    """One repayment toward a credit. Amount is always positive — unlike a
    goal withdrawal, there is no "take money back out of a loan", so zero
    and negatives are rejected at the schema level instead of special-cased.
    A credit's outstanding balance is total_amount minus the sum of all its
    payments (floored at zero), computed on read rather than stored."""

    __tablename__ = "credit_payments"

    id: Mapped[int] = mapped_column(primary_key=True)
    credit_id: Mapped[int] = mapped_column(ForeignKey("credits.id", ondelete="CASCADE"), nullable=False)
    amount: Mapped[Decimal] = mapped_column(Numeric(14, 2), nullable=False)
    date: Mapped[date_] = mapped_column(Date, nullable=False)
    note: Mapped[str | None] = mapped_column(String(200), nullable=True)

    credit: Mapped["Credit"] = relationship(back_populates="payments")
