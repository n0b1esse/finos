"""add credits

Revision ID: b8e3f5a2c4d7
Revises: d1a6f4c8b729
Create Date: 2026-09-11 22:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'b8e3f5a2c4d7'
down_revision: Union[str, None] = 'd1a6f4c8b729'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'credits',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=150), nullable=False),
        sa.Column('credit_type', sa.Enum('CONSUMER', 'MORTGAGE', 'AUTO', 'CREDIT_CARD', 'OTHER', name='credit_type', native_enum=False, length=20), nullable=False),
        sa.Column('total_amount', sa.Numeric(precision=14, scale=2), nullable=False),
        sa.Column('annual_rate', sa.Numeric(precision=5, scale=2), nullable=False),
        sa.Column('monthly_payment', sa.Numeric(precision=14, scale=2), nullable=False),
        sa.Column('start_date', sa.Date(), nullable=True),
        sa.Column('end_date', sa.Date(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_table(
        'credit_payments',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('credit_id', sa.Integer(), nullable=False),
        sa.Column('amount', sa.Numeric(precision=14, scale=2), nullable=False),
        sa.Column('date', sa.Date(), nullable=False),
        sa.Column('note', sa.String(length=200), nullable=True),
        sa.ForeignKeyConstraint(['credit_id'], ['credits.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )


def downgrade() -> None:
    op.drop_table('credit_payments')
    op.drop_table('credits')
