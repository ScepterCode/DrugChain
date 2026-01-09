"""Initial database schema

Revision ID: 001
Revises: 
Create Date: 2026-01-03

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '001'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # Create organizations table
    op.create_table(
        'organizations',
        sa.Column('organization_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('organization_name', sa.String(255), nullable=False),
        sa.Column('organization_type', sa.Enum('MANUFACTURER', 'DISTRIBUTOR', 'PHARMACY', 'REGULATOR', name='organizationtype'), nullable=False),
        sa.Column('registration_number', sa.String(100), nullable=True),
        sa.Column('address', sa.Text(), nullable=True),
        sa.Column('city', sa.String(100), nullable=True),
        sa.Column('state', sa.String(100), nullable=True),
        sa.Column('country', sa.String(100), nullable=True),
        sa.Column('contact_email', sa.String(255), nullable=True),
        sa.Column('contact_phone', sa.String(20), nullable=True),
        sa.Column('license_status', sa.Enum('PENDING', 'ACTIVE', 'SUSPENDED', 'REVOKED', name='licensestatus'), nullable=True),
        sa.Column('verified_by_regulator', sa.Boolean(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('organization_id'),
        sa.UniqueConstraint('registration_number')
    )

    # Create manufacturers table
    op.create_table(
        'manufacturers',
        sa.Column('manufacturer_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('manufacturer_code', sa.String(10), nullable=False),
        sa.Column('nafdac_license_number', sa.String(100), nullable=True),
        sa.Column('production_capacity', sa.Integer(), nullable=True),
        sa.Column('specialization', postgresql.ARRAY(sa.String()), nullable=True),
        sa.Column('gmp_certified', sa.Boolean(), nullable=True),
        sa.Column('gmp_certificate_expiry', sa.Date(), nullable=True),
        sa.ForeignKeyConstraint(['manufacturer_id'], ['organizations.organization_id'], ),
        sa.PrimaryKeyConstraint('manufacturer_id'),
        sa.UniqueConstraint('manufacturer_code')
    )

    # Create users table
    op.create_table(
        'users',
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('email', sa.String(255), nullable=False),
        sa.Column('password_hash', sa.String(255), nullable=False),
        sa.Column('full_name', sa.String(255), nullable=False),
        sa.Column('phone_number', sa.String(20), nullable=True),
        sa.Column('role', sa.Enum('MANUFACTURER', 'DISTRIBUTOR', 'PHARMACY', 'REGULATOR', 'SYSTEM_ADMIN', name='userrole'), nullable=False),
        sa.Column('organization_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('is_verified', sa.Boolean(), nullable=True),
        sa.Column('email_verified_at', sa.DateTime(), nullable=True),
        sa.Column('two_factor_enabled', sa.Boolean(), nullable=True),
        sa.Column('two_factor_secret', sa.String(255), nullable=True),
        sa.Column('last_login', sa.DateTime(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['organization_id'], ['organizations.organization_id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('user_id'),
        sa.UniqueConstraint('email')
    )
    op.create_index('ix_users_email', 'users', ['email'])

    # Create products table
    op.create_table(
        'products',
        sa.Column('product_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('manufacturer_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('product_code', sa.String(50), nullable=False),
        sa.Column('product_name', sa.String(255), nullable=False),
        sa.Column('dosage', sa.String(100), nullable=True),
        sa.Column('form', sa.String(50), nullable=True),
        sa.Column('active_ingredients', postgresql.ARRAY(sa.String()), nullable=True),
        sa.Column('therapeutic_category', sa.String(100), nullable=True),
        sa.Column('requires_prescription', sa.Boolean(), nullable=True),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('nafdac_registration_number', sa.String(100), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['manufacturer_id'], ['manufacturers.manufacturer_id'], ),
        sa.PrimaryKeyConstraint('product_id'),
        sa.UniqueConstraint('product_code')
    )

    # Create batches table
    op.create_table(
        'batches',
        sa.Column('batch_id', sa.String(50), nullable=False),
        sa.Column('product_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('manufacturer_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('production_date', sa.Date(), nullable=False),
        sa.Column('expiry_date', sa.Date(), nullable=False),
        sa.Column('batch_size', sa.Integer(), nullable=False),
        sa.Column('number_of_cartons', sa.Integer(), nullable=True),
        sa.Column('total_packs', sa.Integer(), nullable=True),
        sa.Column('quality_certificate_url', sa.Text(), nullable=True),
        sa.Column('status', sa.Enum('ACTIVE', 'RECALLED', 'EXPIRED', name='batchstatus'), nullable=True),
        sa.Column('created_by', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('blockchain_tx_id', sa.String(255), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['created_by'], ['users.user_id'], ),
        sa.ForeignKeyConstraint(['manufacturer_id'], ['manufacturers.manufacturer_id'], ),
        sa.ForeignKeyConstraint(['product_id'], ['products.product_id'], ),
        sa.PrimaryKeyConstraint('batch_id')
    )

    # Create cartons table
    op.create_table(
        'cartons',
        sa.Column('carton_id', sa.String(50), nullable=False),
        sa.Column('batch_id', sa.String(50), nullable=False),
        sa.Column('carton_number', sa.Integer(), nullable=False),
        sa.Column('packs_per_carton', sa.Integer(), nullable=False),
        sa.Column('current_location', sa.String(255), nullable=True),
        sa.Column('current_holder_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('blockchain_tx_id', sa.String(255), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['batch_id'], ['batches.batch_id'], ),
        sa.ForeignKeyConstraint(['current_holder_id'], ['organizations.organization_id'], ),
        sa.PrimaryKeyConstraint('carton_id')
    )

    # Create packs table
    op.create_table(
        'packs',
        sa.Column('pack_id', sa.String(16), nullable=False),
        sa.Column('batch_id', sa.String(50), nullable=False),
        sa.Column('carton_id', sa.String(50), nullable=True),
        sa.Column('qr_code_url', sa.Text(), nullable=True),
        sa.Column('barcode', sa.String(50), nullable=True),
        sa.Column('status', sa.Enum('ACTIVE', 'USED', 'RECALLED', 'EXPIRED', name='packstatus'), nullable=True),
        sa.Column('blockchain_tx_id', sa.String(255), nullable=True),
        sa.Column('verification_count', sa.Integer(), nullable=True),
        sa.Column('first_verified_at', sa.DateTime(), nullable=True),
        sa.Column('last_verified_at', sa.DateTime(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['batch_id'], ['batches.batch_id'], ),
        sa.ForeignKeyConstraint(['carton_id'], ['cartons.carton_id'], ),
        sa.PrimaryKeyConstraint('pack_id')
    )

    # Create indexes
    op.create_index('ix_batches_manufacturer', 'batches', ['manufacturer_id'])
    op.create_index('ix_batches_product', 'batches', ['product_id'])
    op.create_index('ix_packs_batch', 'packs', ['batch_id'])
    op.create_index('ix_packs_status', 'packs', ['status'])


def downgrade():
    op.drop_index('ix_packs_status', table_name='packs')
    op.drop_index('ix_packs_batch', table_name='packs')
    op.drop_index('ix_batches_product', table_name='batches')
    op.drop_index('ix_batches_manufacturer', table_name='batches')
    
    op.drop_table('packs')
    op.drop_table('cartons')
    op.drop_table('batches')
    op.drop_table('products')
    op.drop_index('ix_users_email', table_name='users')
    op.drop_table('users')
    op.drop_table('manufacturers')
    op.drop_table('organizations')
    
    # Drop enums
    sa.Enum(name='packstatus').drop(op.get_bind(), checkfirst=False)
    sa.Enum(name='batchstatus').drop(op.get_bind(), checkfirst=False)
    sa.Enum(name='userrole').drop(op.get_bind(), checkfirst=False)
    sa.Enum(name='licensestatus').drop(op.get_bind(), checkfirst=False)
    sa.Enum(name='organizationtype').drop(op.get_bind(), checkfirst=False)
