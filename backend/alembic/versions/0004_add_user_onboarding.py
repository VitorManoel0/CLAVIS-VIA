"""Track whether a user completed onboarding.

Revision ID: 0004_user_onboarding
Revises: 0003_completions_backend_users
"""

import sqlalchemy as sa
from alembic import op


revision = "0004_user_onboarding"
down_revision = "0003_completions_backend_users"
branch_labels = None
depends_on = None


def upgrade():
    # Existing accounts already know the product, so only new users should see
    # onboarding automatically after this migration.
    op.add_column(
        "users",
        sa.Column("onboarding_completed", sa.Boolean(), nullable=True),
        schema="public",
    )
    op.execute("UPDATE public.users SET onboarding_completed = true")
    op.alter_column(
        "users",
        "onboarding_completed",
        nullable=False,
        server_default=sa.false(),
        schema="public",
    )


def downgrade():
    op.drop_column("users", "onboarding_completed", schema="public")
