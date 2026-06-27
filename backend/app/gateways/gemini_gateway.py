"""Gateway real — Google Gemini (SDK google-genai, models.generate_content).

Saída estruturada via `response_schema` (modelo Pydantic) + `response_mime_type=json`.
Client criado de forma lazy: se faltar a chave, o erro acontece em `gerar()` (não na
resolução da dependência) → o `AIService` captura e devolve um "paper" de baixa confiança.
Ref.: https://ai.google.dev/gemini-api/docs/structured-output
"""
from pydantic import BaseModel

from app.core.config import settings

_TIMEOUT_MS = 30_000  # 30s (HttpOptions.timeout é em milissegundos)


class GeminiGateway:
    def __init__(self) -> None:
        self._client = None  # criado na 1ª chamada (lazy)

    def _client_ou_erro(self):
        if self._client is None:
            if not settings.ai_api_key:
                raise RuntimeError("AI_API_KEY ausente — configure a chave do Gemini.")
            from google import genai  # import lazy
            self._client = genai.Client(api_key=settings.ai_api_key)
        return self._client

    def gerar(self, prompt: str, *, system: str | None = None,
              response_schema: type[BaseModel]) -> str:
        resp = self._client_ou_erro().models.generate_content(
            model=settings.ai_model,
            contents=prompt,
            config={
                "system_instruction": system,
                "response_mime_type": "application/json",
                "response_schema": response_schema,  # o SDK converte o Pydantic (inclusive aninhado)
                "temperature": 0.2,
                "http_options": {"timeout": _TIMEOUT_MS},
            },
        )
        return resp.text
