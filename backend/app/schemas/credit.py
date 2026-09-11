from datetime import date as date_
from decimal import Decimal

from pydantic import BaseModel, Field

from app.models.enums import CreditType


class CreditCreate(BaseModel):
    name: str = Field(min_length=1, max_length=150)
    credit_type: CreditType = CreditType.OTHER
    total_amount: Decimal = Field(gt=0)
    annual_rate: Decimal = Field(ge=0, le=100)
    monthly_payment: Decimal = Field(gt=0)
    start_date: date_ | None = None
    end_date: date_ | None = None


class CreditUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=150)
    credit_type: CreditType | None = None
    total_amount: Decimal | None = Field(default=None, gt=0)
    annual_rate: Decimal | None = Field(default=None, ge=0, le=100)
    monthly_payment: Decimal | None = Field(default=None, gt=0)
    start_date: date_ | None = None
    end_date: date_ | None = None


class CreditPaymentCreate(BaseModel):
    # Positive only (gt=0 covers zero too): a payment shrinks the debt,
    # there is no "negative payment" the way a goal has withdrawals.
    amount: Decimal = Field(gt=0)
    date: date_
    note: str | None = Field(default=None, max_length=200)


class CreditRead(BaseModel):
    id: int
    name: str
    credit_type: CreditType
    total_amount: Decimal
    annual_rate: Decimal
    monthly_payment: Decimal
    start_date: date_ | None
    end_date: date_ | None
    paid_total: Decimal
    remaining: Decimal
    percent: float
    is_paid: bool
