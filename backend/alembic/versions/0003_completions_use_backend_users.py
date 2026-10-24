"""Make plan-day completions reference backend users.

Revision ID: 0003_completions_backend_users
Revises: 0002_checkins_backend_users
"""

from alembic import op


revision = "0003_completions_backend_users"
down_revision = "0002_checkins_backend_users"
branch_labels = None
depends_on = None


def upgrade():
    # Completions created by the previous Supabase authentication reference
    # auth.users IDs. Remove only records that cannot belong to a backend user
    # before moving the foreign key to public.users.
    op.execute(
        """
        DELETE FROM public.plan_day_completions AS completion
        WHERE NOT EXISTS (
            SELECT 1
            FROM public.users AS backend_user
            WHERE backend_user.id = completion.user_id
        )
        """
    )

    op.drop_constraint(
        "plan_day_completions_user_id_fkey",
        "plan_day_completions",
        schema="public",
        type_="foreignkey",
    )
    op.create_foreign_key(
        "plan_day_completions_user_id_fkey",
        "plan_day_completions",
        "users",
        ["user_id"],
        ["id"],
        source_schema="public",
        referent_schema="public",
        ondelete="CASCADE",
    )


def downgrade():
    op.drop_constraint(
        "plan_day_completions_user_id_fkey",
        "plan_day_completions",
        schema="public",
        type_="foreignkey",
    )
    op.create_foreign_key(
        "plan_day_completions_user_id_fkey",
        "plan_day_completions",
        "users",
        ["user_id"],
        ["id"],
        source_schema="public",
        referent_schema="auth",
        ondelete="CASCADE",
    )
