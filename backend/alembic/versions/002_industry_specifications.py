"""Add industry-specific specification tables

Revision ID: 002_industry_specifications
Revises: 001_packguard_expansion
Create Date: 2024-01-14 14:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers
revision = '002_industry_specifications'
down_revision = '001_packguard_expansion'
branch_labels = None
depends_on = None


def upgrade():
    # Create electronics_specifications table
    op.create_table('electronics_specifications',
        sa.Column('spec_id', postgresql.UUID(as_uuid=True), nullable=False, server_default=sa.text('gen_random_uuid()')),
        sa.Column('product_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('processor', sa.String(length=200), nullable=True),
        sa.Column('memory_gb', sa.Integer(), nullable=True),
        sa.Column('storage_gb', sa.Integer(), nullable=True),
        sa.Column('display_size', sa.DECIMAL(precision=4, scale=2), nullable=True),
        sa.Column('battery_capacity', sa.Integer(), nullable=True),
        sa.Column('operating_system', sa.String(length=100), nullable=True),
        sa.Column('connectivity', postgresql.JSONB(astext_type=sa.Text()), nullable=True, server_default='{}'),
        sa.Column('dimensions', postgresql.JSONB(astext_type=sa.Text()), nullable=True, server_default='{}'),
        sa.Column('power_requirements', postgresql.JSONB(astext_type=sa.Text()), nullable=True, server_default='{}'),
        sa.Column('compatibility_matrix', postgresql.JSONB(astext_type=sa.Text()), nullable=True, server_default='{}'),
        sa.Column('created_at', sa.DateTime(), nullable=True, server_default=sa.text('now()')),
        sa.ForeignKeyConstraint(['product_id'], ['products.product_id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('spec_id')
    )

    # Create luxury_specifications table
    op.create_table('luxury_specifications',
        sa.Column('spec_id', postgresql.UUID(as_uuid=True), nullable=False, server_default=sa.text('gen_random_uuid()')),
        sa.Column('product_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('material', sa.String(length=200), nullable=True),
        sa.Column('craftsmanship_level', sa.String(length=50), nullable=True),
        sa.Column('limited_edition', sa.Boolean(), nullable=True, server_default='false'),
        sa.Column('edition_number', sa.Integer(), nullable=True),
        sa.Column('total_edition_size', sa.Integer(), nullable=True),
        sa.Column('designer', sa.String(length=200), nullable=True),
        sa.Column('collection_name', sa.String(length=200), nullable=True),
        sa.Column('authentication_features', postgresql.JSONB(astext_type=sa.Text()), nullable=True, server_default='{}'),
        sa.Column('provenance_history', postgresql.JSONB(astext_type=sa.Text()), nullable=True, server_default='{}'),
        sa.Column('estimated_value', sa.DECIMAL(precision=12, scale=2), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True, server_default=sa.text('now()')),
        sa.ForeignKeyConstraint(['product_id'], ['products.product_id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('spec_id')
    )

    # Create food_specifications table
    op.create_table('food_specifications',
        sa.Column('spec_id', postgresql.UUID(as_uuid=True), nullable=False, server_default=sa.text('gen_random_uuid()')),
        sa.Column('product_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('nutritional_info', postgresql.JSONB(astext_type=sa.Text()), nullable=True, server_default='{}'),
        sa.Column('allergens', postgresql.JSONB(astext_type=sa.Text()), nullable=True, server_default='[]'),
        sa.Column('dietary_restrictions', postgresql.JSONB(astext_type=sa.Text()), nullable=True, server_default='[]'),
        sa.Column('origin_location', sa.String(length=200), nullable=True),
        sa.Column('harvest_date', sa.DateTime(), nullable=True),
        sa.Column('processing_date', sa.DateTime(), nullable=True),
        sa.Column('storage_requirements', postgresql.JSONB(astext_type=sa.Text()), nullable=True, server_default='{}'),
        sa.Column('shelf_life_days', sa.Integer(), nullable=True),
        sa.Column('organic_certified', sa.Boolean(), nullable=True, server_default='false'),
        sa.Column('fair_trade_certified', sa.Boolean(), nullable=True, server_default='false'),
        sa.Column('created_at', sa.DateTime(), nullable=True, server_default=sa.text('now()')),
        sa.ForeignKeyConstraint(['product_id'], ['products.product_id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('spec_id')
    )

    # Create automotive_specifications table
    op.create_table('automotive_specifications',
        sa.Column('spec_id', postgresql.UUID(as_uuid=True), nullable=False, server_default=sa.text('gen_random_uuid()')),
        sa.Column('product_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('part_category', sa.String(length=100), nullable=True),
        sa.Column('oem_part_number', sa.String(length=100), nullable=True),
        sa.Column('compatible_vehicles', postgresql.JSONB(astext_type=sa.Text()), nullable=True, server_default='{}'),
        sa.Column('safety_critical', sa.Boolean(), nullable=True, server_default='false'),
        sa.Column('installation_complexity', sa.String(length=20), nullable=True, server_default='medium'),
        sa.Column('warranty_terms', postgresql.JSONB(astext_type=sa.Text()), nullable=True, server_default='{}'),
        sa.Column('recall_history', postgresql.JSONB(astext_type=sa.Text()), nullable=True, server_default='{}'),
        sa.Column('performance_specs', postgresql.JSONB(astext_type=sa.Text()), nullable=True, server_default='{}'),
        sa.Column('created_at', sa.DateTime(), nullable=True, server_default=sa.text('now()')),
        sa.ForeignKeyConstraint(['product_id'], ['products.product_id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('spec_id')
    )

    # Create cosmetics_specifications table
    op.create_table('cosmetics_specifications',
        sa.Column('spec_id', postgresql.UUID(as_uuid=True), nullable=False, server_default=sa.text('gen_random_uuid()')),
        sa.Column('product_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('ingredients', postgresql.JSONB(astext_type=sa.Text()), nullable=True, server_default='{}'),
        sa.Column('skin_type_suitability', postgresql.JSONB(astext_type=sa.Text()), nullable=True, server_default='[]'),
        sa.Column('usage_instructions', sa.String(length=1000), nullable=True),
        sa.Column('safety_warnings', sa.String(length=1000), nullable=True),
        sa.Column('dermatologically_tested', sa.Boolean(), nullable=True, server_default='false'),
        sa.Column('cruelty_free', sa.Boolean(), nullable=True, server_default='false'),
        sa.Column('natural_percentage', sa.DECIMAL(precision=5, scale=2), nullable=True),
        sa.Column('spf_rating', sa.Integer(), nullable=True),
        sa.Column('color_shade', sa.String(length=100), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True, server_default=sa.text('now()')),
        sa.ForeignKeyConstraint(['product_id'], ['products.product_id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('spec_id')
    )

    # Create indexes for better performance
    op.create_index('idx_electronics_specifications_product_id', 'electronics_specifications', ['product_id'])
    op.create_index('idx_luxury_specifications_product_id', 'luxury_specifications', ['product_id'])
    op.create_index('idx_food_specifications_product_id', 'food_specifications', ['product_id'])
    op.create_index('idx_automotive_specifications_product_id', 'automotive_specifications', ['product_id'])
    op.create_index('idx_cosmetics_specifications_product_id', 'cosmetics_specifications', ['product_id'])


def downgrade():
    # Drop indexes
    op.drop_index('idx_cosmetics_specifications_product_id', table_name='cosmetics_specifications')
    op.drop_index('idx_automotive_specifications_product_id', table_name='automotive_specifications')
    op.drop_index('idx_food_specifications_product_id', table_name='food_specifications')
    op.drop_index('idx_luxury_specifications_product_id', table_name='luxury_specifications')
    op.drop_index('idx_electronics_specifications_product_id', table_name='electronics_specifications')

    # Drop tables
    op.drop_table('cosmetics_specifications')
    op.drop_table('automotive_specifications')
    op.drop_table('food_specifications')
    op.drop_table('luxury_specifications')
    op.drop_table('electronics_specifications')