import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useQueryFlow } from "./useQueryFlow";
import { InputStep } from "./steps/InputStep";
import { LoadingStep } from "./steps/LoadingStep";
import { ResultStep } from "./steps/ResultStep";
import { ExportStep } from "./steps/ExportStep";

export type QueryFlowModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Texto vindo do AIPrompt do mapa — preenche o campo ao abrir. */
  initialQuestion?: string;
};

/**
 * Fluxo de consulta à IA (modal multi-passo, sem navegar de rota):
 *   input → loading → result → export
 *
 * O estado vive no `useQueryFlow`; os steps recebem tudo por props.
 * Quem abre deve trocar a `key` a cada abertura (ver MapPage) p/ remontar
 * com o texto novo e resetar o fluxo.
 */
export function QueryFlowModal({ open, onOpenChange, initialQuestion = "" }: QueryFlowModalProps) {
  const flow = useQueryFlow(initialQuestion);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* `grid-cols-[minmax(0,1fr)]`: a coluna implícita (`auto`) do grid do DialogContent
          não encolhe abaixo do min-content da tabela do ResultStep (nowrap) → no mobile o
          modal inteiro ganhava scroll horizontal. Com min 0, quem rola é só o wrapper da tabela. */}
      <DialogContent className="max-h-[85vh] grid-cols-[minmax(0,1fr)] overflow-y-auto sm:max-w-2xl">
        {flow.step === "input" ? (
          <InputStep
            question={flow.question}
            onQuestionChange={flow.setQuestion}
            onSubmit={flow.submit}
          />
        ) : flow.step === "loading" ? (
          <LoadingStep question={flow.question} />
        ) : flow.step === "result" && flow.result ? (
          <ResultStep
            question={flow.question}
            result={flow.result}
            onRefine={flow.refine}
            onExport={flow.toExport}
          />
        ) : flow.result ? (
          <ExportStep question={flow.question} result={flow.result} />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
