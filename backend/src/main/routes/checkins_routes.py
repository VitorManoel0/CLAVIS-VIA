from typing import Literal

from fastapi import APIRouter, Depends, status
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.orm import Session

from src.main.auth.dependencies import get_current_user, get_db
from src.main.models.checkin import Checkin
from src.main.models.user import User


Mood = Literal[
    "pesada",
    "ansiosa",
    "desanimada",
    "irritada",
    "sensivel",
    "em_paz",
    "esperancosa",
    "outro",
]


class CheckinCreate(BaseModel):
    mood: Mood
    note: str | None = Field(default=None, max_length=500)


def serialize_checkin(checkin: Checkin) -> dict[str, str | None]:
    return {
        "id": str(checkin.id),
        "mood": checkin.mood,
        "note": checkin.note,
        "created_at": checkin.created_at.isoformat(),
    }


checkins_router = APIRouter(prefix="/checkins", tags=["Check-ins"])


@checkins_router.get("")
def list_checkins(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    checkins = db.scalars(
        select(Checkin)
        .where(Checkin.user_id == current_user.id)
        .order_by(Checkin.created_at.desc())
        .limit(60)
    ).all()
    return [serialize_checkin(checkin) for checkin in checkins]


@checkins_router.post("", status_code=status.HTTP_201_CREATED)
def create_checkin(
    body: CheckinCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    checkin = Checkin(
        user_id=current_user.id,
        mood=body.mood,
        note=body.note.strip() if body.note and body.note.strip() else None,
    )
    db.add(checkin)
    db.commit()
    db.refresh(checkin)
    return serialize_checkin(checkin)
