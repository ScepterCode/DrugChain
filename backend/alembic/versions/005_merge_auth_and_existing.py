"""Merge auth security and existing migrations

Revision ID: 005_merge_auth
Revises: 004_auth_security, 3b6b4b73fd04
Create Date: 2026-01-23

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers
revision = '005_merge_auth'
down_revision = ('004_auth_security', '3b6b4b73fd04')
branch_labels = None
depends_on = None


def upgrade():
    pass


def downgrade():
    pass
