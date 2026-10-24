import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowRight, BookOpen, ChevronRight, Wind } from "lucide-react";
import { AppShell, Disclaimer, QueryError } from "@/components/clavis/AppShell";
import { KeyIcon, Wordmark } from "@/components/clavis/KeyLogo";
import { allPlanDaysQuery, checkinsQuery, completionsQuery, plansQuery } from "@/lib/api";
import { useSession } from "@/hooks/use-session";
import {
  dayKey,
  greeting,
  moodEmoji,
  moodLabel,
  planProgress,
  recommendationFor,
} from "@/lib/content";

export const Route = createFileRoute("/hoje")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Hoje — CLAVIS VIA" },
      {
        name: "description",
        content: "Sua chave do dia e uma prática curta pensada para o seu momento.",
      },
      { property: "og:title", content: "Hoje — CLAVIS VIA" },
      { property: "og:description", content: "Sua chave do dia e uma prática curta." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <AppShell>
      <Today />
    </AppShell>
  ),
});

function Today() {
  const { user } = useSession();
  const checkins = useQuery(checkinsQuery);
  const plans = useQuery(plansQuery);
  const days = useQuery(allPlanDaysQuery);
  const completions = useQuery(completionsQuery);
  const [showPractice, setShowPractice] = useState(false);

  if (checkins.error) return <QueryError error={checkins.error} />;

  const last = checkins.data?.[0];
  const checkedToday = last && dayKey(new Date(last.created_at)) === dayKey(new Date());
  const rec = recommendationFor(checkedToday ? last.mood : null);

  // Continue: plan with most recent completion, else suggested plan.
  const doneIds = new Set(completions.data?.map((c) => c.plan_day_id));
  const lastDone = completions.data?.[0];
  const lastDoneDay = days.data?.find((d) => d.id === lastDone?.plan_day_id);
  const continuePlanId = lastDoneDay?.plan_id ?? rec.suggestedPlan;
  const continuePlan = plans.data?.find((p) => p.id === continuePlanId);
  const continueDone =
    days.data?.filter((d) => d.plan_id === continuePlanId && doneIds.has(d.id)).length ?? 0;

  return (
    <div className="space-y-5 px-5 pt-6">
      <div className="flex items-center justify-between">
        <Wordmark size="sm" />
      </div>
      <div>
        <h1 className="text-3xl">
          {greeting()}, {user?.name.split(" ")[0]}
        </h1>
        <p className="text-muted-foreground">Que bom ter você aqui hoje.</p>
      </div>

      {!checkedToday && (
        <Link
          to="/checkin"
          className="flex items-center justify-between rounded-2xl border bg-card p-4 text-sm shadow-soft"
        >
          <span>Você ainda não fez o check-in de hoje.</span>
          <span className="font-semibold text-primary">Fazer agora</span>
        </Link>
      )}

      <section className="relative overflow-hidden rounded-3xl bg-key p-5 shadow-soft">
        <KeyIcon className="absolute -left-2 top-6 h-32 w-16 opacity-40" />
        <div className="ml-16">
          <p className="text-[11px] uppercase tracking-widest text-muted-foreground">
            Sua chave de hoje
          </p>
          <h2 className="mt-1 text-2xl text-navy">{rec.key}</h2>
          {checkedToday && (
            <p className="mt-1 text-xs text-muted-foreground">
              Porque você chegou {moodEmoji(last.mood)} {moodLabel(last.mood).toLowerCase()}
            </p>
          )}
          <p className="mt-3 text-sm text-secondary-foreground">{rec.keyText}</p>
          <button
            onClick={() => setShowPractice((v) => !v)}
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
          >
            {showPractice ? "Fechar prática" : "Ver prática de hoje"}{" "}
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </section>

      {showPractice && (
        <section className="rounded-3xl border bg-card p-5 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-sky text-primary">
            <Wind className="h-7 w-7" />
          </div>
          <h3 className="mt-3 text-2xl">{rec.practiceTitle}</h3>
          <p className="text-sm text-muted-foreground">{rec.practiceDuration}</p>
          <ol className="mt-4 space-y-2 text-left text-sm">
            {rec.practiceSteps.map((s, i) => (
              <li key={i} className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-secondary text-xs">
                  {i + 1}
                </span>
                {s}
              </li>
            ))}
          </ol>
        </section>
      )}

      <section className="flex gap-4 rounded-3xl border bg-card p-5">
        <BookOpen className="h-8 w-8 shrink-0 text-primary" />
        <div>
          <h3 className="text-xl">Um minuto com Deus</h3>
          <p className="mt-1 text-sm italic text-muted-foreground">
            “Porque eu bem sei os planos que tenho para vocês… planos de dar a vocês esperança e um
            futuro.”
          </p>
          <p className="mt-2 text-xs text-muted-foreground">Jeremias 29:11</p>
        </div>
      </section>

      {continuePlan && (
        <Link
          to="/planos/$planId"
          params={{ planId: continuePlan.id }}
          className="block rounded-3xl border bg-card p-5"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold">
                {lastDone ? "Continue sua jornada" : "Sugestão para você"}
              </p>
              <p className="text-sm text-muted-foreground">{continuePlan.title}</p>
              <p className="text-xs text-muted-foreground">
                Dia {Math.min(continueDone + 1, continuePlan.total_days)} de{" "}
                {continuePlan.total_days}
              </p>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="mt-3 h-1.5 rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary"
              style={{ width: `${planProgress(continueDone, continuePlan.total_days)}%` }}
            />
          </div>
        </Link>
      )}
      <Disclaimer />
    </div>
  );
}
