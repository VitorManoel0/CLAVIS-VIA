from fastapi import APIRouter, Depends
from src.main.auth.dependencies import get_current_user
from src.main.models.user import User

users_routers = APIRouter(prefix="/users", tags=["Usuários"])

@users_routers.get("/me")
def me(current_user: User = Depends(get_current_user)):
    return {"id": str(current_user.id), "name": current_user.name, "email": current_user.email}
