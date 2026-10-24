import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { BarChart3, BookOpen, Home, Loader2, LogOut } from "lucide-react";
import { useEffect, type ReactNode } from "react";
import { useSession } from "@/hooks/use-session";

export function MobileFrame({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className="min-h-screen bg-muted">
      <div
        className={`mx-auto flex min-h-screen w-full max-w-md flex-col bg-background shadow-soft ${className}`}
      >
        {children}
      </div>
    </div>
  );
}

export function AppShell({ children, nav = true }: { children: ReactNode; nav?: boolean }) {
  const { session, loading, signOut } = useSession();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  function logout() {
    signOut();
    queryClient.clear();
    navigate({ to: "/login", replace: true });
  }

  useEffect(() => {
    if (loading) return;
    if (!session) navigate({ to: "/login" });
    else if (!session.onboarding_completed) navigate({ to: "/onboarding" });
  }, [loading, session, navigate]);

  return (
    <MobileFrame>
      {session && (
        <div className="flex justify-end px-6 pt-4">
          <button
            type="button"
            onClick={logout}
            className="flex items-center gap-2 rounded-full px-3 py-2 text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground"
          >
            <LogOut className="h-4 w-4" />
            Sair
          </button>
        </div>
      )}
      <main className="flex-1 pb-24">
        {loading || !session || !session.onboarding_completed ? (
          <div className="flex h-64 items-center justify-center text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : (
          children
        )}
      </main>
      {nav && <BottomNav />}
    </MobileFrame>
  );
}

function BottomNav() {
  const items = [
    { to: "/hoje", label: "Início", icon: Home },
    { to: "/planos", label: "Planos", icon: BookOpen },
    { to: "/jornada", label: "Jornada", icon: BarChart3 },
  ] as const;
  return (
    <nav className="fixed inset-x-0 bottom-0 mx-auto w-full max-w-md border-t bg-card/95 backdrop-blur">
      <ul className="grid grid-cols-3">
        {items.map(({ to, label, icon: Icon }) => (
          <li key={to}>
            <Link
              to={to}
              className="flex flex-col items-center gap-1 py-3 text-xs text-muted-foreground"
              activeProps={{ className: "text-primary font-semibold" }}
            >
              <Icon className="h-5 w-5" />
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function QueryError({ error }: { error: unknown }) {
  const msg = error instanceof Error ? error.message : "Algo não saiu como esperado.";
  return (
    <div role="alert" className="m-6 rounded-2xl border border-destructive/30 bg-card p-4 text-sm">
      <p className="font-semibold text-destructive">Não conseguimos carregar agora.</p>
      <p className="mt-1 text-muted-foreground">{msg}</p>
    </div>
  );
}

export function PageLoading({ label = "Carregando..." }: { label?: string }) {
  return (
    <div
      className="flex h-64 flex-col items-center justify-center gap-3 text-muted-foreground"
      role="status"
      aria-live="polite"
    >
      <Loader2 className="h-6 w-6 animate-spin" aria-hidden="true" />
      <span className="text-sm">{label}</span>
    </div>
  );
}

export function Disclaimer() {
  return (
    <p className="px-6 pt-6 text-center text-[11px] leading-relaxed text-muted-foreground">
      Conteúdo de demonstração. O CLAVIS VIA não substitui acompanhamento médico ou psicológico.
    </p>
  );
}
