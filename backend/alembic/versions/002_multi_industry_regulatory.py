"""Add generic regulatory fields for multi-industry support

Revision ID: 002_multi_industry_regulatory
Revises: 001_packguard_expansion
Create Date: 2026-01-18 11:00:00.000000

This migration adds generic regulatory fields to support manufacturers
across all industries (electronics, luxury, automotive, cosmetics, etc.)
by making the regulatory and compliance fields industry-agnostic.
"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '002_multi_industry_regulatory'
down_revision = '001_packguard_expansion'
branch_labels = None
depends_on = None


def upgrade() -> None:
    """
    Add generic regulatory and compliance fields to manufacturers table.
    These fields replace industry-specific ones (like NAFDAC, GMP) with
    generic equivalents that work for all product types.
    """
    
    # Add new generic regulatory fields
    op.add_column('manufacturers', 
        sa.Column('regulatory_license_number', sa.String(100), nullable=True))
    op.add_column('manufacturers', 
        sa.Column('regulatory_body', sa.String(100), nullable=True))
    op.add_column('manufacturers', 
        sa.Column('primary_certification_type', sa.String(50), nullable=True))
    op.add_column('manufacturers', 
        sa.Column('primary_certification_expiry', sa.Date(), nullable=True))
    
    # Migrate existing NAFDAC data to generic fields
    op.execute("""
        UPDATE manufacturers 
        SET regulatory_license_number = nafdac_license_number,
            regulatory_body = 'NAFDAC'
        WHERE nafdac_license_number IS NOT NULL
    """)
    
    # Migrate existing GMP certification data
    op.execute("""
        UPDATE manufacturers
        SET primary_certification_type = 'GMP',
            primary_certification_expiry = gmp_certificate_expiry
        WHERE gmp_certified = TRUE
    """)
    
    # Note: We keep the old columns for backward compatibility
    # They can be removed in a future migration after full transition


def downgrade() -> None:
    """
    Remove generic regulatory fields and restore pharmaceutical-specific ones.
    """
    op.drop_column('manufacturers', 'primary_certification_expiry')
    op.drop_column('manufacturers', 'primary_certification_type')
    op.drop_column('manufacturers', 'regulatory_body')
    op.drop_column('manufacturers', 'regulatory_license_number')
