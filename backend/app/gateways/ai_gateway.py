"""Gateway de IA — porta de saída para o LLM externo (Google Gemini).

Contrato: recebe `prompt` (conteúdo do usuário), um `system` (instruções) e o
`response_schema` (modelo Pydantic da saída); devolve JSON (texto).
Não há mock — a IA é plugada direto (Gemini). Quem monta prompt e valida é o `AIService`.

A checagem da chave fica DENTRO do `GeminiGateway.gerar()` (não aqui) — assim, sem
`AI_API_KEY`, o erro é capturado pelo `AIService` (fallback) em vez de virar 500 na
resolução da dependência.
"""
from typing import Protocol

from pydantic import BaseModel


class AIGateway(Protocol):
    def gerar(self, prompt: str, *, system: str | None = None,
              response_schema: type[BaseModel]) -> str:
        ...


def get_ai_gateway() -> AIGateway:
    from app.gateways.gemini_gateway import GeminiGateway  # import lazy
    return GeminiGateway()
