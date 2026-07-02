"""Serviço de IA — um módulo pro texto, outro pra orquestração; interface estável aqui.

`prompts.py` = o que a IA lê (system ancorado + contexto rotulado; é o artefato mais
editado). `service.py` = AIService, que orquestra gateway + validação + fallback.
"""

from app.services.ia.prompts import montar_contexto, montar_system
from app.services.ia.service import AIService

__all__ = ["AIService", "montar_contexto", "montar_system"]
