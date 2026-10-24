import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CalendarDays, Check, ChevronLeft, ChevronRight, Clock, Loader2 } from "lucide-react";
import { AppShell, QueryError } from "@/components/clavis/AppShell";
import { completionsQuery, planDaysQuery, plansQuery } from "@/lib/api";
import { planImage } from "@/lib/plan-images";
import { planProgress } from "@/lib/content";

export const Route = createFileRoute("/planos/$planId/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Plano — CLAVIS VIA" },
      { name: "description", content: "Visão geral do plano e seus dias." },
      { property: "og:title", content: "Plano — CLAVIS VIA" },
      { property: "og:description", content: "Visão geral do plano e seus dias." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <AppShell>
      <PlanDetail />
    </AppShell>
  ),
});

function PlanDetail() {
  const { planId } = Route.useParams();
  const plans = useQuery(plansQuery);
  const days = useQuery(planDaysQuery(planId));
  const completions = useQuery(completionsQuery);

  if (plans.error || days.error) return <QueryError error={plans.error ?? days.error} />;
  if (plans.isLoading || days.isLoading)
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );

  const plan = plans.data?.find((p) => p.id === planId);
  if (!plan) return <p className="p-6">Plano não encontrado.</p>;

  const done = new Set(completions.data?.map((c) => c.plan_day_id));
  const doneCount = days.data?.filter((d) => done.has(d.id)).length ?? 0;
  const next = days.data?.find((d) => !done.has(d.id));

  return (
    <div>
      <div className="relative">
        <img
          src={planImage(plan.id)}
          alt=""
          width={992}
          height={672}
          className="h-56 w-full object-cover"
        />
        <Link
          to="/planos"
          aria-label="Voltar"
          className="absolute left-4 top-4 rounded-full bg-card/80 p-2"
        >
          <ChevronLeft className="h-5 w-5" />
        </Link>
      </div>
      <div className="-mt-6 rounded-t-3xl bg-background px-5 pt-6">
        <h1 className="text-3xl">{plan.title}</h1>
        <div className="mt-2 flex gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <CalendarDays className="h-4 w-4" /> {plan.total_days} dias
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4" /> {plan.minutes} por dia
          </span>
        </div>
        <p className="mt-3 text-sm text-muted-foreground">{plan.description}</p>

        <div className="mt-4">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Progresso</span>
            <span>
              {doneCount}/{plan.total_days}
            </span>
          </div>
          <div className="mt-1 h-1.5 rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary"
              style={{ width: `${planProgress(doneCount, plan.total_days)}%` }}
            />
          </div>
        </div>

        <ul className="mt-5 divide-y rounded-2xl border bg-card">
          {days.data?.map((d) => {
            const isDone = done.has(d.id);
            return (
              <li key={d.id}>
                <Link
                  to="/planos/$planId/dia/$day"
                  params={{ planId, day: String(d.day_number) }}
                  className="flex items-center gap-3 p-4"
                >
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-sm ${
                      isDone
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground"
                    }`}
                  >
                    {isDone ? <Check className="h-4 w-4" /> : d.day_number}
                  </span>
                  <div className="flex-1">
                    <p className="text-sm font-semibold">Dia {d.day_number}</p>
                    <p className="text-xs text-muted-foreground">{d.title}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </Link>
              </li>
            );
          })}
        </ul>

        {next ? (
          <Link
            to="/planos/$planId/dia/$day"
            params={{ planId, day: String(next.day_number) }}
            className="mt-5 block rounded-full bg-primary py-4 text-center font-semibold text-primary-foreground"
          >
            {doneCount === 0 ? "Começar plano" : `Continuar no Dia ${next.day_number}`}
          </Link>
        ) : (
          <p className="mt-5 rounded-2xl bg-mint p-4 text-center text-sm">
            Você concluiu este plano. Que caminhada bonita.
          </p>
        )}
      </div>
    </div>
  );
}
