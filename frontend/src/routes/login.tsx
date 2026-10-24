import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { MobileFrame } from "@/components/clavis/AppShell";
import { login } from "@/lib/auth";
export const Route = createFileRoute("/login")({ component: Login });
function Login() {
  const n = useNavigate();
  const queryClient = useQueryClient();
  const [e, se] = useState("");
  const [p, sp] = useState("");
  const [v, sv] = useState(false);
  const [err, ser] = useState("");
  const [b, sb] = useState(false);
  async function submit(x: React.FormEvent) {
    x.preventDefault();
    sb(true);
    ser("");
    try {
      const user = await login(e, p);
      queryClient.setQueryData(["auth", "current-user"], user);
      n({ to: "/hoje" });
    } catch (x) {
      ser(x instanceof Error ? x.message : "Não foi possível entrar.");
    } finally {
      sb(false);
    }
  }
  return (
    <MobileFrame>
      <form onSubmit={submit} className="relative flex flex-1 flex-col justify-center gap-5 px-8">
        <Link to="/" className="text-sm text-navy underline">
          ← Voltar para o início
        </Link>
        <h1 className="font-display text-4xl text-navy">Bem-vinda de volta</h1>
        {err && (
          <p role="alert" className="rounded-xl bg-card p-3 text-sm text-destructive">
            {err}
          </p>
        )}
        <input
          required
          type="email"
          placeholder="Seu e-mail"
          value={e}
          onChange={(x) => se(x.target.value)}
          className="rounded-xl border bg-background p-4"
        />
        <div className="relative">
          <input
            required
            type={v ? "text" : "password"}
            placeholder="Sua senha"
            value={p}
            onChange={(x) => sp(x.target.value)}
            className="w-full rounded-xl border bg-background p-4 pr-12"
          />
          <button
            type="button"
            aria-label="Visualizar senha"
            onClick={() => sv(!v)}
            className="absolute right-3 top-1/2 -translate-y-1/2"
          >
            {v ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
          </button>
        </div>
        <button
          disabled={b}
          className="rounded-full bg-navy py-4 font-semibold text-navy-foreground"
        >
          {b ? "Entrando..." : "Entrar"}
        </button>
        <p className="text-center text-sm">
          Ainda não tem conta?{" "}
          <Link to="/cadastro" className="font-semibold underline">
            Cadastre-se
          </Link>
        </p>
      </form>
    </MobileFrame>
  );
}
