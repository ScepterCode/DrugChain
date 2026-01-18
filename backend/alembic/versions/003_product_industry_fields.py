"""Add industry_type and industry_data fields to products table

Revision ID: 003_product_industry_fields
Revises: 002_multi_industry_regulatory
Create Date: 2026-01-18 11:20:00.000000

This migration adds industry_type and industry_data JSONB fields to support
multi-industry products (electronics, cosmetics, automotive, luxury, etc.)
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSONB


# revision identifiers, used by Alembic.
revision = '003_product_industry_fields'
down_revision = '002_multi_industry_regulatory'
branch_labels = None
depends_on = None


def upgrade() -> None:
    """
    Add industry_type and industry_data columns to products table.
    Also add regulatory_registration as generic replacement for nafdac_registration_number.
    """
    
    # Add new industry support fields
    op.add_column('products', 
        sa.Column('industry_type', sa.String(50), nullable=True, server_default='Healthcare'))
    op.add_column('products', 
        sa.Column('industry_data', JSONB, nullable=True, server_default='{}'))
    op.add_column('products', 
        sa.Column('regulatory_registration', sa.String(100), nullable=True))
    
    # Set default industry_type for existing products
    op.execute("""
        UPDATE products 
        SET industry_type = 'Healthcare'
        WHERE industry_type IS NULL
    """)
    
    # Migrate existing NAFDAC registration to generic field
    op.execute("""
        UPDATE products 
        SET regulatory_registration = nafdac_registration_number
        WHERE nafdac_registration_number IS NOT NULL
    """)
    
    # Migrate existing pharmaceutical data to industry_data JSONB
    op.execute("""
        UPDATE products 
        SET industry_data = jsonb_build_object(
            'dosage', dosage,
            'form', form,
            'active_ingredients', active_ingredients,
            'therapeutic_category', therapeutic_category,
            'requires_prescription', requires_prescription
        )
        WHERE industry_type = 'Healthcare'
        AND (dosage IS NOT NULL OR form IS NOT NULL OR active_ingredients IS NOT NULL)
    """)


def downgrade() -> None:
    """
    Remove industry support fields from products table.
    """
    op.drop_column('products', 'regulatory_registration')
    op.drop_column('products', 'industry_data')
    op.drop_column('products', 'industry_type')
