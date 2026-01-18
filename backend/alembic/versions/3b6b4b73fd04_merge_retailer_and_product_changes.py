# Alembic migration script template
"""merge_retailer_and_product_changes

Revision ID: 3b6b4b73fd04
Revises: 002_update_enums_retailer, 003_product_industry_fields
Create Date: 2026-01-18 16:29:11.259534

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '3b6b4b73fd04'
down_revision = ('002_update_enums_retailer', '003_product_industry_fields')
branch_labels = None
depends_on = None


def upgrade():
    pass


def downgrade():
    pass
