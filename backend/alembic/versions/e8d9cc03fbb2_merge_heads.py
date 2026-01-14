# Alembic migration script template
"""merge heads

Revision ID: e8d9cc03fbb2
Revises: 001_packguard_expansion, 56a8fb83a08a
Create Date: 2026-01-14 13:47:24.798052

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'e8d9cc03fbb2'
down_revision = ('001_packguard_expansion', '56a8fb83a08a')
branch_labels = None
depends_on = None


def upgrade():
    pass


def downgrade():
    pass
