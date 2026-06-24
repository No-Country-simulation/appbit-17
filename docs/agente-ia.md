# 🤖 Agente de IA — Design e Desafios

## O que o agente faz

Recebe uma pergunta em linguagem natural + filtros, e devolve a resposta no formato
**"mini-paper"** (ver [contrato-integracao.md](./contrato-integracao.md)).

Ele **não** é um chatbot solto. É um **redator ancorado em dados**: recebe apenas as linhas
reais filtradas do dataset e é instruído a responder usando *somente* essas linhas.

## Fluxo (padrão "ancorado" / grounded)

```
1. Usuário pergunta  ─▶  POST /dados
2. data_service filtra as linhas relevantes do Vísent (por região/indicador)
3. ai_service monta o contexto: pergunta + linhas filtradas + idioma
4. Provider (Mock ou Gemini) redige a resposta CITANDO só os dados recebidos
5. Pydantic valida o JSON do "paper"  ─▶  resposta ao frontend
```

Por que ancorar? Porque é uma **ferramenta de decisão pública** — uma resposta com número
inventado é pior do que nenhuma resposta.

## Camada provider-agnostic

```python
# app/services/ai_service.py  (esboço conceitual)

class AIProvider(Protocol):
    def responder(self, consulta: str, dados: list[dict], idioma: str) -> RespostaPaper: ...

class MockProvider:   # default — sem chave, resposta realista
    ...

class GeminiProvider: # real — plugado por variável de ambiente (SDK google-genai)
    ...

def get_provider() -> AIProvider:
    if os.getenv("AI_PROVIDER") == "gemini" and os.getenv("AI_API_KEY"):
        return GeminiProvider()
    return MockProvider()
```

Trocar para IA real = definir `AI_PROVIDER=gemini` + `AI_API_KEY=...` no `.env`. **Nada mais muda.**

## Desafios de subir o agente (e mitigação)

| Desafio | Problema | Mitigação |
|---|---|---|
| 🔑 **Chave no backend** | Se chamar IA do navegador, a chave vaza no DevTools | IA só é chamada pelo backend. Frontend nunca vê a chave |
| 💸 **Custo / billing** | Toda API de LLM é paga; free tier limitado | Modelo barato e rápido; respostas curtas; cache de perguntas repetidas |
| ⏱️ **Latência** | Resposta leva 2–8s; Render free dorme (cold start ~30s) | Loading state na UI; opcional streaming; manter serviço acordado no Demo Day |
| 🧠 **Alucinação** | LLM inventa números — inaceitável aqui | Padrão ancorado: IA usa só os dados recebidos; sempre devolve `nivel_confianca` + `fontes` |
| 📐 **Saída estruturada** | JSON do "paper" às vezes vem fora do formato | Forçar JSON (structured output / tool use) + validar com Pydantic + fallback |
| 🌐 **Multilíngue** | PT/ES/EN | Passar `idioma` no prompt; LLM faz nativo |
| 🔒 **Privacidade/LGPD** | Enviar dado a terceiro | Vísent é anonimizado (K=3); regra: nunca enviar PII |
| 🔁 **Rate limit / falha** | Provedor cai no Demo Day ao vivo | Retry com backoff + timeout + fallback "tente novamente"; nunca travar a tela |
| 🧪 **Prompt injection** | Usuário tenta burlar instruções via texto | Tratar a pergunta como dado, não como instrução; separar contexto de sistema |

## Provedor escolhido: Google Gemini

O provedor é o **Google Gemini** (API). SDK Python: **`google-genai`** (`from google import genai`).
Modelo sugerido: um **Flash** (rápido/barato), ex. `gemini-2.5-flash` — confirmar a versão atual
na documentação oficial do Gemini antes de codar.

**Regras:**
- A chave (`AI_API_KEY`) vive **só** no backend, via variável de ambiente, **nunca** versionada.
- A integração fica **isolada** no `GeminiProvider` (um arquivo).
- O `MockProvider` continua como **default** (até a chave existir) e como fallback demonstrável.
- Pedir **saída em JSON** (response schema do Gemini) e validar com Pydantic.
