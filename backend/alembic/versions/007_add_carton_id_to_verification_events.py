"""Add carton_id to verification_events table

Revision ID: 007_add_carton_id_to_verification_events
Revises: 006_add_product_fields
Create Date: 2026-02-04 14:15:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '007_add_carton_id_to_verification_events'
down_revision = '006_add_product_fields'
branch_labels = None
depends_on = None


def upgrade():
    # Add carton_id column to verification_events table
    op.add_column('verification_events', sa.Column('carton_id', sa.String(length=50), nullable=True))
    
    # Make pack_id nullable since carton verifications don't have pack_id
    op.alter_column('verification_events', 'pack_id', nullable=True)
    
    # Create index for carton_id lookups
    op.create_index('ix_verification_events_carton', 'verification_events', ['carton_id'])
    
    # Add check constraint to ensure either pack_id or carton_id is provided
    op.create_check_constraint(
        'check_pack_or_carton',
        'verification_events',
        'pack_id IS NOT NULL OR carton_id IS NOT NULL'
    )


def downgrade():
    # Remove check constraint
    op.drop_constraint('check_pack_or_carton', 'verification_events', type_='check')
    
    # Remove index
    op.drop_index('ix_verification_events_carton', table_name='verification_events')
    
    # Make pack_id non-nullable again
    op.alter_column('verification_events', 'pack_id', nullable=False)
    
    # Remove carton_id column
    op.drop_column('verification_events', 'carton_id')