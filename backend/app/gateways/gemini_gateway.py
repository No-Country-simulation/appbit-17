"""Gateway real — Google Gemini (Interactions API, SDK google-genai).

Ref.: https://ai.google.dev/gemini-api/docs
"""
from app.core.config import settings


class GeminiGateway:
    def __init__(self) -> None:
        from google import genai  # import lazy (só quando o gateway é usado)
        self._client = genai.Client(api_key=settings.ai_api_key)

    def gerar(self, prompt: str, schema: dict) -> str:
        interaction = self._client.interactions.create(
            model=settings.ai_model,
            input=prompt,
            response_format={
                "type": "text",
                "mime_type": "application/json",
                "schema": schema,
            },
        )
        return interaction.output_text
