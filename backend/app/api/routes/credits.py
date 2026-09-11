from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_session
from app.schemas.credit import CreditCreate, CreditPaymentCreate, CreditRead, CreditUpdate
from app.services.credit_service import add_payment, create_credit, delete_credit, list_credits, update_credit

router = APIRouter(prefix="/credits", tags=["credits"])


@router.get("", response_model=list[CreditRead])
async def read_credits(session: AsyncSession = Depends(get_session)) -> list[CreditRead]:
    return await list_credits(session)


@router.post("", response_model=CreditRead, status_code=201)
async def create_credit_route(payload: CreditCreate, session: AsyncSession = Depends(get_session)) -> CreditRead:
    return await create_credit(session, payload)


@router.patch("/{credit_id}", response_model=CreditRead)
async def update_credit_route(
    credit_id: int, payload: CreditUpdate, session: AsyncSession = Depends(get_session)
) -> CreditRead:
    return await update_credit(session, credit_id, payload)


@router.delete("/{credit_id}", status_code=204)
async def delete_credit_route(credit_id: int, session: AsyncSession = Depends(get_session)) -> None:
    await delete_credit(session, credit_id)


@router.post("/{credit_id}/payments", response_model=CreditRead, status_code=201)
async def add_payment_route(
    credit_id: int, payload: CreditPaymentCreate, session: AsyncSession = Depends(get_session)
) -> CreditRead:
    return await add_payment(session, credit_id, payload)
