import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ChevronRight, Loader2 } from "lucide-react";
import { AppShell, Disclaimer, QueryError } from "@/components/clavis/AppShell";
import { allPlanDaysQuery, completionsQuery, plansQuery } from "@/lib/api";
import { planImage } from "@/lib/plan-images";

export const Route = createFileRoute("/planos/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Planos — CLAVIS VIA" },
      { name: "description", content: "Planos curtos e temáticos para atravessar momentos difíceis." },
      { property: "og:title", content: "Planos — CLAVIS VIA" },
      { property: "og:description", content: "Planos curtos e temáticos para o seu momento." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <AppShell>
      <Plans />
    </AppShell>
  ),
});

const THEMES = [
  { id: "todos", label: "Todos" },
  { id: "emocoes", label: "Emoções" },
  { id: "relacionamentos", label: "Relacionamentos" },
  { id: "fe", label: "Fé" },
];

function Plans() {
  const [theme, setTheme] = useState("todos");
  const plans = useQuery(plansQuery);
  const days = useQuery(allPlanDaysQuery);
  const completions = useQuery(completionsQuery);

  if (plans.error) return <QueryError error={plans.error} />;
  const done = new Set(completions.data?.map((c) => c.plan_day_id));
  const list = (plans.data ?? []).filter((p) => theme === "todos" || p.theme === theme);

  return (
    <div className="px-5 pt-6">
      <h1 className="text-4xl">Planos</h1>
      <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
        {THEMES.map((t) => (
          <button
            key={t.id}
            onClick={() => setTheme(t.id)}
            className={`shrink-0 rounded-full px-4 py-1.5 text-sm ${
              theme === t.id ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {plans.isLoading ? (
        <div className="flex h-40 items-center justify-center text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
      ) : (
        <ul className="mt-5 space-y-3">
          {list.map((p) => {
            const count = days.data?.filter((d) => d.plan_id === p.id && done.has(d.id)).length ?? 0;
            return (
              <li key={p.id}>
                <Link
                  to="/planos/$planId"
                  params={{ planId: p.id }}
                  className="flex items-center gap-4 overflow-hidden rounded-2xl border bg-card pr-4"
                >
                  <img src={planImage(p.id)} alt="" loading="lazy" width={992} height={672} className="h-24 w-28 object-cover" />
                  <div className="flex-1 py-2">
                    <p className="font-display text-lg leading-tight">{p.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {p.total_days} dias{count > 0 && ` · ${count} concluído${count > 1 ? "s" : ""}`}
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </Link>
              </li>
            );
          })}
          {list.length === 0 && <p className="text-sm text-muted-foreground">Nenhum plano neste tema ainda.</p>}
        </ul>
      )}
      <Disclaimer />
    </div>
  );
}
