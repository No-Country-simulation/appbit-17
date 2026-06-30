# 🔌 Contrato de Integração (API)

> Este é o documento **mais importante para o trabalho em paralelo**. Frontend e backend
> só precisam concordar com este contrato; depois cada frente trabalha de forma independente.
> Enquanto a IA real não está pronta, o backend devolve a resposta **mockada** neste mesmo
> formato — então o frontend, o mapa e o PDF já funcionam.

Base URL local: `http://localhost:8000`

> **Todos** os endpoints ficam sob **`/api/v1`** (`/api/v1/health`, `/api/v1/dados`, `/api/v1/mapa`).
> O `healthCheckPath` do Render aponta para `/api/v1/health`.

---

## `GET /api/v1/health`

Verifica se a API está no ar.

**Response 200**
```json
{ "status": "ok", "versao": "0.1.0" }
```

---

## `POST /api/v1/dados`

Consulta em linguagem natural. Retorna a resposta no formato **"mini-paper"**.

### Request
```json
{
  "consulta": "Onde há muita gente mas cobertura de rede ruim?",
  "filtros": {
    "regiao": "São José",        // opcional — município/cluster; null = todas
    "indicador": "concentracao"  // opcional — concentracao | qualidade_rede | renda | emprego | formacao | saude_mental
  },
  "idioma": "pt"                 // pt | es | en  (validado; default: pt)
}
```

> **`idioma`** é **validado** (`Literal["pt","es","en"]`) e **normalizado** no backend: `"PT"`,
> `"pt-BR"`, `"pt_BR"` viram `"pt"`. Valor fora de pt/es/en → **422**. A IA é instruída a
> **responder sempre no idioma pedido**, mesmo que a pergunta/dados estejam em outra língua.
>
> **`filtros.regiao`** casa **município OU cluster**, por *substring* **sem acento/underscore**
> (`"São José"` casa `SAO_JOSE_*`). **`filtros.indicador`** ainda **não filtra** os dados (uso futuro / dica à IA).

### Response 200 — o "mini-paper"
```json
{
  "afirmacao": "A zona central de São José concentra ~12.300 pessoas no período da tarde, mas a cobertura predominante é 3G — um gargalo para programas que dependem de acesso remoto.",
  "evidencias": [
    {
      "dado": "Concentração de pessoas (TARDE)",
      "valor": 12300,
      "regiao": "São José",
      "periodo": "TARDE",
      "fonte": "Vísent CDRView"
    },
    {
      "dado": "Cobertura de rede predominante",
      "valor": "3G",
      "regiao": "São José",
      "periodo": null,
      "fonte": "Anatel / Vísent CDRView"
    }
  ],
  "fontes": [
    { "nome": "Vísent CDRView", "url": "https://github.com/wongola-bit/appbit", "tipo": "dataset" },
    { "nome": "Anatel (antenas ERB)", "url": null, "tipo": "publica" }
  ],
  "nivel_confianca": "alta",     // alta | media | baixa
  "visualizacao": {
    "tipo": "mapa",              // mapa | barra | nenhuma
    "dados": [
      { "regiao": "São José", "lat": -27.61, "lng": -48.63, "valor": 12300 }
    ]
  }
}
```

### Mapeamento com o brief oficial
O brief pede `{ resposta_ia, dados, fontes }`. Nosso formato é uma **extensão** disso:
- `resposta_ia` → `afirmacao`
- `dados` → `evidencias`
- `fontes` → `fontes`
- extras nossos: `nivel_confianca`, `visualizacao` (para o PDF e o mapa)

### Regras de negócio
- A IA usa **somente** os dados retornados por `data_service`. Se não houver dado, devolve
  `afirmacao` dizendo "não há dados suficientes" e `nivel_confianca: "baixa"`. **Nunca inventa número.**
- Indicadores `emprego`/`formacao`/`saude_mental` no MVP são **complementares** → marcar
  `fonte` como enriquecida e tender a `nivel_confianca: "media"`.
- **Cobertura no MVP é um proxy:** o campo `cobertura_rede` deriva de `congestionamento_medio`/
  `drop_pct_medio` (Vísent, dado real), **não** da geração 3G/4G/5G (que está só no arquivo de
  2,7 GB). Já `renda` (`income_cluster` A/B/C/D) é dado real direto do Vísent.

### Erros
```json
// 422 — request inválido (Pydantic valida automaticamente)
{ "detail": [ { "loc": ["body", "consulta"], "msg": "field required" } ] }
```

---

## `GET /api/v1/mapa`

Dados georreferenciados para renderizar o mapa.

### Query params (opcionais)
`?indicador=concentracao&periodo=TARDE`

### Response 200
```json
{
  "regioes": [
    {
      "regiao": "Florianópolis",
      "lat": -27.5954,
      "lng": -48.5480,
      "concentracao": 18400,
      "cobertura_rede": "4G",
      "indicadores": { "emprego": 0.62, "saude_mental": null }
    },
    {
      "regiao": "São José",
      "lat": -27.6136,
      "lng": -48.6366,
      "concentracao": 12300,
      "cobertura_rede": "3G",
      "indicadores": { "emprego": 0.48, "saude_mental": null }
    }
  ]
}
```

---

## Convenções gerais

- **Formato:** JSON, UTF-8. Campos em `snake_case` no backend.
- **CORS:** o backend libera a origem do frontend (Vite em `http://localhost:5173`).
- **Versionamento:** mudanças no contrato → avisar o time e atualizar este arquivo.
- **Tipos espelhados:** Pydantic (backend, `app/models.py`) e TypeScript (frontend,
  `src/api/types.ts`) devem refletir exatamente os schemas acima.
