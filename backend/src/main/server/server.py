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
# frontend_origins = os.getenv(
#     "FRONTEND_URLS",
#     os.getenv("FRONTEND_URL", "http://localhost:8080,http://127.0.0.1:8080"),
# )
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["Authorization", "Content-Type"],
)

app.include_router(users_routers)
app.include_router(auth_router)
app.include_router(checkins_router)
app.include_router(plans_router)
