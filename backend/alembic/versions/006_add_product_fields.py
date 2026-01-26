"""Add missing product fields

Revision ID: 006_add_product_fields
Revises: 005_merge_auth_and_existing
Create Date: 2026-01-26 18:45:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '006_add_product_fields'
down_revision = '005_merge_auth_and_existing'
branch_labels = None
depends_on = None


def upgrade():
    """Add missing product fields"""
    # Add new columns to products table
    op.add_column('products', sa.Column('brand_name', sa.String(255), nullable=True))
    op.add_column('products', sa.Column('country_of_origin', sa.String(100), nullable=True))
    op.add_column('products', sa.Column('category_id', sa.String(100), nullable=True))
    op.add_column('products', sa.Column('model_number', sa.String(100), nullable=True))
    op.add_column('products', sa.Column('warranty_period_months', sa.Integer(), nullable=True))
    op.add_column('products', sa.Column('risk_level', sa.String(50), nullable=True, server_default='medium'))
    op.add_column('products', sa.Column('verification_complexity', sa.String(50), nullable=True, server_default='standard'))


def downgrade():
    """Remove added product fields"""
    op.drop_column('products', 'verification_complexity')
    op.drop_column('products', 'risk_level')
    op.drop_column('products', 'warranty_period_months')
    op.drop_column('products', 'model_number')
    op.drop_column('products', 'category_id')
    op.drop_column('products', 'country_of_origin')
    op.drop_column('products', 'brand_name')