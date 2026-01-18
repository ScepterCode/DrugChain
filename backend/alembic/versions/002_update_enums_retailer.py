"""Update enums from PHARMACY to RETAILER

Revision ID: 002_update_enums_retailer
Revises: 001_initial_schema
Create Date: 2026-01-18 10:40:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '002_update_enums_retailer'
down_revision = ('003_performance_indexes', 'e8d9cc03fbb2')
branch_labels = None
depends_on = None


def upgrade():
    # 1. Update OrganizationType Enum
    op.execute("ALTER TYPE organizationtype ADD VALUE 'RETAILER'")
    op.execute("ALTER TABLE organizations ALTER COLUMN organization_type TYPE VARCHAR")
    op.execute("UPDATE organizations SET organization_type = 'RETAILER' WHERE organization_type = 'PHARMACY'")
    # Note: We can't easily remove 'PHARMACY' from the enum without recreating it in Postgres, 
    # but strictly speaking we just want to ensure RETAILER is available and used.
    # For a cleaner migration we would create a new type, swap it, and drop the old one.
    
    # 2. Update UserRole Enum
    op.execute("ALTER TYPE userrole ADD VALUE 'RETAILER'")
    op.execute("UPDATE users SET role = 'RETAILER' WHERE role = 'PHARMACY'")


def downgrade():
    op.execute("UPDATE organizations SET organization_type = 'PHARMACY' WHERE organization_type = 'RETAILER'")
    op.execute("UPDATE users SET role = 'PHARMACY' WHERE role = 'RETAILER'")
