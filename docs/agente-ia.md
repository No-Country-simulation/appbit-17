# 🤖 Agente de IA — Design e Desafios

## O que o agente faz

Recebe uma pergunta em linguagem natural + filtros, e devolve a resposta no formato
**"mini-paper"** (ver [contrato-integracao.md](./contrato-integracao.md)).

Ele **não** é um chatbot solto. É um **redator ancorado em dados**: recebe apenas as linhas
reais filtradas do dataset e é instruído a responder usando *somente* essas linhas.

## Fluxo (padrão "ancorado" / grounded)

```
1. Usuário pergunta  ─▶  POST /api/v1/dados
2. data_service filtra as linhas relevantes do Vísent (por região/indicador)
3. ai_service monta o contexto (linhas + pergunta) e as instruções (system)
4. ai_gateway chama o Gemini → JSON do "paper" (response_schema força o formato)
5. ai_service valida no RespostaPaper (Pydantic)  ─▶  resposta ao frontend
```

Por que ancorar? Porque é uma **ferramenta de decisão pública** — uma resposta com número
inventado é pior do que nenhuma resposta.

## Camadas: service + gateway (sem mock)

A lógica (montar prompt + validar) fica no **`ai_service`**; a chamada externa fica no
**`ai_gateway`** (adapter). **Não há mock** — é Gemini direto.

```python
# app/services/ai_service.py — monta prompt + valida (NÃO chama a API)
class AIService:
    def responder(self, consulta, dados, idioma="pt") -> RespostaPaper:
        system = _SYSTEM.format(idioma=idioma)
        contexto = self.montar_contexto(consulta, dados)   # DADOS_JSON + PERGUNTA
        try:
            bruto = self._gateway.gerar(contexto, system=system, response_schema=RespostaPaper)
            return RespostaPaper.model_validate_json(bruto)
        except Exception:           # IA falhou/voltou inválido → fallback (sem 500)
            return RespostaPaper(afirmacao="IA indisponível…", nivel_confianca="baixa")

# app/gateways/gemini_gateway.py — adapter externo (Gemini)
class GeminiGateway:
    def gerar(self, prompt, *, system, response_schema) -> str:
        resp = self._client.models.generate_content(
            model=settings.ai_model, contents=prompt,
            config={"system_instruction": system,
                    "response_mime_type": "application/json",
                    "response_schema": response_schema, "temperature": 0.2})
        return resp.text
```

`get_ai_gateway()` devolve sempre o `GeminiGateway` (a chave é checada **lazy** em `gerar()` →
sem chave, cai no fallback do `ai_service`, não 500). Plugar a IA
= setar `AI_API_KEY` no `.env`/painel do Render. **Nada mais muda.**

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

## Provedor: Google Gemini (implementação)

SDK Python **`google-genai`** (`from google import genai`). Modelo `gemini-3.5-flash`.

**Chamada correta:** `client.models.generate_content(model, contents, config)` — **NÃO**
`client.interactions.create(...)` (no SDK 2.x esse método não aceita `model/input/response_format`
como kwargs → `TypeError`).

**Saída estruturada:** `config.response_mime_type="application/json"` +
`config.response_schema=RespostaPaper` (passa o **modelo Pydantic**, não o `model_json_schema()` —
o SDK converte, inclusive aninhado/Optional). Ler `resp.text` e validar com Pydantic.

**Regras:**
- `AI_API_KEY` vive **só** no backend, **nunca** versionada (obrigatória em prod).
- Integração isolada no `GeminiGateway`; prompt/validação no `ai_service`.
- **Sem mock** — sem a chave, a IA cai no **fallback** do `ai_service` (não 500). Timeout de **30s** na chamada.
- `system_instruction` separado do conteúdo (reduz prompt-injection).
- Schemas **tipados** (ex.: `PontoMapa`) — structured output rejeita `dict` cru.
