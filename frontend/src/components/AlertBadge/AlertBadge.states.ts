/* ============================================================
   AlertBadge — ESTADOS
     warning  -> Normal  : âmbar sólido, texto escuro     (AVISO)
     critical -> Crítico : vermelho sólido, texto branco  (CRÍTICO)
     success  -> Sucesso : verde claro, texto verde       (OK)
     info     -> Info    : azul claro, texto azul         (INFO)
   ============================================================ */

export type AlertStatus = "warning" | "critical" | "success" | "info";

/** Classes (bg + text) por status, somadas a styles.badge. */
export const statusStyles: Record<AlertStatus, string> = {
  warning: "bg-warning text-ink",
  critical: "bg-critical text-ink-inverse",
  success: "bg-success-soft text-success",
  info: "bg-primary-soft text-primary",
};

/** Rótulo padrão por status (exibido em maiúsculas via CSS). */
export const statusLabels: Record<AlertStatus, string> = {
  warning: "Aviso",
  critical: "Crítico",
  success: "OK",
  info: "Info",
};
