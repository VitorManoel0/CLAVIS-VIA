import uuid
from datetime import datetime

from sqlalchemy import (
    CheckConstraint,
    DateTime,
    ForeignKey,
    Text,
    UniqueConstraint,
    text,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.main.database.base import Base


class PlanDayCompletion(Base):
    __tablename__ = "plan_day_completions"
    __table_args__ = (
        UniqueConstraint(
            "user_id",
            "plan_day_id",
            name="plan_day_completions_user_id_plan_day_id_key",
        ),
        CheckConstraint(
            "char_length(reflection) <= 1000",
            name="plan_day_completions_reflection_check",
        ),
        {"schema": "public"},
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        server_default=text("gen_random_uuid()"),
    )

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("public.users.id", ondelete="CASCADE"),
        nullable=False,
    )

    plan_day_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("public.plan_days.id", ondelete="CASCADE"),
        nullable=False,
    )

    reflection: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    completed_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=text("now()"),
        nullable=False,
    )

    user: Mapped["User"] = relationship(
        "User",
        back_populates="completions",
    )

    plan_day: Mapped["PlanDay"] = relationship(
        "PlanDay",
        back_populates="completions",
    )