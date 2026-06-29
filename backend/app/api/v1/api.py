"""Router mestre da v1 (montado sob /api/v1).

Por enquanto só `/health`. Os endpoints `/dados` e `/mapa` serão adicionados pela
frente de Backend/API (outra pessoa do time).
"""

from fastapi import APIRouter

from app.api.v1.endpoints import dados, health

api_router = APIRouter()
api_router.include_router(health.router)
api_router.include_router(dados.router)
