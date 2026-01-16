"""Add performance indexes for analytics queries

Revision ID: 003_performance_indexes
Revises: 002_industry_specifications
Create Date: 2026-01-16 15:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers
revision = '003_performance_indexes'
down_revision = '002_industry_specifications'
branch_labels = None
depends_on = None


def upgrade():
    # Add indexes for analytics performance
    
    # Verification events - most queried table
    op.create_index('idx_verification_events_created_at', 'verification_events', ['created_at'])
    op.create_index('idx_verification_events_location_address', 'verification_events', ['location_address'])
    op.create_index('idx_verification_events_pack_id', 'verification_events', ['pack_id'])
    op.create_index('idx_verification_events_result', 'verification_events', ['verification_result'])
    op.create_index('idx_verification_events_created_result', 'verification_events', ['created_at', 'verification_result'])
    
    # Packs - frequently joined
    op.create_index('idx_packs_batch_id', 'packs', ['batch_id'])
    op.create_index('idx_packs_created_at', 'packs', ['created_at'])
    
    # Batches - manufacturer filtering
    op.create_index('idx_batches_manufacturer_id', 'batches', ['manufacturer_id'])
    op.create_index('idx_batches_created_at', 'batches', ['created_at'])
    op.create_index('idx_batches_manufacturer_created', 'batches', ['manufacturer_id', 'created_at'])
    
    # Products - manufacturer filtering
    op.create_index('idx_products_manufacturer_id', 'products', ['manufacturer_id'])
    op.create_index('idx_products_is_active', 'products', ['is_active'])
    op.create_index('idx_products_manufacturer_active', 'products', ['manufacturer_id', 'is_active'])
    
    # Cartons - supply chain tracking
    op.create_index('idx_cartons_batch_id', 'cartons', ['batch_id'])
    op.create_index('idx_cartons_current_holder', 'cartons', ['current_holder_id'])
    op.create_index('idx_cartons_created_at', 'cartons', ['created_at'])


def downgrade():
    # Remove indexes
    op.drop_index('idx_verification_events_created_at', table_name='verification_events')
    op.drop_index('idx_verification_events_location_address', table_name='verification_events')
    op.drop_index('idx_verification_events_pack_id', table_name='verification_events')
    op.drop_index('idx_verification_events_result', table_name='verification_events')
    op.drop_index('idx_verification_events_created_result', table_name='verification_events')
    
    op.drop_index('idx_packs_batch_id', table_name='packs')
    op.drop_index('idx_packs_created_at', table_name='packs')
    
    op.drop_index('idx_batches_manufacturer_id', table_name='batches')
    op.drop_index('idx_batches_created_at', table_name='batches')
    op.drop_index('idx_batches_manufacturer_created', table_name='batches')
    
    op.drop_index('idx_products_manufacturer_id', table_name='products')
    op.drop_index('idx_products_is_active', table_name='products')
    op.drop_index('idx_products_manufacturer_active', table_name='products')
    
    op.drop_index('idx_cartons_batch_id', table_name='cartons')
    op.drop_index('idx_cartons_current_holder', table_name='cartons')
    op.drop_index('idx_cartons_created_at', table_name='cartons')