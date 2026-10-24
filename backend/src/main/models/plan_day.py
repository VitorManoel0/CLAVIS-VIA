import uuid

from sqlalchemy import (
    ForeignKey,
    Integer,
    Text,
    UniqueConstraint,
    text,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.main.database.base import Base


class PlanDay(Base):
    __tablename__ = "plan_days"

    __table_args__ = (
        UniqueConstraint(
            "plan_id",
            "day_number",
            name="plan_days_plan_id_day_number_key",
        ),
        {"schema": "public"},
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        server_default=text("gen_random_uuid()"),
    )

    plan_id: Mapped[str] = mapped_column(
        Text,
        ForeignKey("public.plans.id", ondelete="CASCADE"),
        nullable=False,
    )

    day_number: Mapped[int] = mapped_column(
        Integer, nullable=False
    )

    title: Mapped[str] = mapped_column(Text, nullable=False)

    subtitle: Mapped[str] = mapped_column(
        Text,
        nullable=False,
        server_default=text("''"),
    )

    content: Mapped[str] = mapped_column(Text, nullable=False)
    reflection: Mapped[str] = mapped_column(Text, nullable=False)
    action: Mapped[str] = mapped_column(Text, nullable=False)

    plan: Mapped["Plan"] = relationship(
        "Plan",
        back_populates="days",
    )

    completions: Mapped[list["PlanDayCompletion"]] = relationship(
        "PlanDayCompletion",
        back_populates="plan_day",
        passive_deletes=True,
    )