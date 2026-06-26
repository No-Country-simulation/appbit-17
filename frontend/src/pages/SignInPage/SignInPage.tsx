import { useState, type FormEvent } from "react";
import { Button } from "../../components/Button";
import { TextField } from "../../components/TextField";
import { Logo } from "../../components/Logo";

function CheckGlyph() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m4 12.5 5 5L20 6.5" />
    </svg>
  );
}

export function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    // TODO: autenticar via api/ quando o endpoint de login existir.
    console.log("login:", { email });
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* ---- Painel esquerdo (hero) ---- */}
      <aside className="bg-hero-navy hidden flex-col justify-between p-12 text-ink-inverse lg:flex">
        <div>
          <Logo className="h-9 w-auto" />
        </div>

        <div className="max-w-md space-y-6">
          <h1 className="text-5xl font-bold leading-[1.05]">
            Decisões baseadas em evidência.
          </h1>
          <div className="space-y-2">
            <p className="text-title-3">Pergunte. Analise. Decida.</p>
            <p className="text-body-lg text-ink-inverse/60">
              Evidência verificável. Fontes citáveis. Decisão com respaldo em 5
              minutos, não em 5 dias.
            </p>
          </div>
        </div>

        <figure className="max-w-md rounded-panel bg-ink-inverse/5 p-6">
          <blockquote className="text-body text-ink-inverse/80">
            “O Vísent CDRView cobre regiões com dados de mobilidade, cobertura de
            rede e indicadores socioeconômicos, cruzáveis em uma única consulta.”
          </blockquote>
          <figcaption className="mt-3 text-caption text-ink-inverse/50">
            — Time AppBiT · Hackathon B2G 2026
          </figcaption>
        </figure>
      </aside>

      {/* ---- Painel direito (formulário) ---- */}
      <main className="flex flex-col items-center justify-center gap-6 bg-surface p-6">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-md space-y-5 rounded-panel bg-surface p-8 shadow-elev-3 ring-1 ring-line"
        >
          <div className="space-y-1">
            <h2 className="text-title-2 text-ink">Bem-vinda, Carla.</h2>
            <p className="text-body text-ink-muted">
              Acesse sua conta institucional para continuar.
            </p>
          </div>

          <hr className="border-line" />

          <TextField
            label="E-mail institucional"
            type="email"
            autoComplete="email"
            placeholder="nome@prefeitura.gov.br"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <div className="space-y-1.5">
            <TextField
              label="Senha"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <div className="text-right">
              <a href="#" className="text-label text-primary hover:underline">
                Esqueci minha senha
              </a>
            </div>
          </div>

          <Button type="submit" variant="primary" fullWidth>
            Entrar
          </Button>

          <div className="flex items-center gap-3 text-caption text-ink-muted">
            <span className="h-px flex-1 bg-line" />
            ou
            <span className="h-px flex-1 bg-line" />
          </div>

          <Button type="button" variant="secondary" fullWidth>
            Entrar com gov.br
          </Button>

          <p className="text-center text-caption text-ink-muted">
            Acesso restrito a servidores públicos municipais.
          </p>
        </form>

        <p className="text-caption text-ink-muted">
          Hackathon App BiT B2G · Jun–Jul 2026
        </p>

        <span className="inline-flex items-center gap-1.5 rounded-pill bg-success-soft px-3 py-1 text-label font-medium text-success">
          <CheckGlyph />
          Conexão governamental segura
        </span>
      </main>
    </div>
  );
}
