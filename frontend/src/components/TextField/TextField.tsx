import { useId, type InputHTMLAttributes } from "react";
import { cx, styles } from "./TextField.styles";

export type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  /** Rótulo exibido acima do campo. */
  label: string;
};

/**
 * Campo de formulário (rótulo + input em pílula).
 * Aceita todas as props nativas de <input> (type, value, onChange, placeholder...).
 */
export function TextField({ label, id, className, ...props }: TextFieldProps) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;

  return (
    <div className={styles.field}>
      <label htmlFor={fieldId} className={styles.label}>
        {label}
      </label>
      <input id={fieldId} className={cx(styles.input, className)} {...props} />
    </div>
  );
}
