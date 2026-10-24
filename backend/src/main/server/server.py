from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from src.main.routes.users_routes import users_routers
from src.main.routes.auth_routes import auth_router
from src.main.routes.checkins_routes import checkins_router
from src.main.routes.plans_routes import plans_router
from src.main.auth.security import decode_access_token
import jwt
import os

app = FastAPI()

PUBLIC_PATHS = {
    "/health",
    "/auth/login",
    "/auth/register",
    "/docs",
    "/docs/oauth2-redirect",
    "/redoc",
    "/openapi.json",
}

@app.middleware("http")
async def require_jwt(request: Request, call_next):
    if request.method == "OPTIONS" or request.url.path in PUBLIC_PATHS:
        return await call_next(request)
    authorization = request.headers.get("Authorization", "")
    if not authorization.startswith("Bearer "):
        return JSONResponse(status_code=401, content={"detail": "Token de acesso obrigatório"})
    try:
        decode_access_token(authorization.removeprefix("Bearer ").strip())
    except (jwt.InvalidTokenError, ValueError):
        return JSONResponse(status_code=401, content={"detail": "Token inválido ou expirado"})
    return await call_next(request)

# Accept a comma-separated list for deployments or LAN development.
# Register CORS last so even JWT rejections include the CORS headers.
frontend_origins = [
    origin.strip().rstrip("/")
    for origin in os.getenv(
        "FRONTEND_URLS",
        "http://localhost:8080,http://127.0.0.1:8080",
    ).split(",")
    if origin.strip()
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=frontend_origins,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["Authorization", "Content-Type"],
)


@app.get("/health", tags=["Infraestrutura"])
def health():
    return {"status": "ok"}

app.include_router(users_routers)
app.include_router(auth_router)
app.include_router(checkins_router)
app.include_router(plans_router)
