import logoBlack from "../../assets/logo-black.svg";
import logoWhite from "../../assets/logo-white.svg";

export type LogoProps = {
  /** Classe utilitária p/ tamanho. Sem ela, usa o tamanho original do arquivo. */
  className?: string;
  /** "white" (default, fundos escuros) · "dark" (fundos claros). */
  variant?: "white" | "dark";
};

/** Logo AppBiT (SVG, nítida em qualquer tamanho). */
export function Logo({ className, variant = "white" }: LogoProps) {
  const src = variant === "dark" ? logoBlack : logoWhite;
  return <img src={src} alt="AppBiT" className={className} />;
}
