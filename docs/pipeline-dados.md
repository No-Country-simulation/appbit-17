# 🔄 Pipeline de Ingestão de Dados (Vísent CDRView)

Como os dados saem dos CSVs do Vísent e chegam num formato limpo que o `data_service`
(e, por trás dele, o agente de IA) consegue consultar. Atende ao requisito obrigatório do
desafio: **"Pipeline de ingestão do dataset Vísent CDRView funcional"**.

Frente responsável: **Dados/Pipeline (frente 1)**.

> 📌 Lembrete da arquitetura: o agente **não lê o GitHub nem o CSV ao vivo**. O pipeline
> roda **uma vez** (offline/no startup), produz dados limpos, e o `data_service` filtra
> esses dados a cada pergunta. Ver [agente-ia.md](./agente-ia.md) e [dados-visent.md](./dados-visent.md).

## Visão geral (ETL)

```
  EXTRACT            TRANSFORM                         VALIDATE        LOAD
┌──────────┐   ┌──────────────────────────┐   ┌──────────────┐   ┌────────────────┐
│ zip 3 MB │──▶│ profiling → limpeza →     │──▶│ checagens de │──▶│ dataset/        │
│ (GitHub) │   │ normalização → cruzamento │   │ qualidade    │   │  processed/     │
└──────────┘   │ (concentr. × rede × renda)│   └──────────────┘   │  *.parquet      │
               └──────────────────────────┘                      └───────┬────────┘
                                                                          ▼
                                                          data_service (carrega no startup)
                                                                          ▼
                                                          /dados  /mapa  (agente filtra)
```

## Estrutura de pastas do pipeline

```
backend/
├── dataset/
│   ├── tensor_concentracao.csv   ← CSVs crus (extraídos do zip)
│   ├── assinantes.csv
│   ├── antenas_flp.csv           (opcional)
│   ├── tensor_od.csv             (opcional)
│   └── processed/
│       └── concentracao.parquet  ← saída do pipeline (é o que o app lê)
└── scripts/
    └── ingest.py                 ← o pipeline (roda de backend/: python -m scripts.ingest)
```

---

## Etapa 0 — Aquisição (Extract)

1. Baixar `bases_hackathon_bit.zip` (~3 MB) do repositório do dataset.
2. Extrair os arquivos que usamos para **`backend/dataset/`**:
   `tensor_concentracao.csv` (7.920) e `assinantes.csv` (200k); opcionais `antenas_flp.csv` (132)
   e `tensor_od.csv`.
3. ❌ **Nunca** trazer os arquivos de GB (`tensor_mobilidade.csv` 2,7 GB, `tensor_sequencias.csv`).

> **Recomendado:** commitar o `processed/concentracao.parquet` (poucos KB) — é o que o backend
> lê, então o deploy não depende de baixar nada e a demo nunca quebra. Os CSVs crus podem ficar
> locais (`.gitignore`) ou ser commitados (são pequenos); os tensores de GB **nunca**.

## Etapa 1 — Profiling (conferência rápida) 🔍

Os schemas já estão **confirmados** (Technical Reference v2), então o profiling aqui é uma
**conferência**, não descoberta. Ainda vale rodar pra validar contagens, nulos e os valores
de `periodo` — é o "explorar o dataset" do Dia 1.

```python
import pandas as pd

# SEMPRE ler ecgi como string — senão o id da antena vira float e corrompe
df = pd.read_csv("dataset/tensor_concentracao.csv", dtype={"ecgi": str})  # rodar de backend/

print(df.shape)            # confirma ~7920 linhas
print(df.columns.tolist()) # descobre os nomes reais das colunas
print(df.dtypes)
print(df.head(10))
print(df.isna().sum())     # nulos por coluna
# valores únicos das categóricas (períodos, municípios, cluster)
for col in df.select_dtypes("object").columns:
    print(col, df[col].unique()[:20])
```

**Schemas já confirmados** pelo Technical Reference v2 (ver [dados-visent.md](./dados-visent.md)) —
então aqui o profiling é só uma **conferência rápida** (linhas, nulos, valores de `periodo`),
não mais descoberta. Colunas reais do `tensor_concentracao`:
`ecgi, cluster, municipio, day_date, periodo, n_usuarios, n_sessoes, …, congestionamento_medio,
drop_pct_medio, lat, lon`.
- **Concentração = `n_usuarios`**
- **Cobertura/qualidade de rede ≈ `congestionamento_medio` / `drop_pct_medio`** (a geração
  3G/4G/5G NÃO está aqui — fica no arquivo de 2,7 GB).

## Etapa 2 — Limpeza (Transform)

- Normalizar nomes de colunas → `snake_case` minúsculo (`df.columns = df.columns.str.strip().str.lower()`).
- Forçar tipos: `ecgi` string; concentração numérica (`pd.to_numeric(..., errors="coerce")`).
- Padronizar categóricas: `periodo` em maiúsculas; `municipio` sem acento/espaço extra inconsistente.
- Tratar nulos: linha sem `ecgi` ou sem concentração → descartar ou marcar.

## Etapa 3 — Agregação + cruzamento (o coração) 🔗

O `tensor_concentracao` **já tem lat/lon, cluster e município** → **não precisa juntar com
`antenas_flp`**. A "cobertura de rede" vem dos proxies de qualidade do próprio arquivo
(`congestionamento_medio`, `drop_pct_medio`). Opcionalmente, cruzamos com a **renda** (`assinantes`):

```python
# concentração agregada por cluster/período (média dos 15 dias)
agregado = (
    conc.groupby(["municipio", "cluster", "periodo"], as_index=False)
        .agg(concentracao=("n_usuarios", "mean"),
             congestionamento=("congestionamento_medio", "mean"),
             drop_rede=("drop_pct_medio", "mean"),
             lat=("lat", "first"), lon=("lon", "first"))
)

# faixa de renda predominante por cluster (dado REAL de desigualdade)
renda = (assinantes.groupby("home_cluster")["income_cluster"]
         .agg(lambda s: s.mode().iat[0]).rename("renda").reset_index())
agregado = agregado.merge(renda, left_on="cluster", right_on="home_cluster", how="left")
```

> Aqui nasce o insight-chave do desafio: **alta concentração + rede ruim (congestionamento/drop
> alto) + baixa renda = prioridade** para infraestrutura antes de chegar o programa social.
> Derivar `prioridade` (ex.: concentração no topo do quartil E `congestionamento > 0.6`
> E `renda ∈ {C, D}` → "alta").

## Etapa 4 — Validação (qualidade)

Antes de carregar, checar:
- Contagens dos brutos: `tensor_concentracao` ~7.920 linhas; `assinantes` ~200.000.
- `periodo` só contém os 4 valores válidos (MADRUGADA/MANHA/TARDE/NOITE).
- No agregado: sem nulos em `concentracao`, `cluster` e `periodo`.
- `lat/lon` dentro de um *bounding box* plausível de Florianópolis
  (aprox. lat -28.0 a -27.2, lon -48.8 a -48.3).
- `renda` ∈ {A, B, C, D} (ou nulo, se algum cluster não casar com `assinantes`).

Falhou? O pipeline **para com erro claro** — melhor falhar no build do que servir lixo.

## Etapa 5 — Carga (Load)

Salvar o resultado limpo em formato leve (**Parquet** — rápido e tipado; CSV também serve):

```python
from pathlib import Path
Path("dataset/processed").mkdir(parents=True, exist_ok=True)
agregado.to_parquet("dataset/processed/concentracao.parquet", index=False)
```

O `data_service` carrega esse arquivo **uma vez no startup** do FastAPI e mantém em memória
(pandas DataFrame). As consultas (`/dados`, `/mapa`) filtram esse DataFrame — instantâneo.

---

## Esqueleto do `scripts/ingest.py`

```python
"""Pipeline de ingestão Vísent CDRView: Extract -> Transform -> Validate -> Load.
Rodar a partir de backend/: python -m scripts.ingest
"""
from pathlib import Path
import pandas as pd

RAW = Path("dataset")              # rodar de dentro de backend/
OUT = Path("dataset/processed")

def carregar(nome: str) -> pd.DataFrame:
    df = pd.read_csv(RAW / nome, dtype={"ecgi": str})
    df.columns = df.columns.str.strip().str.lower()
    return df

def transformar(conc: pd.DataFrame, assinantes: pd.DataFrame) -> pd.DataFrame:
    agregado = (conc.groupby(["municipio", "cluster", "periodo"], as_index=False)
                    .agg(concentracao=("n_usuarios", "mean"),
                         congestionamento=("congestionamento_medio", "mean"),
                         drop_rede=("drop_pct_medio", "mean"),
                         lat=("lat", "first"), lon=("lon", "first")))
    renda = (assinantes.groupby("home_cluster")["income_cluster"]
                .agg(lambda s: s.mode().iat[0]).rename("renda").reset_index())
    return agregado.merge(renda, left_on="cluster", right_on="home_cluster", how="left")

def validar(df: pd.DataFrame) -> None:
    assert df["concentracao"].notna().all(), "há linhas sem concentração"
    assert df["lat"].between(-28.0, -27.2).all(), "lat fora de Florianópolis"
    # ... demais checagens

def main() -> None:
    conc = carregar("tensor_concentracao.csv")
    assinantes = carregar("assinantes.csv")
    resultado = transformar(conc, assinantes)
    validar(resultado)
    OUT.mkdir(parents=True, exist_ok=True)
    resultado.to_parquet(OUT / "concentracao.parquet", index=False)
    print(f"OK — {len(resultado)} linhas processadas")

if __name__ == "__main__":
    main()
```

## Quando rodar o pipeline

- **Local:** uma vez, ao baixar o dataset (e de novo se mudar a transformação).
- **No deploy:** como o `processed/*.parquet` é commitado, **não precisa** rodar no Render.
  (Alternativa: rodar no `buildCommand`, mas adiciona dependência — preferimos commitar.)

## 🚀 Injeção futura de dados — roadmap em níveis

A pergunta "como injetar dados **no futuro**?" tem respostas diferentes conforme a maturidade.
A regra geral: **enquanto os dados ficam em Parquet/memória, "injetar" = re-rodar o pipeline +
redeploy.** No instante em que você precisar injetar dado **sem redeploy** (atualização
frequente, upload por usuário, fontes automáticas), você migra para **banco de dados**.

| Nível | Como injeta dado | Precisa de | Sem redeploy? |
|---|---|---|---|
| **0 — MVP (agora)** | Re-roda `ingest.py`, commita o `processed/`, redeploy | nada | ❌ |
| **1 — Mais fontes (batch)** | Novos *extractors* (IBGE/DATASUS) no pipeline | só código | ❌ |
| **2 — Banco de dados** | Pipeline faz **upsert** no Postgres; API lê do banco | Postgres | ✅ |
| **3 — Ingestão agendada** | Cron/CI puxa fontes públicas periodicamente | Postgres + agendador | ✅ |
| **4 — Upload pelo app** | Gestor sobe CSV via endpoint autenticado | Postgres + auth | ✅ |

### Nível 1 — adicionar fontes (mesmo padrão, batch)

Cada fonte tem seu **extractor** que entrega um DataFrame no **schema comum**, e tudo é
unido por `municipio`/`cluster`:

```
ingest.py
  ├─ extrair_visent()    ← agora (dado real)
  ├─ extrair_ibge()      ← futuro (emprego, demografia)
  ├─ extrair_datasus()   ← futuro (saúde mental)
  └─ unir_por_municipio()
```

### O que destrava tudo: o "schema comum" (contrato de dados)

Toda fonte, atual ou futura, é normalizada para **uma mesma tabela longa**. É isso que
permite injetar qualquer dado novo sem mudar a API nem o agente:

| coluna | exemplo | papel |
|---|---|---|
| `municipio` | "São José" | dimensão geográfica |
| `indicador` | "concentracao" / "emprego" / "saude_mental" | o que é |
| `periodo` | "TARDE" / null | recorte temporal |
| `valor` | 12300 | a medida |
| `fonte` | "Vísent CDRView" / "IBGE" | **proveniência (vira a citação do paper)** |
| `data_carga` | 2026-06-18 | versionamento |

Injetar uma fonte nova = produzir linhas **neste formato**. Mais nada muda.

### Nível 2 — migrar para banco (Postgres) e fazer UPSERT

Só a etapa **LOAD** muda — `to_parquet(...)` vira escrita no banco com **upsert**
(insere se novo, atualiza se já existe), usando uma **chave natural**
(`municipio + indicador + periodo + fonte`). Assim **re-injetar não duplica** (idempotente):

```python
# Postgres (SQLAlchemy): INSERT ... ON CONFLICT DO UPDATE
from sqlalchemy.dialects.postgresql import insert

stmt = insert(Indicadores).values(registros)
stmt = stmt.on_conflict_do_update(
    index_elements=["municipio", "indicador", "periodo", "fonte"],  # chave natural
    set_={"valor": stmt.excluded.valor, "data_carga": stmt.excluded.data_carga},
)
session.execute(stmt)
```

As etapas Extract/Transform/Validate continuam **idênticas**. A API passa a ler do banco
(ou de um cache que recarrega do banco), então **dado novo aparece sem redeploy**.

### Nível 3 — ingestão automatizada (agendada)

Para fontes públicas que mudam (IBGE/DATASUS), agendar o pipeline:
- **GitHub Actions** (cron) rodando `ingest.py` que dá upsert no banco; ou
- **Render Cron Job** (`type: cron` no `render.yaml`).

Como o upsert é idempotente, rodar todo dia/semana é seguro.

### Nível 4 — injeção pelo próprio app (upload do gestor)

Um gestor sobe um CSV pela interface → endpoint **autenticado** valida e injeta:

```
POST /admin/fontes   (auth obrigatória)
  → reaproveita Transform + Validate (as MESMAS checagens do pipeline)
  → upsert no banco
  → registra na tabela `fontes` (quem subiu, quando, quantas linhas)
```

⚠️ Aqui ganham peso: **autenticação** (só gestor injeta), **validação rigorosa**
(dado externo não confiável) e **proveniência** (registrar origem — essencial porque o
agente cita a fonte no "paper").

### Regra de decisão (quando subir de nível)

> Enquanto a injeção for **esporádica e feita por devs** → Parquet + redeploy (Nível 0–1) basta.
> Quando a injeção for **frequente, automática ou feita por usuários** → migre para Postgres
> (Nível 2+). O gatilho exato é: *"precisamos injetar dado sem fazer deploy"*.

Em todos os níveis, **Extract → Transform → Validate não mudam** — só a etapa **Load** evolui.
É por isso que o pipeline foi desenhado com essas etapas isoladas.

## Idempotência & versionamento

- Rodar o pipeline 2x produz o **mesmo** resultado (sobrescreve o `processed/`).
- Tensores de GB → `.gitignore`. `backend/dataset/processed/*.parquet` → **commitar**
  (é pequeno e garante deploy reproduzível).

---

### Referências
- [Vísent — CDRView (produto)](http://www.visent.com.br/en/product/cdrview/)
- [Hackathon App BiT — Wongola](https://hackathon.wongola.com.br/)
- Dataset: https://github.com/wongola-bit/appbit (ver `dataset-visent/` e o `.docx` de referência técnica)
