from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session
from src.main.auth.dependencies import get_db, get_current_user
from src.main.auth.security import create_access_token, hash_password, verify_password
from src.main.models.user import User
from src.main.validators.user_register_validator import UserLoginValidator, UserRegisterValidator

auth_router = APIRouter(prefix="/auth", tags=["Autenticação"])


def public_user(user: User):
    return {
        "id": str(user.id),
        "name": user.name,
        "email": user.email,
        "onboarding_completed": user.onboarding_completed,
    }


def token_response(user: User):
    return {
        "user": public_user(user),
        "access_token": create_access_token(str(user.id)),
        "token_type": "bearer",
    }

@auth_router.post("/register", status_code=status.HTTP_201_CREATED)
def register(body: UserRegisterValidator, db: Session = Depends(get_db)):
    email = body.email.strip().lower()
    if db.scalar(select(User).where(User.email == email)): raise HTTPException(status_code=409, detail="E-mail já cadastrado")
    user = User(name=body.name.strip(), email=email, password_hash=hash_password(body.password))
    db.add(user); db.commit(); db.refresh(user)
    return token_response(user)

@auth_router.post("/login")
def login(body: UserLoginValidator, db: Session = Depends(get_db)):
    user = db.scalar(select(User).where(User.email == body.email.strip().lower()))
    if not user or not verify_password(body.password, user.password_hash): raise HTTPException(status_code=401, detail="E-mail ou senha inválidos")
    return token_response(user)

@auth_router.get("/me")
def me(user: User = Depends(get_current_user)): return public_user(user)


@auth_router.patch("/onboarding")
def complete_onboarding(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    user.onboarding_completed = True
    db.commit()
    db.refresh(user)
    return public_user(user)
