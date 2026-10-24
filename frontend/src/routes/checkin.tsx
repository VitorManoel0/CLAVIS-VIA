import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Check, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/clavis/AppShell";
import { MOODS } from "@/lib/content";
import { createCheckin } from "@/lib/api";

export const Route = createFileRoute("/checkin")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Check-in — CLAVIS VIA" },
      { name: "description", content: "Como você está chegando hoje? Registre seu momento." },
      { property: "og:title", content: "Check-in — CLAVIS VIA" },
      { property: "og:description", content: "Registre como você está se sentindo hoje." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CheckinPage,
});

function CheckinPage() {
  const [mood, setMood] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const navigate = useNavigate();
  const qc = useQueryClient();
  const selectedMood = MOODS.find((item) => item.id === mood);

  const save = useMutation({
    mutationFn: () => createCheckin(mood!, note),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["checkins"] });
      toast.success("Check-in salvo. Obrigada por se ouvir hoje.");
      navigate({ to: "/hoje" });
    },
    onError: (e) => toast.error(`Não conseguimos salvar: ${e instanceof Error ? e.message : ""}`),
  });

  return (
    <AppShell nav={false}>
      <div className="px-6 pt-6">
        <Link to="/hoje" aria-label="Fechar" className="inline-block text-muted-foreground">
          <X className="h-6 w-6" />
        </Link>
        <h1 className="mt-4 text-4xl leading-tight">Como você está chegando hoje?</h1>
        <p className="mt-2 text-muted-foreground">
          Escolha o que mais representa seu momento agora.
        </p>

        <div className="mt-8 grid grid-cols-3 gap-3">
          {MOODS.map((m) => {
            const active = mood === m.id;
            return (
              <button
                type="button"
                key={m.id}
                onClick={() => setMood(m.id)}
                aria-pressed={active}
                className={`relative flex flex-col items-center gap-2 rounded-2xl ${m.tone} px-2 py-4 text-sm transition ${
                  active
                    ? "scale-[1.03] font-semibold opacity-100 ring-2 ring-primary ring-offset-2 shadow-soft"
                    : "opacity-70 hover:opacity-100"
                }`}
              >
                {active && (
                  <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Check className="h-3.5 w-3.5" aria-hidden />
                  </span>
                )}
                <span className="text-3xl" aria-hidden>
                  {m.emoji}
                </span>
                {m.label}
              </button>
            );
          })}
        </div>

        <div
          aria-live="polite"
          className="mt-4 flex min-h-14 items-center justify-center rounded-2xl border bg-card px-4 text-sm"
        >
          {selectedMood ? (
            <p>
              Humor selecionado:{" "}
              <span className="text-xl" aria-hidden>
                {selectedMood.emoji}
              </span>{" "}
              <strong>{selectedMood.label}</strong>
            </p>
          ) : (
            <p className="text-muted-foreground">Nenhum humor selecionado.</p>
          )}
        </div>

        <label className="mt-6 block text-sm text-muted-foreground">
          Quer contar mais? (opcional)
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={500}
            rows={3}
            placeholder="Escreva aqui, se quiser…"
            className="mt-2 w-full rounded-2xl border bg-card p-3 text-foreground outline-none focus:ring-2 focus:ring-ring"
          />
        </label>

        <button
          disabled={!mood || save.isPending}
          onClick={() => save.mutate()}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-primary py-4 font-semibold text-primary-foreground disabled:opacity-40"
        >
          {save.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          Continuar
        </button>
      </div>
    </AppShell>
  );
}
