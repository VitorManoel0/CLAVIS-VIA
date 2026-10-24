import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { MobileFrame } from "@/components/clavis/AppShell";
import { register } from "@/lib/auth";
export const Route = createFileRoute("/cadastro")({ component: Register });
function Register() {
  const n = useNavigate();
  const queryClient = useQueryClient();
  const [name, sn] = useState("");
  const [email, se] = useState("");
  const [p, sp] = useState("");
  const [c, sc] = useState("");
  const [v, sv] = useState(false);
  const [err, ser] = useState("");
  async function submit(x: React.FormEvent) {
    x.preventDefault();
    if (p !== c) {
      ser("As senhas não conferem.");
      return;
    }
    try {
      const user = await register(name, email, p);
      queryClient.setQueryData(["auth", "current-user"], user);
      n({ to: "/hoje" });
    } catch (x) {
      ser(x instanceof Error ? x.message : "Não foi possível criar a conta.");
    }
  }
  return (
    <MobileFrame>
      <form onSubmit={submit} className="flex flex-1 flex-col justify-center gap-5 px-8">
        <Link to="/" className="text-sm text-navy underline">
          ← Voltar para o início
        </Link>
        <h1 className="font-display text-4xl text-navy">Criar conta</h1>
        {err && <p role="alert">{err}</p>}
        <input
          required
          placeholder="Seu nome"
          value={name}
          onChange={(x) => sn(x.target.value)}
          className="rounded-xl border p-4"
        />
        <input
          required
          type="email"
          placeholder="Seu e-mail"
          value={email}
          onChange={(x) => se(x.target.value)}
          className="rounded-xl border p-4"
        />
        <div className="relative">
          <input
            required
            minLength={8}
            type={v ? "text" : "password"}
            placeholder="Sua senha"
            value={p}
            onChange={(x) => sp(x.target.value)}
            className="w-full rounded-xl border p-4 pr-12"
          />
          <button
            type="button"
            onClick={() => sv(!v)}
            className="absolute right-3 top-1/2 -translate-y-1/2"
          >
            {v ? <Eye /> : <EyeOff />}
          </button>
        </div>
        <input
          required
          type={v ? "text" : "password"}
          placeholder="Confirme sua senha"
          value={c}
          onChange={(x) => sc(x.target.value)}
          className="rounded-xl border p-4"
        />
        <button className="rounded-full bg-navy py-4 text-white">Criar minha conta</button>
        <p>
          Já tem conta?{" "}
          <Link to="/login" className="underline">
            Entrar
          </Link>
        </p>
      </form>
    </MobileFrame>
  );
}
