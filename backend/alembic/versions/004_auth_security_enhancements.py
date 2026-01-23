"""Auth security enhancements

Revision ID: 004_auth_security
Revises: 003_performance_indexes
Create Date: 2026-01-21

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers
revision = '004_auth_security'
down_revision = '003_performance_indexes'
branch_labels = None
depends_on = None


def upgrade():
    # Add email verification token fields
    op.add_column('users', sa.Column('email_verification_token', sa.String(255), nullable=True))
    op.add_column('users', sa.Column('email_verification_token_expires', sa.DateTime(), nullable=True))
    
    # Add password reset fields
    op.add_column('users', sa.Column('password_reset_token', sa.String(255), nullable=True))
    op.add_column('users', sa.Column('password_reset_token_expires', sa.DateTime(), nullable=True))
    op.add_column('users', sa.Column('password_changed_at', sa.DateTime(), nullable=True))
    
    # Add account lockout fields
    op.add_column('users', sa.Column('failed_login_attempts', sa.Integer(), server_default='0', nullable=False))
    op.add_column('users', sa.Column('account_locked_until', sa.DateTime(), nullable=True))
    
    # Create audit_logs table
    op.create_table(
        'audit_logs',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.user_id', ondelete='SET NULL'), nullable=True),
        sa.Column('action', sa.String(100), nullable=False),
        sa.Column('resource_type', sa.String(50), nullable=True),
        sa.Column('resource_id', sa.String(255), nullable=True),
        sa.Column('ip_address', sa.String(45), nullable=True),
        sa.Column('user_agent', sa.String(500), nullable=True),
        sa.Column('details', postgresql.JSONB, nullable=True),
        sa.Column('status', sa.String(20), nullable=False),  # SUCCESS, FAILURE
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()'), nullable=False),
        sa.Index('idx_audit_logs_user_id', 'user_id'),
        sa.Index('idx_audit_logs_action', 'action'),
        sa.Index('idx_audit_logs_created_at', 'created_at'),
    )


def downgrade():
    # Drop audit_logs table
    op.drop_table('audit_logs')
    
    # Remove account lockout fields
    op.drop_column('users', 'account_locked_until')
    op.drop_column('users', 'failed_login_attempts')
    
    # Remove password reset fields
    op.drop_column('users', 'password_changed_at')
    op.drop_column('users', 'password_reset_token_expires')
    op.drop_column('users', 'password_reset_token')
    
    # Remove email verification fields
    op.drop_column('users', 'email_verification_token_expires')
    op.drop_column('users', 'email_verification_token')
