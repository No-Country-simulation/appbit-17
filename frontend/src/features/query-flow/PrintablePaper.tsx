/* ============================================================
   PrintablePaper — o "paper" em HTML estilizado, p/ impressão nativa
   no DESKTOP (via react-to-print). Espelha o layout do ReportDocument
   (@react-pdf, usado no mobile/PWA), mas com a fonte/cores do app —
   fica mais bonito que o Helvetica do PDF gerado.
   Renderizado fora da tela no ExportStep; react-to-print clona este nó.
   ============================================================ */

import { forwardRef } from "react";
import { useTranslation } from "react-i18next";
import type { QueryResult } from "@/types";

export type PrintablePaperProps = {
  /** Pergunta do usuário (cabeçalho). */
  question: string;
  /** Resultado da consulta (conteúdo do relatório). */
  result: QueryResult;
};

/** Documento imprimível: pergunta → resposta → tabela de evidências → fontes.
 *  Layout baseado em bordas/texto (imprime bem sem hacks de color-adjust). */
export const PrintablePaper = forwardRef<HTMLDivElement, PrintablePaperProps>(
  function PrintablePaper({ question, result }, ref) {
    const { t, i18n } = useTranslation("query");
    // Data de geração formatada pelo locale ativo.
    const generatedAt = new Intl.DateTimeFormat(i18n.resolvedLanguage ?? i18n.language).format(
      new Date(),
    );

    return (
      // Largura ~A4 @96dpi p/ o preview de impressão sair enquadrado.
      <div ref={ref} className="w-[794px] bg-white p-12 text-ink">
        <h1 className="text-title-2 font-semibold text-ink">{t("export.reportTitle")}</h1>
        <p className="mt-1 text-caption text-ink-muted">
          {t("export.printMeta", { date: generatedAt })}
        </p>

        <p className="mt-6 text-caption uppercase tracking-wide text-ink-muted">
          {t("export.printQuestion")}
        </p>
        <p className="mt-1 text-body text-ink">{question}</p>

        <p className="mt-6 text-caption uppercase tracking-wide text-ink-muted">
          {t("export.printAnswer")}
        </p>
        <p className="mt-1 border-l-4 border-primary pl-4 text-body-lg leading-relaxed text-ink">
          {result.claim}
        </p>

        <p className="mt-6 text-caption uppercase tracking-wide text-ink-muted">
          {t("result.evidence")}
        </p>
        <table className="mt-2 w-full border-collapse text-left text-body">
          <thead>
            <tr className="border-b border-line text-caption uppercase tracking-wide text-ink-muted">
              <th scope="col" className="py-2 pr-3 font-medium">
                {t("result.colData")}
              </th>
              <th scope="col" className="py-2 pr-3 font-medium">
                {t("result.colValue")}
              </th>
              <th scope="col" className="py-2 pr-3 font-medium">
                {t("result.colRegion")}
              </th>
              <th scope="col" className="py-2 font-medium">
                {t("result.colPeriod")}
              </th>
            </tr>
          </thead>
          <tbody>
            {result.evidence.map((row, i) => (
              <tr key={`${row.label}-${i}`} className="border-b border-line/60">
                <th scope="row" className="py-2 pr-3 text-left font-semibold text-ink">
                  {row.label}
                </th>
                <td className="py-2 pr-3 tabular-nums text-ink">{row.value}</td>
                <td className="py-2 pr-3 text-ink">{row.region}</td>
                <td className="py-2 text-ink-muted">{row.period}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <p className="mt-6 text-caption uppercase tracking-wide text-ink-muted">
          {t("export.printSources")}
        </p>
        <ul className="mt-1">
          {result.sources.map((source) => (
            <li key={source.name} className="text-caption text-ink-muted">
              {source.name}
            </li>
          ))}
        </ul>
      </div>
    );
  },
);
