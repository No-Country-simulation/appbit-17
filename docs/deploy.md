# 🚀 Deploy no Render — monorepo (2 apps, 1 repo)

Como subir **frontend + backend do mesmo repositório** no Render usando o Blueprint
(`render.yaml` na raiz). Frente responsável: **Infra (frente 6)**.

> Pré-requisito: o `render.yaml` já está na raiz do projeto. Ele declara 2 serviços.

## O desafio

Um repo, duas apps com runtimes diferentes:

```
appbit-17/  (1 repo, 1 push)
├── render.yaml      ← declara os 2 serviços
├── backend/         → serviço "appbit-api"   (runtime: python, uvicorn)
└── frontend/        → serviço "appbit-web"   (runtime: static, Vite build)
```

Não dá pra "fazer um deploy só". A solução é o **Blueprint**: 2 serviços no mesmo arquivo,
cada um apontando para uma subpasta via `rootDir`.

## Como os campos do `render.yaml` resolvem cada armadilha

| Armadilha | Campo que resolve |
|---|---|
| Runtimes diferentes (Python vs estático) | dois serviços com `rootDir` + `runtime` próprios |
| Um push rebuilda tudo | `buildFilter.paths` — só rebuilda a pasta que mudou |
| Apps em domínios diferentes | `envVars` com `VITE_API_URL` / `FRONTEND_ORIGIN` + CORS |
| React Router dá 404 ao recarregar | `routes` com `rewrite /* → /index.html` |
| Chave de IA vazando | `AI_API_KEY` com `sync: false` → só no painel, nunca no repo |

## Passo a passo (primeira vez)

1. **Garanta os arquivos que o build espera:**
   - `backend/requirements.txt` (com `fastapi`, `uvicorn`, `pandas`, etc.)
   - `frontend/package.json` com script `build` (Vite gera em `frontend/dist`)
2. No Render: **New → Blueprint** e conecte o repositório. O Render lê o `render.yaml`
   e cria os 2 serviços (`appbit-api` e `appbit-web`).
3. **Primeiro deploy sobe os dois.** Anote as URLs geradas, algo como:
   - API: `https://appbit-api.onrender.com`
   - Web: `https://appbit-web.onrender.com`
4. **Conecte as URLs cruzadas (pelo painel):**
   - Em `appbit-web` → env `VITE_API_URL` = URL **completa** da API (`https://appbit-api.onrender.com`)
   - Em `appbit-api` → env `FRONTEND_ORIGIN` = URL **completa** do frontend (`https://appbit-web.onrender.com`)
5. **Rebuild o frontend** (passo crítico — ver pegadinha do Vite abaixo).
6. (Quando tiver a chave) em `appbit-api` → `AI_PROVIDER=gemini` + `AI_API_KEY=...`,
   e redeploy do backend.

## ⚠️ As 2 pegadinhas que mais derrubam iniciantes

### 1. CORS — o backend precisa liberar a origem do frontend
As apps estão em domínios diferentes, então o navegador **bloqueia** as chamadas por padrão.
No FastAPI, configurar o middleware de CORS com a origem do frontend:

```python
# backend/app/main.py
import os
from fastapi.middleware.cors import CORSMiddleware

origins = [
    "http://localhost:5173",                 # Vite local
    os.getenv("FRONTEND_ORIGIN", ""),         # produção (URL do appbit-web)
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=[o for o in origins if o],
    allow_methods=["*"],
    allow_headers=["*"],
)
```

Sintoma de CORS mal configurado: a requisição falha no navegador com
*"blocked by CORS policy"*, mesmo a API respondendo 200 no Postman/curl.

### 2. Vite "assa" o env no BUILD, não em runtime
`VITE_API_URL` é embutido no JavaScript **na hora do `npm run build`**.

> Mudou a URL da API depois? **Não basta alterar a variável — tem que REBUILDAR o frontend.**
> (No backend Python a env é lida em runtime; lá um restart/redeploy resolve.)

No código do frontend, ler assim:
```ts
// frontend/src/api/client.ts
const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";
```

## Free tier — o que esperar

- **`appbit-api` (web service) DORME** após ~15 min sem uso → 1ª chamada tem cold start (~30s).
  - Antes do Demo Day: fazer chamadas periódicas ou abrir o app pra manter "acordado".
  - O `Loading state` da UI deve tolerar bem mais que 2–8s na primeira requisição.
- **`appbit-web` (estático) NÃO dorme** — é servido por CDN.

## Regras de ouro

- **Nunca** commitar `.env`, chaves de API, ou os CSVs grandes do Vísent (estão no `.gitignore`).
- Variáveis sensíveis: sempre `sync: false` no yaml + valor preenchido só no painel.
- Mudou o `render.yaml`? O Render reaplica o Blueprint no próximo push.
