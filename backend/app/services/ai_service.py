"""Service de IA — lógica de aplicação (NÃO faz a chamada externa).

Monta o contexto (padrão ANCORADO: usa só os dados recebidos), passa as instruções
como `system`, delega a chamada ao `AIGateway` e valida a resposta no schema do "paper".
Se a IA falhar ou devolver algo inválido, retorna um "paper" de baixa confiança (sem 500).
"""

import json
import logging

from app.gateways.ai_gateway import AIGateway
from app.schemas.dados import RespostaPaper

logger = logging.getLogger(__name__)

# código do idioma → nome explícito (a IA obedece melhor o nome do que o código "pt")
_IDIOMA_NOME = {
    "pt": "português (Brasil)",
    "es": "español",
    "en": "English",
}

_SYSTEM = (
    "Você é um analista de dados públicos para gestores. Responda à PERGUNTA usando "
    "SOMENTE os dados em DADOS_JSON. NUNCA invente números nem fatos. Se os dados não "
    "bastarem, diga isso na 'afirmacao' e use nivel_confianca='baixa'. Cite sempre a "
    "fonte. RESPONDA SEMPRE EM {idioma} — independentemente do idioma da pergunta ou dos dados."
)


class AIService:
    def __init__(self, gateway: AIGateway) -> None:
        self._gateway = gateway

    def montar_contexto(self, consulta: str, dados: list[dict]) -> str:
        return (
            "DADOS_JSON:\n"
            + json.dumps(dados, ensure_ascii=False, default=str)
            + "\n\nPERGUNTA:\n"
            + consulta
        )

    def responder(self, consulta: str, dados: list[dict], idioma: str = "pt") -> RespostaPaper:
        idioma_nome = _IDIOMA_NOME.get(idioma, _IDIOMA_NOME["pt"])
        system = _SYSTEM.format(idioma=idioma_nome)
        contexto = self.montar_contexto(consulta, dados)
        try:
            bruto = self._gateway.gerar(contexto, system=system, response_schema=RespostaPaper)
            return RespostaPaper.model_validate_json(bruto)
        except Exception:  # noqa: BLE001 — fallback amplo de propósito (IA é externa)
            logger.exception("Falha ao gerar/validar a resposta da IA")
            return RespostaPaper(
                afirmacao="Não foi possível gerar a resposta agora (IA indisponível). Tente novamente.",
                nivel_confianca="baixa",
            )
