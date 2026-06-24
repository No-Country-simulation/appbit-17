"""App BiT — API (FastAPI). Ponto de entrada."""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.api.v1.api import api_router
from app.api.v1.endpoints import health


def create_app() -> FastAPI:
    app = FastAPI(title="App BiT — API", version="0.1.0")

    app.add_middleware(
        CORSMiddleware,
        allow_origins=[o for o in ["http://localhost:5173", settings.frontend_origin] if o],
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(health.router)                 # /health (sem versão — usado no healthcheck)
    app.include_router(api_router, prefix="/api/v1")  # /api/v1/dados, /api/v1/mapa
    return app


app = create_app()
