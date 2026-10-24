from sqlalchemy import Integer, String, Text, text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.main.database.base import Base


class Plan(Base):
    __tablename__ = "plans"
    __table_args__ = {"schema": "public"}

    id: Mapped[str] = mapped_column(
        Text, primary_key=True
    )

    title: Mapped[str] = mapped_column(Text, nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    theme: Mapped[str] = mapped_column(Text, nullable=False)
    minutes: Mapped[str] = mapped_column(Text, nullable=False)

    total_days: Mapped[int] = mapped_column(
        Integer, nullable=False
    )

    sort_order: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        server_default=text("0"),
    )

    days: Mapped[list["PlanDay"]] = relationship(
        "PlanDay",
        back_populates="plan",
        passive_deletes=True,
    )