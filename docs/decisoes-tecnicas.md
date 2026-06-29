# 🧭 Decisões Técnicas (ADR)

Registro das decisões de arquitetura e **por que** foram tomadas. Formato leve de ADR
(Architecture Decision Record). Datas no formato AAAA-MM-DD.

---

## ADR-001 — Frontend: React + Vite + TypeScript
**Data:** 2026-06-18 · **Status:** Aceito

**Contexto:** time de 6 pessoas iniciantes; precisa de Web App responsiva (PWA).

**Decisão:** React + Vite + TypeScript.

**Motivos:**
- Maior volume de tutoriais/respostas → desbloqueio rápido para iniciantes.
- `react-leaflet` pronto para o mapa.
- Tecnologia mais pedida no mercado (agrega ao currículo).
- O `.env` da equipe já estava configurado para Vite.

---

## ADR-002 — Mapa: Leaflet + OpenStreetMap
**Data:** 2026-06-18 · **Status:** Aceito

**Decisão:** Leaflet com tiles do OpenStreetMap (via `react-leaflet`).

**Motivos:** gratuito e **sem chave de API** (Mapbox exige conta/token). Atende ao
requisito "mapa com ao menos 2 regiões e 1 indicador".

---

## ADR-003 — Backend: Python + FastAPI ⭐ (revisado)
**Data:** 2026-06-18 · **Status:** Aceito (substitui decisão anterior de Node.js)

**Contexto:** inicialmente cogitamos Node.js + TypeScript para ter uma linguagem única no
projeto. **Revisado:** a equipe decidiu seguir com **Python** no backend.

**Decisão:** Python 3.11+ com **FastAPI** + **Pydantic v2** + **pandas**.

**Motivos:**
- **pandas** torna o pipeline de ingestão dos CSVs do Vísent trivial (poucas linhas).
- **FastAPI** é amigável para iniciantes, gera documentação automática em `/docs` e usa
  Pydantic para validar o formato do "paper" de entrada/saída.
- Python é forte para a integração com IA e manipulação de dados — o coração do desafio.

**Trade-off aceito:** o projeto deixa de ter linguagem única (frontend em TS, backend em
Python). A facilidade no tratamento de dados e IA compensa.

---

## ADR-004 — Dados em arquivo (sem banco), Postgres adiado
**Data:** 2026-06-18 (atualizado 2026-06-22) · **Status:** Aceito

**Decisão:** no MVP, **não** provisionar banco de dados. Os agregados do Vísent ficam como
**Parquet/CSV commitado no repo** (`backend/dataset/`), carregados no startup e consultados
em memória com **pandas** (ver ADR-008).

**Motivos:**
- Dados são read-only e pequenos (poucos milhares de linhas).
- Não bloqueia 6 iniciantes configurando Postgres no Dia 1.
- A camada `data_service` isola o acesso → migrar para Postgres depois mexe só na etapa Load.

**Gatilho objetivo para adotar Postgres:** *"precisamos injetar dado sem fazer deploy"* —
atualização frequente/automática de fontes, ou upload por usuário em runtime (ver níveis de
injeção em [pipeline-dados.md](./pipeline-dados.md)). Stack alvo: **Postgres + SQLModel**.

---

## ADR-005 — Saída no formato "mini-paper"
**Data:** 2026-06-18 · **Status:** Aceito

**Contexto:** a persona (Carla, gestora não-técnica) precisa de evidência para reuniões,
não de um dashboard cru.

**Decisão:** toda resposta de IA segue o formato **afirmação → evidências (com dados) →
fontes citadas → nível de confiança**, exportável em PDF.

**Motivos:** é o diferencial sobre Kepler.gl / HDX / IPEA Atlas — entregamos *decisão
fundamentada*, não só dados. Ver schema em [contrato-integracao.md](./contrato-integracao.md).

---

## ADR-006 — Agente de IA provider-agnostic, com Mock como default
**Data:** 2026-06-18 · **Status:** ⚠️ Atualizado pela ADR-014 (mock removido; Gemini direto)

**Contexto:** o provedor de IA ainda não foi definido; pode faltar chave/crédito.

**Decisão:** `ai_service` expõe uma interface única; implementações intercambiáveis:
`MockProvider` (default, sem chave) e provedor real (`GeminiProvider`, ver ADR-011) plugável
por variável de ambiente.

**Motivos:**
- Time inteiro destrava no Dia 1 sem depender de chave/crédito.
- Trocar para IA real = 1 arquivo + 1 variável de ambiente.
- App continua demonstrável no Demo Day mesmo se faltar crédito.

Detalhes e desafios de produção em [agente-ia.md](./agente-ia.md).

---

## ADR-007 — Deploy no Render
**Data:** 2026-06-18 · **Status:** Aceito

**Decisão:** Render, dois serviços (`api` em uvicorn + `web` estático do Vite), via `render.yaml`.

**Motivos:** free tier, deploy versionado, sugerido pelo próprio desafio (Railway ou Render).

**Atenção:** free tier dorme (cold start ~30s) e exige variáveis sensíveis só pelo painel.

---

## ADR-008 — Camada de dados: pandas (em memória)
**Data:** 2026-06-22 (revisado 2026-06-24) · **Status:** Aceito (substitui consideração de DuckDB)

**Contexto:** cogitou-se DuckDB (SQL in-process) por o dataset ser orientado a query. Após
avaliar o time (6 iniciantes) e o tamanho dos dados, optou-se por **pandas**.

**Decisão:** usar **pandas** como camada de dados — carregar o Parquet/CSV em DataFrame no
startup e filtrar em memória dentro do `data_service`.

**Motivos:**
- Mais familiar para o time (uma ferramenta a menos pra aprender).
- Dados minúsculos (~8 mil linhas) → filtro pandas é instantâneo; SQL é desnecessário.
- `pandas` já é usado no pipeline de ingestão → mesma ferramenta ponta a ponta.

**Trade-off:** abre mão do SQL (e do caminho mais direto pro agente gerar queries via *tool use*).
Se virar necessidade, dá pra reintroduzir DuckDB ou ir pra Postgres (ADR-004) — o `data_service`
isola essa troca.

---

## ADR-009 — PWA via vite-plugin-pwa
**Data:** 2026-06-22 · **Status:** Aceito

**Decisão:** a PWA (manifest + service worker) é feita pelo **`vite-plugin-pwa`** (Workbox).

**Motivos:** Vite sozinho não gera PWA; o plugin automatiza manifest e service worker. HTTPS
(requisito de PWA) o Render já fornece. **Nota:** "responsivo" (CSS) ≠ "instalável" (plugin) —
o desafio pede os dois.

---

## ADR-010 — Cobertura de rede via proxy de qualidade (não geração 3G/4G/5G)
**Data:** 2026-06-22 · **Status:** Aceito

**Contexto:** a geração 3G/4G/5G (`rat_type`) só existe no `tensor_mobilidade.csv` (2,7 GB),
por sessão — não nas tabelas pequenas. O `tensor_concentracao` traz proxies de qualidade.

**Decisão:** no MVP, "cobertura/qualidade de rede" = **`congestionamento_medio` + `drop_pct_medio`**
(do `tensor_concentracao`, dado real, arquivo pequeno). Adicionalmente, **`income_cluster`**
(`assinantes.csv`) entra como dimensão **real** de renda/desigualdade.

**Motivos:** responde "muita gente + rede ruim + baixa renda" sem tocar nos 2,7 GB. A geração
3G/4G/5G fica como upgrade opcional (pré-agregar `rat_type` offline em chunks).

---

## ADR-011 — Provedor de IA: Google Gemini
**Data:** 2026-06-24 · **Status:** Aceito

**Contexto:** o ADR-006 deixou o provedor em aberto (camada provider-agnostic). A equipe escolheu.

**Decisão:** o provedor real é o **Google Gemini** (API), via SDK Python **`google-genai`**.
Modelo: um **Flash** (rápido/barato), ex. `gemini-3.5-flash` (confirmar versão na doc oficial).
Ativado por `AI_API_KEY` (o mock foi removido em 25/06 — ver ADR-014).

**Motivos:** tier gratuito generoso, boa saída estruturada (response schema JSON), SDK simples.
A integração fica isolada no `GeminiGateway`; o `ai_service` monta o prompt e valida.

---

## ADR-012 — UI: design system à mão + shadcn/ui (híbrido)
**Data:** 2026-06-24 · **Status:** Aceito

**Contexto:** existe um **design system completo** (cores/fontes/componentes). O shadcn/ui é
copy-in (Radix + Tailwind), não uma lib instalada — você é dono do código.

**Decisão:** abordagem **híbrida**:
- Componentes simples/visuais do DS (IconButton, Card, botões, o "paper") → **à mão** com Tailwind.
- Interativos complexos (Select de filtros, Command/combobox de sugestões, Dialog, Toast, Tooltip)
  → **shadcn/ui** (Radix).
- Os tokens do shadcn (`--primary`, `--radius`, `--ring`…) são **mapeados** aos do tema
  (`--color-brand-*`, `--radius-card`) pra herdar a identidade visual.

**Motivos:** acessibilidade/comportamento (teclado, ARIA, foco) dos componentes complexos é cara
e arriscada de fazer à mão — Radix entrega pronto; o visual continua sendo o do DS.

**Trade-off:** setup inicial pra reconciliar tokens shadcn ↔ DS. Confirmar o caminho de install
do shadcn pro **Tailwind v4**.

---

## ADR-013 — Padrão de componente: pasta + estilo/estado separados
**Data:** 2026-06-25 · **Status:** Aceito

**Contexto:** os componentes "à mão" do DS (ADR-012) têm múltiplos estados visuais
(Padrão/Hover/Ativo/Desabilitado) e variações (tamanhos, cor de chip). Misturar markup, classes
de layout e classes de estado num só arquivo vira ruído e dificulta manter consistência.

**Decisão:** **uma pasta por componente**, com estilo e estado em arquivos separados:
```
components/<Nome>/
├── index.ts            ← barrel (componente + tipos)
├── <Nome>.tsx          ← markup + props (lógica)
├── <Nome>.styles.ts    ← estrutura FIXA (layout/tamanho) + helper cx
└── <Nome>.states.ts    ← resolveState(props) + stateStyles (Record<estado, classes>)
```
Convenções:
- **`cx` local** (`parts.filter(Boolean).join(' ')`) — **sem** `clsx`/`tailwind-merge` (zero deps novas).
- **Hover é pseudo-estado CSS** (`hover:` no estado `default`), **não** vira prop. Só `active`/`disabled` são props.
- **Sempre tokens do tema** (`bg-primary`, `text-ink`, `rounded-card`, `shadow-elev-*`) — nunca paleta crua (`bg-blue-500`).
- Tokens do tema preenchidos a partir do **print do design system** (cores, escala tipográfica, sombras `elev-0..3`, raios) em `src/styles/*.css` (Tailwind v4 `@theme`).

**Motivos:** separar estrutura imutável de variação por estado deixa o `.tsx` declarativo, facilita
adicionar estados e garante que todos os componentes consumam os mesmos tokens (identidade visual única).

**Trade-off:** mais arquivos por componente. Aceito — paga em legibilidade e consistência.

---

## ADR-014 — Mock de IA removido: Gemini direto
**Data:** 2026-06-25 · **Status:** Aceito (atualiza ADR-006 e ADR-011)

**Contexto:** o ADR-006 previa um `MockProvider` como default (destravar sem chave). A equipe
decidiu plugar o **Gemini direto** — sem mock.

**Decisão:** remover o mock (`MockGateway`) e a seleção por `AI_PROVIDER`. O `get_ai_gateway()`
retorna sempre o `GeminiGateway`; a chave é checada **lazy dentro de `gerar()`**, então sem
`AI_API_KEY` o erro cai no `try/except` do `ai_service` (fallback `confiança: baixa`, **sem 500**). O `data_service`
devolve `[]` (sem dados falsos) até o Parquet existir. A robustez fica num **try/except** no
`ai_service` (IA falhou/voltou inválido → "paper" `confiança: baixa`, sem 500).

**Implementação do Gemini (correção):** usar `client.models.generate_content(model, contents, config)`
— **não** `interactions.create` — com `response_mime_type="application/json"` +
`response_schema=RespostaPaper` (modelo Pydantic). Schemas **tipados** (`PontoMapa`, não `dict` cru).

**Trade-off:** não dá mais pra demonstrar sem a chave do Gemini. Aceito — a chave é simples de
obter e o fallback evita travar a tela.
Já aplicado em `IconButton`, `NavItem`, `TabNav`, `KpiCard`.

---

## ADR-014 — Fonte Inter via @fontsource (self-host)
**Data:** 2026-06-25 · **Status:** Aceito

**Contexto:** o DS usa **Inter** como família única. Opções: Google Fonts via `<link>` (CDN) ou
self-host. O app será PWA (ADR-009), que precisa funcionar offline.

**Decisão:** self-host com **`@fontsource-variable/inter`** (fonte variável, pesos 400–700 num só
arquivo), importado em `src/main.tsx`. Sem Poppins/`font-display` — Inter para tudo.

**Motivos:** funciona offline (alinha com PWA), sem dependência de CDN externo; os `.woff2` entram
no `dist/` no build (hash/cache). Fonte variável = todos os pesos com um arquivo.

**Pegadinhas (custaram debugging):**
- O pacote registra a família como **`"Inter Variable"`** (não `"Inter"`). O `--font-sans` precisa
  começar com `"Inter Variable"`, senão renderiza em `system-ui` silenciosamente.
- O import side-effect precisa de **`declare module "@fontsource-variable/inter"`** em
  `src/vite-env.d.ts`, senão o **`tsc -b`** do `npm run build` quebra (o `dev` não pega).
