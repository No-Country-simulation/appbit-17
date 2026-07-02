"""Testes do ai_service: montagem de contexto (dois conjuntos) e fallback de erro."""

from app.services.ai_service import AIService


class _GatewayFalho:
    """Gateway que sempre falha — pra exercitar o fallback de baixa confiança."""

    def gerar(self, prompt, *, system=None, response_schema):
        raise RuntimeError("IA indisponível")


def test_montar_contexto_com_dois_conjuntos():
    svc = AIService(gateway=_GatewayFalho())
    ctx = svc.montar_contexto("pergunta", [{"a": 1}], mobilidade=[{"b": 2}])
    assert "CONCENTRACAO_JSON" in ctx
    assert "MOBILIDADE_JSON" in ctx
    assert ctx.rstrip().endswith("pergunta")


def test_montar_contexto_sem_mobilidade_omite_bloco():
    svc = AIService(gateway=_GatewayFalho())
    ctx = svc.montar_contexto("pergunta", [{"a": 1}])
    assert "CONCENTRACAO_JSON" in ctx
    assert "MOBILIDADE_JSON" not in ctx


def test_responder_falha_da_ia_vira_paper_baixa_confianca():
    svc = AIService(gateway=_GatewayFalho())
    paper = svc.responder("pergunta", [{"a": 1}], idioma="pt", mobilidade=[{"b": 2}])
    assert paper.nivel_confianca == "baixa"
    assert paper.afirmacao
