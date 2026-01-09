# Alembic migration script template
"""Merge migration heads

Revision ID: 56a8fb83a08a
Revises: 9cbb6a33bf1a, afcc24e5852a
Create Date: 2026-01-07 18:23:40.608567

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '56a8fb83a08a'
down_revision = ('9cbb6a33bf1a', 'afcc24e5852a')
branch_labels = None
depends_on = None


def upgrade():
    pass


def downgrade():
    pass
