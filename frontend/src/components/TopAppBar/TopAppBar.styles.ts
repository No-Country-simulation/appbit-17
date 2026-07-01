/* ============================================================
   TopAppBar — ESTILO
   Barra superior (chrome): brand (esq) · título (centro) · ações+avatar (dir).
   Grid de 3 colunas mantém o título centralizado independente das laterais.
   Sem variações de estado → não tem .states.ts.
   ============================================================ */

export const styles = {
  // min-h + pt-safe: no PWA standalone a barra respeita o notch/status bar do
  // iOS; em navegador normal o inset é 0 (mantém a altura de 64px). Padding
  // menor no mobile p/ caber marca + título + ações.
  root: "relative z-10 grid min-h-16 grid-cols-3 items-center bg-surface px-4 pt-safe shadow-elev-3 md:px-6",
  brand: "flex items-center",
  // truncate + min-w-0: título nunca empurra as colunas laterais no mobile.
  title: "min-w-0 truncate px-2 text-center text-title-3 text-ink",
  right: "flex items-center justify-end gap-2",
} as const;
