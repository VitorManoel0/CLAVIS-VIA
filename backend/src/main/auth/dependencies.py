from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session
import jwt
from src.main.auth.security import decode_access_token
from src.main.database.connection import SessionLocal
from src.main.models.user import User

bearer = HTTPBearer(auto_error=False)
def get_db():
    db = SessionLocal()
    try: yield db
    finally: db.close()

def get_current_user(credentials: HTTPAuthorizationCredentials | None = Depends(bearer), db: Session = Depends(get_db)) -> User:
    error = HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Credenciais inválidas", headers={"WWW-Authenticate": "Bearer"})
    if not credentials: raise error
    try:
        user_id = decode_access_token(credentials.credentials).get("sub")
        if not user_id: raise error
    except (jwt.InvalidTokenError, ValueError): raise error
    user = db.get(User, user_id)
    if not user or not user.is_active: raise error
    return user
