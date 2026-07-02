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
    "SOMENTE os dados fornecidos. NUNCA invente números nem fatos.\n"
    "CONJUNTOS DISPONÍVEIS (escolha o adequado à pergunta):\n"
    "- CONCENTRACAO_JSON: pessoas, congestionamento, queda de rede e renda por zona/período. "
    "Renda vem como 'renda_baixa_pct' (% de assinantes nas faixas baixas C+D).\n"
    "- MOBILIDADE_JSON: fluxos origem→destino entre zonas (nº de viagens/usuários, distância, "
    "período). Use para deslocamento/origem-destino/fluxo.\n"
    "REGRAS DE FIDELIDADE AOS DADOS:\n"
    "- Todo número em 'evidencias[].valor' deve ser copiado dos dados, sem arredondar, "
    "estimar nem extrapolar. Se um valor não está nos dados, ele não existe — não o cite.\n"
    "- Não calcule métricas derivadas que não estejam no JSON. Use apenas os campos presentes.\n"
    "- Se os dados não bastarem para responder, diga isso na 'afirmacao' e use "
    "nivel_confianca='baixa'. Cite sempre a fonte.\n"
    "RANQUEAMENTO MULTI-MÉTRICA (perguntas que cruzam mais de um indicador, ex. concentração "
    "alta E rede ruim):\n"
    "- Priorize as regiões que estão no topo de TODAS as métricas pedidas ao mesmo tempo, não "
    "as que lideram em uma só.\n"
    "- Não troque uma diferença grande e consistente por um valor extremo isolado/ruidoso: "
    "uma região campeã numa métrica mas mediana na outra perde para uma que é forte nas duas.\n"
    "MÉTRICA QUASE UNIFORME (regra OBRIGATÓRIA, vale para QUALQUER pergunta de ranking): antes de "
    "eleger um topo, compare o maior e o menor valor da métrica entre as zonas. Se a diferença "
    "(máximo − mínimo) for menor que ~5% do valor máximo, a métrica é praticamente uniforme: você "
    "ATÉ PODE nomear a zona com o maior valor, mas DEVE afirmar explicitamente que a diferença para "
    "as demais é marginal/desprezível e que a métrica não diferencia bem as zonas, usando "
    "nivel_confianca='baixa'. Aplique isso SEMPRE — inclusive para drop_rede e congestionamento, "
    "que são quase planos neste dado. Em especial, 'renda_baixa_pct' é quase constante entre zonas "
    "— não há 'zonas de baixa renda' distintas.\n"
    "PROXY / PERGUNTA ABERTA: se a pergunta usa um conceito que NÃO é medido diretamente pelos dados "
    "(ex. 'falta de infraestrutura', 'cobertura 4G', 'qualidade de vida') e você responde com uma "
    "métrica relacionada (ex. drop_rede, congestionamento), DECLARE na 'afirmacao' que é uma "
    "APROXIMAÇÃO — diga qual métrica usou e que ela não mede o conceito diretamente — e use "
    "nivel_confianca no máximo 'media'. Nunca apresente um proxy como se fosse medida direta.\n"
    "RESPONDA SEMPRE EM {idioma} — independentemente do idioma da pergunta ou dos dados."
)


class AIService:
    def __init__(self, gateway: AIGateway) -> None:
        self._gateway = gateway

    def montar_contexto(
        self, consulta: str, dados: list[dict], mobilidade: list[dict] | None = None
    ) -> str:
        partes = ["CONCENTRACAO_JSON:\n" + json.dumps(dados, ensure_ascii=False, default=str)]
        if mobilidade:
            partes.append(
                "MOBILIDADE_JSON:\n" + json.dumps(mobilidade, ensure_ascii=False, default=str)
            )
        return "\n\n".join(partes) + "\n\nPERGUNTA:\n" + consulta

    def responder(
        self,
        consulta: str,
        dados: list[dict],
        idioma: str = "pt",
        mobilidade: list[dict] | None = None,
    ) -> RespostaPaper:
        idioma_nome = _IDIOMA_NOME.get(idioma, _IDIOMA_NOME["pt"])
        system = _SYSTEM.format(idioma=idioma_nome)
        contexto = self.montar_contexto(consulta, dados, mobilidade)
        try:
            bruto = self._gateway.gerar(contexto, system=system, response_schema=RespostaPaper)
            return RespostaPaper.model_validate_json(bruto)
        except Exception:  # noqa: BLE001 — fallback amplo de propósito (IA é externa)
            logger.exception("Falha ao gerar/validar a resposta da IA")
            return RespostaPaper(
                afirmacao="Não foi possível gerar a resposta agora (IA indisponível). Tente novamente.",
                nivel_confianca="baixa",
            )
