"""PackGuard expansion - Add multi-industry support

Revision ID: 001_packguard_expansion
Revises: 
Create Date: 2024-01-14 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers
revision = '001_packguard_expansion'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # Create product_categories table
    op.create_table('product_categories',
        sa.Column('category_id', postgresql.UUID(as_uuid=True), nullable=False, server_default=sa.text('gen_random_uuid()')),
        sa.Column('category_name', sa.String(length=100), nullable=False),
        sa.Column('category_code', sa.String(length=20), nullable=False),
        sa.Column('parent_category_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('industry_type', sa.String(length=50), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('regulatory_requirements', postgresql.JSONB(astext_type=sa.Text()), nullable=True, server_default='{}'),
        sa.Column('verification_rules', postgresql.JSONB(astext_type=sa.Text()), nullable=True, server_default='{}'),
        sa.Column('is_active', sa.Boolean(), nullable=True, server_default='true'),
        sa.Column('created_at', sa.DateTime(), nullable=True, server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(), nullable=True, server_default=sa.text('now()')),
        sa.ForeignKeyConstraint(['parent_category_id'], ['product_categories.category_id'], ),
        sa.PrimaryKeyConstraint('category_id'),
        sa.UniqueConstraint('category_code')
    )

    # Insert base categories
    op.execute("""
        INSERT INTO product_categories (category_name, category_code, industry_type, description) VALUES
        ('Pharmaceuticals', 'PHARMA', 'Healthcare', 'Pharmaceutical products and medical devices'),
        ('Electronics', 'ELEC', 'Technology', 'Electronic devices and components'),
        ('Luxury Goods', 'LUXURY', 'Fashion', 'High-end fashion and luxury items'),
        ('Food & Beverages', 'FOOD', 'Consumer Goods', 'Food products and beverages'),
        ('Automotive Parts', 'AUTO', 'Automotive', 'Vehicle parts and accessories'),
        ('Cosmetics', 'COSMETIC', 'Personal Care', 'Beauty and personal care products')
    """)

    # Add new columns to products table
    op.add_column('products', sa.Column('category_id', postgresql.UUID(as_uuid=True), nullable=True))
    op.add_column('products', sa.Column('industry_type', sa.String(length=50), nullable=True, server_default='Healthcare'))
    op.add_column('products', sa.Column('brand_name', sa.String(length=200), nullable=True))
    op.add_column('products', sa.Column('model_number', sa.String(length=100), nullable=True))
    op.add_column('products', sa.Column('warranty_period_months', sa.Integer(), nullable=True))
    op.add_column('products', sa.Column('country_of_origin', sa.String(length=100), nullable=True))
    op.add_column('products', sa.Column('risk_level', sa.String(length=20), nullable=True, server_default='medium'))
    op.add_column('products', sa.Column('verification_complexity', sa.String(length=20), nullable=True, server_default='standard'))

    # Create foreign key constraint
    op.create_foreign_key('fk_products_category', 'products', 'product_categories', ['category_id'], ['category_id'])

    # Update existing products to have pharmaceutical category
    op.execute("""
        UPDATE products SET 
            category_id = (SELECT category_id FROM product_categories WHERE category_code = 'PHARMA'),
            industry_type = 'Healthcare',
            risk_level = 'high',
            verification_complexity = 'enhanced'
        WHERE category_id IS NULL
    """)

    # Create product_attributes table
    op.create_table('product_attributes',
        sa.Column('attribute_id', postgresql.UUID(as_uuid=True), nullable=False, server_default=sa.text('gen_random_uuid()')),
        sa.Column('product_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('attribute_name', sa.String(length=100), nullable=False),
        sa.Column('attribute_value', sa.Text(), nullable=True),
        sa.Column('attribute_type', sa.String(length=50), nullable=True, server_default='text'),
        sa.Column('display_order', sa.Integer(), nullable=True, server_default='0'),
        sa.Column('is_required', sa.Boolean(), nullable=True, server_default='false'),
        sa.Column('is_public', sa.Boolean(), nullable=True, server_default='true'),
        sa.Column('verification_level', sa.String(length=20), nullable=True, server_default='basic'),
        sa.Column('created_at', sa.DateTime(), nullable=True, server_default=sa.text('now()')),
        sa.ForeignKeyConstraint(['product_id'], ['products.product_id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('attribute_id'),
        sa.UniqueConstraint('product_id', 'attribute_name')
    )

    # Create indexes
    op.create_index('idx_product_attributes_product_id', 'product_attributes', ['product_id'])
    op.create_index('idx_product_attributes_name', 'product_attributes', ['attribute_name'])

    # Create certifications table
    op.create_table('certifications',
        sa.Column('certification_id', postgresql.UUID(as_uuid=True), nullable=False, server_default=sa.text('gen_random_uuid()')),
        sa.Column('product_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('certification_type', sa.String(length=100), nullable=False),
        sa.Column('certification_name', sa.String(length=200), nullable=False),
        sa.Column('issuing_authority', sa.String(length=200), nullable=True),
        sa.Column('certificate_number', sa.String(length=100), nullable=True),
        sa.Column('issue_date', sa.Date(), nullable=True),
        sa.Column('expiry_date', sa.Date(), nullable=True),
        sa.Column('verification_url', sa.Text(), nullable=True),
        sa.Column('document_hash', sa.String(length=64), nullable=True),
        sa.Column('status', sa.String(length=20), nullable=True, server_default='active'),
        sa.Column('created_at', sa.DateTime(), nullable=True, server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(), nullable=True, server_default=sa.text('now()')),
        sa.ForeignKeyConstraint(['product_id'], ['products.product_id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('certification_id')
    )

    # Create indexes for certifications
    op.create_index('idx_certifications_product_id', 'certifications', ['product_id'])
    op.create_index('idx_certifications_status', 'certifications', ['status'])

    # Add industry focus to organizations
    op.add_column('organizations', sa.Column('industry_focus', postgresql.ARRAY(sa.String(length=50)), nullable=True))
    op.add_column('organizations', sa.Column('specialization', sa.Text(), nullable=True))
    op.add_column('organizations', sa.Column('certification_level', sa.String(length=20), nullable=True, server_default='standard'))

    # Add user preferences
    op.add_column('users', sa.Column('industry_focus', postgresql.ARRAY(sa.String(length=50)), nullable=True))
    op.add_column('users', sa.Column('notification_preferences', postgresql.JSONB(astext_type=sa.Text()), nullable=True, server_default='{}'))
    op.add_column('users', sa.Column('verification_level', sa.String(length=20), nullable=True, server_default='standard'))


def downgrade():
    # Remove added columns from users
    op.drop_column('users', 'verification_level')
    op.drop_column('users', 'notification_preferences')
    op.drop_column('users', 'industry_focus')

    # Remove added columns from organizations
    op.drop_column('organizations', 'certification_level')
    op.drop_column('organizations', 'specialization')
    op.drop_column('organizations', 'industry_focus')

    # Drop certifications table
    op.drop_index('idx_certifications_status', table_name='certifications')
    op.drop_index('idx_certifications_product_id', table_name='certifications')
    op.drop_table('certifications')

    # Drop product_attributes table
    op.drop_index('idx_product_attributes_name', table_name='product_attributes')
    op.drop_index('idx_product_attributes_product_id', table_name='product_attributes')
    op.drop_table('product_attributes')

    # Remove foreign key and columns from products
    op.drop_constraint('fk_products_category', 'products', type_='foreignkey')
    op.drop_column('products', 'verification_complexity')
    op.drop_column('products', 'risk_level')
    op.drop_column('products', 'country_of_origin')
    op.drop_column('products', 'warranty_period_months')
    op.drop_column('products', 'model_number')
    op.drop_column('products', 'brand_name')
    op.drop_column('products', 'industry_type')
    op.drop_column('products', 'category_id')

    # Drop product_categories table
    op.drop_table('product_categories')