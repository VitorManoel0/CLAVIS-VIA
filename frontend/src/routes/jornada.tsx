import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, Heart, Loader2 } from "lucide-react";
import { AppShell, Disclaimer, QueryError } from "@/components/clavis/AppShell";
import { allPlanDaysQuery, checkinsQuery, completionsQuery, plansQuery } from "@/lib/api";
import { dayKey, moodEmoji, moodLabel, planProgress, streakDays } from "@/lib/content";

export const Route = createFileRoute("/jornada")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Minha jornada — CLAVIS VIA" },
      { name: "description", content: "Seus check-ins recentes e o progresso nos planos." },
      { property: "og:title", content: "Minha jornada — CLAVIS VIA" },
      { property: "og:description", content: "Seus check-ins recentes e o progresso nos planos." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <AppShell>
      <Journey />
    </AppShell>
  ),
});

const WEEK = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const fmt = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });

function Journey() {
  const checkins = useQuery(checkinsQuery);
  const completions = useQuery(completionsQuery);
  const plans = useQuery(plansQuery);
  const days = useQuery(allPlanDaysQuery);

  const err = checkins.error ?? completions.error;
  if (err) return <QueryError error={err} />;
  if (checkins.isLoading || completions.isLoading)
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );

  const list = checkins.data ?? [];
  const streak = streakDays(list.map((c) => new Date(c.created_at)));
  const checkedDays = new Set(list.map((c) => dayKey(new Date(c.created_at))));
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d;
  });

  const done = new Set(completions.data?.map((c) => c.plan_day_id));
  const started = (plans.data ?? [])
    .map((p) => ({ plan: p, count: days.data?.filter((d) => d.plan_id === p.id && done.has(d.id)).length ?? 0 }))
    .filter((x) => x.count > 0);

  const dayById = new Map(days.data?.map((d) => [d.id, d]));
  const planById = new Map(plans.data?.map((p) => [p.id, p]));

  return (
    <div className="space-y-5 px-5 pt-6">
      <h1 className="text-4xl">Minha jornada</h1>

      <section className="rounded-3xl border bg-card p-5">
        <p>
          <span className="font-display text-4xl">{streak}</span>{" "}
          <span className="text-sm">dia{streak === 1 ? "" : "s"} consecutivo{streak === 1 ? "" : "s"}</span>
        </p>
        <div className="mt-4 grid grid-cols-7 gap-1 text-center text-[11px] text-muted-foreground">
          {last7.map((d) => {
            const on = checkedDays.has(dayKey(d));
            return (
              <div key={dayKey(d)} className="flex flex-col items-center gap-1">
                <span className={`h-6 w-6 rounded-full ${on ? "bg-primary" : "border"}`} />
                {WEEK[d.getDay()]}
              </div>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="text-2xl">Check-ins recentes</h2>
        {list.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">
            Nenhum check-in ainda.{" "}
            <Link to="/checkin" className="text-primary underline">
              Fazer o primeiro
            </Link>
          </p>
        ) : (
          <ul className="mt-2 divide-y rounded-2xl border bg-card">
            {list.slice(0, 8).map((c) => (
              <li key={c.id} className="flex items-center gap-3 p-3 text-sm">
                <span className="text-xl">{moodEmoji(c.mood)}</span>
                <div className="flex-1">
                  <p className="font-semibold">{moodLabel(c.mood)}</p>
                  {c.note && <p className="text-xs text-muted-foreground line-clamp-1">{c.note}</p>}
                </div>
                <span className="text-xs text-muted-foreground">{fmt.format(new Date(c.created_at))}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="text-2xl">Planos em andamento</h2>
        {started.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">
            Você ainda não concluiu nenhum dia.{" "}
            <Link to="/planos" className="text-primary underline">
              Ver planos
            </Link>
          </p>
        ) : (
          <ul className="mt-2 space-y-2">
            {started.map(({ plan, count }) => (
              <li key={plan.id}>
                <Link to="/planos/$planId" params={{ planId: plan.id }} className="block rounded-2xl border bg-card p-4">
                  <div className="flex justify-between text-sm">
                    <span className="font-semibold">{plan.title}</span>
                    <span className="text-muted-foreground">
                      {count}/{plan.total_days}
                    </span>
                  </div>
                  <div className="mt-2 h-1.5 rounded-full bg-muted">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${planProgress(count, plan.total_days)}%` }} />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="text-2xl">Minhas conquistas</h2>
        <ul className="mt-2 divide-y rounded-2xl border bg-card text-sm">
          <li className="flex items-center gap-3 p-3">
            <Heart className="h-4 w-4 text-primary" /> Fiz {list.length} check-in{list.length === 1 ? "" : "s"}
          </li>
          {(completions.data ?? []).slice(0, 5).map((c) => {
            const d = dayById.get(c.plan_day_id);
            const p = d && planById.get(d.plan_id);
            return (
              <li key={c.id} className="flex items-center gap-3 p-3">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <span className="flex-1">
                  Concluí o Dia {d?.day_number} de “{p?.title ?? "plano"}”
                </span>
                <span className="text-xs text-muted-foreground">{fmt.format(new Date(c.completed_at))}</span>
              </li>
            );
          })}
        </ul>
      </section>
      <Disclaimer />
    </div>
  );
}
