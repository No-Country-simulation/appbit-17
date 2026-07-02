/* ============================================================
   exportPdf — entrega um PDF (Blob) ao usuário de forma PWA-safe.
   - Mobile/PWA (iOS standalone incluso): Web Share API nível 2
     (share sheet nativo → "Salvar em Arquivos", imprimir, enviar...).
   - Desktop / Android: download via <a download>.
   NÃO usa window.print() (quebra no PWA standalone do iOS).
   ============================================================ */

/**
 * Decide a estratégia de exportação por ambiente (exportação HÍBRIDA):
 *  - `true`  → DESKTOP (browser, não instalado): usar impressão nativa
 *    (react-to-print) do paper HTML estilizado — diálogo com preview/salvar.
 *  - `false` → PWA standalone (iOS incluso, onde `window.print()` quebra) ou
 *    dispositivo touch: usar @react-pdf + Web Share/download.
 * Sinais: PWA standalone nunca imprime; senão, exige ponteiro fino + hover
 * (desktop com mouse), o que exclui celular/tablet touch.
 */
export function preferNativePrint(): boolean {
  if (typeof window === "undefined") return false;
  const standalone =
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true;
  if (standalone) return false;
  return window.matchMedia("(hover: hover) and (pointer: fine)").matches;
}

/** Compartilha (mobile/PWA) ou baixa (desktop) o PDF `blob` como `filename`. */
export async function exportPdf(blob: Blob, filename: string): Promise<void> {
  const file = new File([blob], filename, { type: "application/pdf" });

  // Web Share API com arquivos — funciona no iOS/Android (incl. PWA standalone).
  if (typeof navigator !== "undefined" && navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: filename });
      return;
    } catch (err) {
      // Usuário fechou o share sheet → não é erro, não cai no fallback.
      if (err instanceof DOMException && err.name === "AbortError") return;
      // Qualquer outra falha do share → segue pro download.
    }
  }

  // Fallback: download (desktop / Android / navegadores sem share de arquivos).
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
