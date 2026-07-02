"""Testes do pacote de IA: montagem de contexto, idioma e fallback de erro."""

import json

from app.services.ia import AIService, montar_contexto


class _GatewayFalho:
    """Gateway que sempre falha — pra exercitar o fallback de baixa confiança."""

    def gerar(self, prompt, *, system=None, response_schema):
        raise RuntimeError("IA indisponível")


class _GatewayEco:
    """Gateway falso que captura o que recebeu e devolve um paper válido."""

    def __init__(self):
        self.prompt = None
        self.system = None

    def gerar(self, prompt, *, system=None, response_schema):
        self.prompt = prompt
        self.system = system
        return json.dumps({"afirmacao": "ok", "nivel_confianca": "alta"})


def test_montar_contexto_com_dois_conjuntos():
    ctx = montar_contexto("pergunta", [{"a": 1}], mobilidade=[{"b": 2}])
    assert "CONCENTRACAO_JSON" in ctx
    assert "MOBILIDADE_JSON" in ctx
    assert ctx.rstrip().endswith("pergunta")


def test_montar_contexto_sem_mobilidade_omite_bloco():
    ctx = montar_contexto("pergunta", [{"a": 1}])
    assert "CONCENTRACAO_JSON" in ctx
    assert "MOBILIDADE_JSON" not in ctx


def test_responder_sucesso_valida_paper_e_manda_conjuntos_no_prompt():
    gw = _GatewayEco()
    paper = AIService(gateway=gw).responder(
        "pergunta", [{"a": 1}], idioma="pt", mobilidade=[{"b": 2}]
    )
    assert paper.afirmacao == "ok"
    assert paper.nivel_confianca == "alta"
    # o gateway deve receber os conjuntos rotulados no prompt e as instruções no system
    assert "CONCENTRACAO_JSON" in gw.prompt
    assert "MOBILIDADE_JSON" in gw.prompt
    assert "SOMENTE os dados fornecidos" in gw.system


def test_system_vai_no_idioma_pedido_com_fallback_pt():
    gw = _GatewayEco()
    svc = AIService(gateway=gw)
    svc.responder("pergunta", [], idioma="es")
    assert "español" in gw.system
    svc.responder("pergunta", [], idioma="xx")  # desconhecido → português
    assert "português (Brasil)" in gw.system


def test_responder_falha_da_ia_vira_paper_baixa_confianca():
    svc = AIService(gateway=_GatewayFalho())
    paper = svc.responder("pergunta", [{"a": 1}], idioma="pt", mobilidade=[{"b": 2}])
    assert paper.nivel_confianca == "baixa"
    assert paper.afirmacao
