"""Router mestre da v1 — endpoints de negócio (montados sob /api/v1).

`/health` fica fora da versão (montado na raiz pelo main.py).
"""
from fastapi import APIRouter

from app.api.v1.endpoints import dados, mapa

api_router = APIRouter()
api_router.include_router(dados.router)
api_router.include_router(mapa.router)
