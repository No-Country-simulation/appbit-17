"""App BiT — API (FastAPI). Ponto de entrada."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.api import api_router
from app.core.config import settings


def create_app() -> FastAPI:
    app = FastAPI(title="App BiT — API", version="0.1.0")

    app.add_middleware(
        CORSMiddleware,
        allow_origins=[o for o in ["http://localhost:5173", settings.frontend_origin] if o],
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(api_router, prefix="/api/v1")  # /api/v1/health, /api/v1/dados, /api/v1/mapa

    @app.get("/", tags=["meta"], summary="Info da API")
    def raiz() -> dict:
        """Página raiz — evita 404 em https://<host>/ e aponta pros recursos da API."""
        return {
            "nome": app.title,
            "versao": app.version,
            "status": "ok",
            "docs": "/docs",
            "health": "/api/v1/health",
            "consulta": "POST /api/v1/dados",
        }

    return app


app = create_app()
