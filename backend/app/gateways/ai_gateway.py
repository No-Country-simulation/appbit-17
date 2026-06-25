"""Gateway de IA — porta de saída para o LLM externo (Google Gemini).

Contrato mínimo: recebe um prompt (texto) + o schema esperado e devolve JSON (texto).
Não há mock — a IA é plugada direto (Gemini). Quem monta prompt e valida é o `AIService`.
"""
from typing import Protocol

from app.core.config import settings


class AIGateway(Protocol):
    def gerar(self, prompt: str, schema: dict) -> str:
        ...


def get_ai_gateway() -> AIGateway:
    if not settings.ai_api_key:
        raise RuntimeError("AI_API_KEY ausente — configure a chave do Gemini no .env / painel do Render.")
    from app.gateways.gemini_gateway import GeminiGateway  # import lazy
    return GeminiGateway()
