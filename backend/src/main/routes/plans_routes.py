import uuid

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.orm import Session

from src.main.auth.dependencies import get_current_user, get_db
from src.main.models.plan import Plan
from src.main.models.plan_day import PlanDay
from src.main.models.plan_day_completion import PlanDayCompletion
from src.main.models.user import User


class CompletionUpdate(BaseModel):
    reflection: str | None = Field(default=None, max_length=1000)


def serialize_plan(plan: Plan) -> dict:
    return {
        "id": plan.id,
        "title": plan.title,
        "description": plan.description,
        "theme": plan.theme,
        "minutes": plan.minutes,
        "total_days": plan.total_days,
        "sort_order": plan.sort_order,
    }


def serialize_day(day: PlanDay) -> dict:
    return {
        "id": str(day.id),
        "plan_id": day.plan_id,
        "day_number": day.day_number,
        "title": day.title,
        "subtitle": day.subtitle,
        "content": day.content,
        "reflection": day.reflection,
        "action": day.action,
    }


def serialize_completion(completion: PlanDayCompletion) -> dict:
    return {
        "id": str(completion.id),
        "plan_day_id": str(completion.plan_day_id),
        "reflection": completion.reflection,
        "completed_at": completion.completed_at.isoformat(),
    }


plans_router = APIRouter(tags=["Planos"])


@plans_router.get("/plans")
def list_plans(
    _current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    plans = db.scalars(select(Plan).order_by(Plan.sort_order)).all()
    return [serialize_plan(plan) for plan in plans]


@plans_router.get("/plan-days")
def list_plan_days(
    plan_id: str | None = None,
    _current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    query = select(PlanDay)
    if plan_id:
        query = query.where(PlanDay.plan_id == plan_id)
    days = db.scalars(query.order_by(PlanDay.plan_id, PlanDay.day_number)).all()
    return [serialize_day(day) for day in days]


@plans_router.get("/completions")
def list_completions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    completions = db.scalars(
        select(PlanDayCompletion)
        .where(PlanDayCompletion.user_id == current_user.id)
        .order_by(PlanDayCompletion.completed_at.desc())
    ).all()
    return [serialize_completion(completion) for completion in completions]


@plans_router.put("/plan-days/{plan_day_id}/completion")
def complete_plan_day(
    plan_day_id: uuid.UUID,
    body: CompletionUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not db.get(PlanDay, plan_day_id):
        raise HTTPException(status_code=404, detail="Dia do plano não encontrado")

    completion = db.scalar(
        select(PlanDayCompletion).where(
            PlanDayCompletion.user_id == current_user.id,
            PlanDayCompletion.plan_day_id == plan_day_id,
        )
    )
    reflection = body.reflection.strip() if body.reflection and body.reflection.strip() else None
    if completion:
        completion.reflection = reflection
    else:
        completion = PlanDayCompletion(
            user_id=current_user.id,
            plan_day_id=plan_day_id,
            reflection=reflection,
        )
        db.add(completion)

    db.commit()
    db.refresh(completion)
    return serialize_completion(completion)
