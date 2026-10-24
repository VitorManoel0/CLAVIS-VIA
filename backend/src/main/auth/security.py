import os
from datetime import datetime, timedelta, timezone
import jwt
from pwdlib import PasswordHash

password_hash = PasswordHash.recommended()
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "change-me-in-development")
JWT_EXPIRE_MINUTES = int(os.getenv("JWT_EXPIRE_MINUTES", "60"))

def hash_password(password: str) -> str: return password_hash.hash(password)
def verify_password(password: str, hashed: str) -> bool: return password_hash.verify(password, hashed)
def create_access_token(subject: str) -> str:
    expires = datetime.now(timezone.utc) + timedelta(minutes=JWT_EXPIRE_MINUTES)
    return jwt.encode({"sub": subject, "exp": expires}, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)
def decode_access_token(token: str) -> dict:
    return jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
