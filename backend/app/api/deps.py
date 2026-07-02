"""Dependências FastAPI (injeção)."""

from functools import lru_cache

from app.gateways.ai_gateway import get_ai_gateway
from app.services.ia import AIService


@lru_cache
def get_ai_service() -> AIService:
    """Singleton do AIService (com o gateway escolhido por env)."""
    return AIService(get_ai_gateway())
