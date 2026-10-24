import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { CheckCircle2, ChevronLeft, Lightbulb, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { AppShell, QueryError } from "@/components/clavis/AppShell";
import { completeDay, completionsQuery, planDaysQuery, plansQuery } from "@/lib/api";
import { planImage } from "@/lib/plan-images";

export const Route = createFileRoute("/planos/$planId/dia/$day")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Dia do plano — CLAVIS VIA" },
      { name: "description", content: "Conteúdo, reflexão e ação do dia." },
      { property: "og:title", content: "Dia do plano — CLAVIS VIA" },
      { property: "og:description", content: "Conteúdo, reflexão e ação do dia." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <AppShell nav={false}>
      <DayPage />
    </AppShell>
  ),
});

const TABS = ["Conteúdo", "Reflexão", "Ação"] as const;

function DayPage() {
  const { planId, day } = Route.useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const plans = useQuery(plansQuery);
  const days = useQuery(planDaysQuery(planId));
  const completions = useQuery(completionsQuery);
  const [tab, setTab] = useState<(typeof TABS)[number]>("Conteúdo");
  const [reflection, setReflection] = useState("");

  const d = days.data?.find((x) => x.day_number === Number(day));
  const plan = plans.data?.find((p) => p.id === planId);
  const existing = completions.data?.find((c) => c.plan_day_id === d?.id);

  const mark = useMutation({
    mutationFn: () => completeDay(d!.id, reflection || existing?.reflection || undefined),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["completions"] });
      toast.success(`Dia ${d!.day_number} concluído. Um passo de cada vez.`);
      navigate({ to: "/planos/$planId", params: { planId } });
    },
    onError: (e) => toast.error(`Não conseguimos salvar: ${e instanceof Error ? e.message : ""}`),
  });

  if (days.error) return <QueryError error={days.error} />;
  if (days.isLoading)
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  if (!d || !plan) return <p className="p-6">Dia não encontrado.</p>;

  return (
    <div className="px-5 pt-5">
      <div className="flex items-center justify-between">
        <Link to="/planos/$planId" params={{ planId }} aria-label="Voltar">
          <ChevronLeft className="h-6 w-6" />
        </Link>
        <span className="text-sm">
          Dia {d.day_number} de {plan.total_days}
        </span>
        <span className="w-6" />
      </div>
      <h1 className="mt-4 text-3xl">{d.title}</h1>

      <div className="mt-4 flex gap-2">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-full px-4 py-1.5 text-sm ${tab === t ? "border border-primary text-primary" : "text-muted-foreground"}`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "Conteúdo" && (
        <div className="mt-4">
          <img src={planImage(plan.id)} alt="" width={992} height={672} className="h-44 w-full rounded-2xl object-cover" />
          <h2 className="mt-4 text-xl">Mensagem de hoje</h2>
          <p className="mt-2 text-sm leading-relaxed text-secondary-foreground">{d.content}</p>
        </div>
      )}
      {tab === "Reflexão" && (
        <div className="mt-4 rounded-2xl bg-key p-5">
          <Lightbulb className="h-5 w-5 text-primary" />
          <p className="mt-2 font-display text-xl">{d.reflection}</p>
        </div>
      )}
      {tab === "Ação" && (
        <div className="mt-4 flex gap-3 rounded-2xl border bg-card p-5">
          <CheckCircle2 className="h-6 w-6 shrink-0 text-primary" />
          <p className="text-sm">{d.action}</p>
        </div>
      )}

      <label className="mt-6 block text-sm text-muted-foreground">
        Como foi para você? (opcional)
        <textarea
          value={reflection}
          onChange={(e) => setReflection(e.target.value)}
          maxLength={1000}
          rows={3}
          placeholder={existing?.reflection ?? "Escreva aqui sua reflexão…"}
          className="mt-2 w-full rounded-2xl border bg-card p-3 text-foreground outline-none focus:ring-2 focus:ring-ring"
        />
      </label>

      <button
        onClick={() => mark.mutate()}
        disabled={mark.isPending}
        className="mt-4 mb-8 flex w-full items-center justify-center gap-2 rounded-full bg-primary py-4 font-semibold text-primary-foreground disabled:opacity-50"
      >
        {mark.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
        {existing ? "Concluído ✓ (salvar reflexão)" : "Marcar como concluído"}
      </button>
    </div>
  );
}
