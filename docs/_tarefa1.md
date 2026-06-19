# App BiT — Painel de Dados Públicos com IA (Equipo 17)

> **Desafio B2G** — Hackathon App BiT (Wongola / Black in Tech) · **Demo Day: 10/07/2026**
> Uma Web App responsiva (PWA) com agente de IA que cruza dados públicos por região
> para orientar políticas de inclusão social, usando o dataset **Vísent CDRView**.

---

## 🧩 O problema

Gestores públicos não têm acesso fácil a dados cruzados de mobilidade, emprego e saúde
mental por região para embasar políticas de inclusão social. Os dados estão dispersos em
múltiplas fontes, faltam visualizações geográficas, e formular perguntas técnicas a
sistemas tradicionais é difícil — então decisões acabam baseadas em intuição.

## 💡 A solução

Não é só um dashboard. É uma **ferramenta de decisão**: o gestor pergunta em **linguagem
natural** e recebe a resposta no formato de um **mini-paper** —
**afirmação → evidências com dados → fontes citadas → nível de confiança**, exportável em PDF
para levar direto à reunião do Conselho.

> Diferencial sobre Kepler.gl / HDX / IPEA Atlas: eles *mostram* dados; nós entregamos a
> **decisão fundamentada e citável**.

### Persona
**Carla Mendes**, 42, Coordenadora de Planejamento e Inclusão Digital (Prefeitura, RM de
Florianópolis). Não escreve SQL, não usa terminal. Precisa de evidências para justificar
decisões — hoje isso leva dias cruzando planilhas manualmente.

---

## 🛠️ Tecnologias

| Camada | Tecnologia | Por quê |
|---|---|---|
| Frontend | **React + Vite + TypeScript** (PWA via `vite-plugin-pwa`) | Popular, empregável, muito material |
| Mapa | **Leaflet + OpenStreetMap** | Gratuito, sem chave de API |
| Backend | **Python 3.11+ + FastAPI + Pydantic** | pandas facilita o pipeline; docs automáticas |
| Dados | **pandas** (Parquet/CSV em memória) | Read-only, poucos milhares de linhas |
| IA | **Provider-agnostic** (A definir) |  |
| PDF | **react-to-print** | Exporta o "paper" |
| Deploy | **Render** (site estático + web service) | Free tier, monorepo via `render.yaml` |

## 🏗️ Arquitetura (princípio central)

```
[Frontend PWA] → POST /dados → [API FastAPI] → data_service (filtra dados reais)
                                              → ai_service (redige o "paper")
                                              → resposta estruturada + fontes
```

O frontend **nunca** fala com a IA direto. A API **filtra os dados reais** e só então pede
à IA que **redija** a resposta usando *apenas* esses dados (padrão **ancorado** → não inventa
número). A camada de IA é trocável por variável de ambiente.

## 📊 Dataset Vísent CDRView

Concentração de pessoas por zona × cobertura de rede (ERBs reais da Claro/Anatel) na **Região
Metropolitana de Florianópolis**. Usamos as **tabelas agregadas (~3 MB)** — `antenas_flp.csv`
(132 antenas), `tensor_concentracao.csv` (7.920 linhas), `tensor_od.csv`. Os tensores crus
(2,7 GB / 915 MB) **não são usados** no MVP (ficam fora do repo). Indicadores sociais
(emprego/formação/saúde mental) entram como **camadas complementares rotuladas**.

**Pipeline (ETL):** Extract (zip 3 MB) → Profiling → Transform (limpeza + cruzamento
concentração × cobertura) → Validate → Load (Parquet em memória). Preparado para receber
mais fontes (IBGE, DATASUS) sem refatorar.

## 🚀 Deploy

Monorepo no **Render** com `render.yaml`: 1 **site estático** (frontend, grátis e sem dormir)
+ 1 **web service** (backend FastAPI, free tier 750h/mês). Cabe no plano free.

## 👥 Equipe e frentes (6 pessoas)

| Frente | Responsabilidade |
|---|---|
| Dados / Pipeline | Ingestão e cruzamento do Vísent (pandas) |
| Backend / API | `/dados`, `/mapa`, `/health` (FastAPI) |
| Agente de IA | Camada provider-agnostic + formato "paper" |
| Mapa | Visualização geográfica (Leaflet) |
| Consulta / UI / PDF | Barra de IA, card de resultado, export PDF, responsividade |
| Infra / Deploy / Docs | Render, `.env`, CORS, documentação |

## 🗺️ Estrutura do repositório

```
appbit-17/
├── docs/        ← documentação técnica (arquitetura, contrato, pipeline, deploy…)
├── dataset/     ← CSVs agregados do Vísent (grandes ficam no .gitignore)
├── backend/     ← API Python/FastAPI + pipeline de dados
├── frontend/    ← React + Vite (PWA)
└── render.yaml  ← deploy dos 2 serviços
```

---

## 🔗 Links

### Projeto
- **Repositório do time:** [github.com/No-Country-simulation/appbit-17](https://github.com/No-Country-simulation/appbit-17)
- **Documentação técnica:** pasta [`/docs`](./README.md) — arquitetura, decisões,
  contrato de API, pipeline de dados, deploy e divisão de tarefas

### Dataset e desafio
- **Dataset Vísent CDRView:** https://github.com/wongola-bit/appbit
- **Vísent — produto CDRView:** http://www.visent.com.br/en/product/cdrview/
- **Hackathon App BiT (Wongola):** https://hackathon.wongola.com.br/
- **Discord do hackathon:** https://discord.gg/7gBYpXCh3j

### Fontes públicas de referência (futuras / complementares)
- IPEA — Atlas da Violência: https://www.ipea.gov.br/atlasviolencia/
- Brasil.io — Dados Públicos: https://brasil.io/
- Kepler.gl — Visualização geoespacial: https://kepler.gl/
- HDX — Humanitarian Data Exchange (ONU/OCHA): https://data.humdata.org/
- Meta Data for Good — Densidade populacional: https://dataforgood.facebook.com/
- IBGE: https://www.ibge.gov.br/
