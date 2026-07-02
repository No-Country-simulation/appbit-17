"""Service de IA — lógica de aplicação (NÃO faz a chamada externa).

Orquestra: monta o prompt via `prompts.py` (padrão ANCORADO: usa só os dados
recebidos), delega a chamada ao `AIGateway` e valida a resposta no schema do "paper".
Se a IA falhar ou devolver algo inválido, retorna um "paper" de baixa confiança (sem 500).
"""

import logging

from app.gateways.ai_gateway import AIGateway
from app.schemas.dados import RespostaPaper
from app.services.ia.prompts import montar_contexto, montar_system

logger = logging.getLogger(__name__)


class AIService:
    def __init__(self, gateway: AIGateway) -> None:
        self._gateway = gateway

    def responder(
        self,
        consulta: str,
        dados: list[dict],
        idioma: str = "pt",
        mobilidade: list[dict] | None = None,
    ) -> RespostaPaper:
        system = montar_system(idioma)
        contexto = montar_contexto(consulta, dados, mobilidade)
        try:
            bruto = self._gateway.gerar(contexto, system=system, response_schema=RespostaPaper)
            return RespostaPaper.model_validate_json(bruto)
        except Exception:  # noqa: BLE001 — fallback amplo de propósito (IA é externa)
            logger.exception("Falha ao gerar/validar a resposta da IA")
            return RespostaPaper(
                afirmacao="Não foi possível gerar a resposta agora (IA indisponível). Tente novamente.",
                nivel_confianca="baixa",
            )
