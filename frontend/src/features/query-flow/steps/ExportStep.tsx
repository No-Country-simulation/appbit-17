import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useReactToPrint } from "react-to-print";
import { Download, Link2, Scale } from "lucide-react";
import { Button } from "@/components/Button";
import { DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { exportPdf, preferNativePrint } from "@/libs/exportPdf";
import type { QueryResult } from "@/types";
import { PrintablePaper } from "../PrintablePaper";

type ExportOption = "pdf" | "link";

export type ExportStepProps = {
  /** Pergunta do usuário — vai no cabeçalho do relatório. */
  question: string;
  /** Resultado da consulta — conteúdo do PDF. */
  result: QueryResult;
};

/**
 * Passo 4 — exportar o relatório em PDF ou copiar link. Exportação HÍBRIDA
 * (ver `preferNativePrint`):
 *  - DESKTOP → impressão nativa (react-to-print) do `PrintablePaper` HTML
 *    estilizado → diálogo com preview / salvar como PDF (melhor no web).
 *  - MOBILE/PWA/iOS → PDF gerado no cliente (@react-pdf/renderer → Blob,
 *    import dinâmico) + Web Share/download. NÃO usa window.print() (quebra no
 *    PWA standalone do iOS).
 */
export function ExportStep({ question, result }: ExportStepProps) {
  const { t, i18n } = useTranslation("query");
  const [selected, setSelected] = useState<ExportOption>("pdf");
  const [busy, setBusy] = useState(false);
  // Data de geração (agora) formatada pelo locale + contagem real de fontes.
  const generatedAt = new Intl.DateTimeFormat(i18n.resolvedLanguage ?? i18n.language).format(
    new Date(),
  );
  const sourceCount = result.sources.length;

  // Impressão nativa (desktop) — clona o PrintablePaper fora da tela.
  const paperRef = useRef<HTMLDivElement>(null);
  const printPaper = useReactToPrint({
    contentRef: paperRef,
    documentTitle: t("export.printDocTitle"),
  });

  async function handleExport() {
    if (selected === "link") {
      void navigator.clipboard?.writeText(window.location.href);
      return;
    }
    // Desktop (browser) → impressão nativa do paper HTML estilizado.
    if (preferNativePrint()) {
      printPaper();
      return;
    }
    // Mobile / PWA / iOS → PDF gerado (@react-pdf) + Web Share/download.
    setBusy(true);
    try {
      // Lazy: só baixa o @react-pdf (pesado) quando realmente vai gerar o Blob.
      const [{ pdf }, { ReportDocument }] = await Promise.all([
        import("@react-pdf/renderer"),
        import("../ReportDocument"),
      ]);
      const blob = await pdf(
        <ReportDocument
          labels={{
            title: t("export.reportTitle"),
            meta: t("export.printMeta", { date: generatedAt }),
            question: t("export.printQuestion"),
            answer: t("export.printAnswer"),
            evidence: t("result.evidence"),
            colData: t("result.colData"),
            colValue: t("result.colValue"),
            colRegion: t("result.colRegion"),
            colPeriod: t("result.colPeriod"),
            sources: t("export.printSources"),
          }}
          question={question}
          result={result}
        />,
      ).toBlob();
      await exportPdf(blob, `${t("export.printDocTitle")}.pdf`);
    } catch {
      // TODO: UI de erro (sem toast por ora). Evita unhandled rejection.
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle className="text-title-2 text-ink">{t("export.title")}</DialogTitle>
        <DialogDescription className="sr-only">{t("export.srDescription")}</DialogDescription>
      </DialogHeader>

      <hr className="border-line" />

      {/* Resumo do relatório */}
      <div className="flex items-center gap-3 rounded-card bg-surface-sec p-4">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-card bg-critical text-caption font-bold text-ink-inverse">
          PDF
        </span>
        <div className="space-y-0.5">
          <p className="text-body-lg font-semibold text-ink">{t("export.reportTitle")}</p>
          <p className="text-caption text-ink-muted">
            {t("export.reportMeta", { date: generatedAt, count: sourceCount })}
          </p>
          <p className="text-caption text-ink-muted">{t("export.reportFormat")}</p>
        </div>
      </div>

      {/* Opções de exportação */}
      <ExportOptionCard
        icon={<Download size={18} />}
        title={t("export.downloadPdf")}
        description={t("export.downloadPdfDesc")}
        active={selected === "pdf"}
        onClick={() => setSelected("pdf")}
      />
      <ExportOptionCard
        icon={<Link2 size={18} />}
        title={t("export.copyLink")}
        description={t("export.copyLinkDesc")}
        active={selected === "link"}
        onClick={() => setSelected("link")}
      />

      {/* Aviso LGPD */}
      <div className="flex items-center gap-2 rounded-card bg-warning/15 px-3 py-2 text-label text-ink/70">
        <Scale size={14} className="shrink-0 text-warning" />
        {t("export.lgpd")}
      </div>

      <Button variant="primary" fullWidth disabled={busy} onClick={handleExport}>
        {busy ? t("export.generating") : t("export.download")}
      </Button>

      {/* Documento imprimível (desktop/react-to-print) — fora da tela;
          `display:none` não funciona com react-to-print, então posicionamos
          fora do viewport. */}
      <div className="pointer-events-none fixed -left-[10000px] top-0" aria-hidden="true">
        <PrintablePaper ref={paperRef} question={question} result={result} />
      </div>
    </>
  );
}

type ExportOptionCardProps = {
  icon: React.ReactNode;
  title: string;
  description: string;
  active: boolean;
  onClick: () => void;
};

/** Item selecionável de exportação (PDF / link). */
function ExportOptionCard({ icon, title, description, active, onClick }: ExportOptionCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-card border p-3 text-left transition-colors ${
        active ? "border-primary bg-primary-soft/40" : "border-line bg-surface hover:bg-surface-sec"
      }`}
    >
      <span
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-btn-sm ${
          active ? "bg-primary-soft text-primary" : "bg-surface-sec text-ink-muted"
        }`}
      >
        {icon}
      </span>
      <span className="space-y-0.5">
        <span className="block text-body font-medium text-ink">{title}</span>
        <span className="block text-caption text-ink-muted">{description}</span>
      </span>
    </button>
  );
}
