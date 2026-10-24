import uuid
from datetime import datetime

from sqlalchemy import (
    CheckConstraint,
    DateTime,
    ForeignKey,
    Index,
    Text,
    text,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.main.database.base import Base


class Checkin(Base):
    __tablename__ = "checkins"
    __table_args__ = (
        CheckConstraint(
            "mood IN ("
            "'pesada', 'ansiosa', 'desanimada', "
            "'irritada', 'sensivel', 'em_paz', "
            "'esperancosa', 'outro')",
            name="checkins_mood_check",
        ),
        CheckConstraint(
            "char_length(note) <= 500",
            name="checkins_note_check",
        ),
        Index(
            "checkins_user_created_idx",
            "user_id",
            text("created_at DESC"),
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

    mood: Mapped[str] = mapped_column(Text, nullable=False)

    note: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=text("now()"),
        nullable=False,
    )

    user: Mapped["User"] = relationship(
        "User",
        back_populates="checkins",
    )