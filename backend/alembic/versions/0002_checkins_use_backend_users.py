"""Make check-ins reference backend users.

Revision ID: 0002_checkins_backend_users
Revises: 0001_create_users
"""

from alembic import op


revision = "0002_checkins_backend_users"
down_revision = "0001_create_users"
branch_labels = None
depends_on = None


def upgrade():
    op.drop_constraint(
        "checkins_user_id_fkey",
        "checkins",
        schema="public",
        type_="foreignkey",
    )
    op.create_foreign_key(
        "checkins_user_id_fkey",
        "checkins",
        "users",
        ["user_id"],
        ["id"],
        source_schema="public",
        referent_schema="public",
        ondelete="CASCADE",
    )


def downgrade():
    op.drop_constraint(
        "checkins_user_id_fkey",
        "checkins",
        schema="public",
        type_="foreignkey",
    )
    op.create_foreign_key(
        "checkins_user_id_fkey",
        "checkins",
        "users",
        ["user_id"],
        ["id"],
        source_schema="public",
        referent_schema="auth",
        ondelete="CASCADE",
    )
