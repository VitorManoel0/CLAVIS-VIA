import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  BarChart3,
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  HeartPulse,
  Loader2,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useState } from "react";

import { MobileFrame } from "@/components/clavis/AppShell";
import { Wordmark } from "@/components/clavis/KeyLogo";
import { useSession } from "@/hooks/use-session";
import { completeOnboarding } from "@/lib/auth";

export const Route = createFileRoute("/onboarding")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Conheça o CLAVIS VIA" },
      {
        name: "description",
        content: "Uma apresentação rápida das principais funcionalidades do CLAVIS VIA.",
      },
    ],
  }),
  component: Onboarding,
});

type OnboardingSlide = {
  icon: LucideIcon;
  eyebrow: string;
  title: string;
  description: string;
  detail: string;
  color: string;
};

const SLIDES: OnboardingSlide[] = [
  {
    icon: HeartPulse,
    eyebrow: "Seu espaço diário",
    title: "Um caminho de volta para si",
    description:
      "O CLAVIS VIA ajuda você a perceber como está e encontrar um próximo passo possível.",
    detail: "Leva poucos minutos e respeita o seu ritmo.",
    color: "bg-blush",
  },
  {
    icon: CheckCircle2,
    eyebrow: "Check-in emocional",
    title: "Comece dizendo como você chegou",
    description:
      "Escolha o humor que mais combina com o momento e, se quiser, registre uma pequena nota.",
    detail: "Seus check-ins ficam salvos na sua Jornada.",
    color: "bg-sky",
  },
  {
    icon: Sparkles,
    eyebrow: "Sua chave de hoje",
    title: "Receba uma prática para o seu momento",
    description:
      "A tela Hoje adapta uma mensagem e uma prática curta de acordo com o seu check-in mais recente.",
    detail: "Respiração, reflexão e pequenos gestos para o dia.",
    color: "bg-lavender",
  },
  {
    icon: BookOpen,
    eyebrow: "Planos guiados",
    title: "Avance um dia de cada vez",
    description:
      "Explore planos sobre emoções, relacionamentos, fé e direção, com conteúdo, reflexão e ação.",
    detail: "Você pode continuar de onde parou quando quiser.",
    color: "bg-sun",
  },
  {
    icon: BarChart3,
    eyebrow: "Minha Jornada",
    title: "Acompanhe seus pequenos avanços",
    description:
      "Reveja check-ins recentes, dias consecutivos e o progresso dos planos que você começou.",
    detail: "Cada registro ajuda a tornar sua caminhada visível.",
    color: "bg-mint",
  },
];

function Onboarding() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { session, loading } = useSession();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (loading) return;
    if (!session) navigate({ to: "/login", replace: true });
    else if (session.onboarding_completed) navigate({ to: "/hoje", replace: true });
  }, [loading, session, navigate]);

  async function finish(goToCheckin: boolean) {
    setSaving(true);
    setError("");
    try {
      const user = await completeOnboarding();
      queryClient.setQueryData(["auth", "current-user"], user);
      navigate({ to: goToCheckin ? "/checkin" : "/hoje", replace: true });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Não foi possível continuar.");
    } finally {
      setSaving(false);
    }
  }

  if (loading || !session || session.onboarding_completed) {
    return (
      <MobileFrame>
        <div className="flex flex-1 items-center justify-center text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" aria-label="Carregando" />
        </div>
      </MobileFrame>
    );
  }

  const slide = SLIDES[step];
  const Icon = slide.icon;
  const isLast = step === SLIDES.length - 1;

  return (
    <MobileFrame className="bg-dawn">
      <main className="flex flex-1 flex-col px-7 pb-8 pt-6">
        <div className="flex items-center justify-between">
          <Wordmark size="sm" />
          {!isLast && (
            <button
              type="button"
              disabled={saving}
              onClick={() => void finish(false)}
              className="rounded-full px-3 py-2 text-sm text-muted-foreground hover:bg-card/70"
            >
              Pular
            </button>
          )}
        </div>

        <div className="mt-8 flex gap-2" aria-label={`Etapa ${step + 1} de ${SLIDES.length}`}>
          {SLIDES.map((item, index) => (
            <span
              key={item.eyebrow}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                index <= step ? "bg-primary" : "bg-secondary"
              }`}
            />
          ))}
        </div>

        <section className="flex flex-1 flex-col justify-center py-10 text-center" aria-live="polite">
          <div
            className={`mx-auto flex h-24 w-24 items-center justify-center rounded-3xl ${slide.color}`}
          >
            <Icon className="h-11 w-11 text-navy" aria-hidden="true" />
          </div>
          <p className="mt-7 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            {slide.eyebrow}
          </p>
          <h1 className="mt-3 text-4xl leading-tight text-navy">
            {step === 0 ? `Bem-vinda, ${session.name.split(" ")[0]}` : slide.title}
          </h1>
          {step === 0 && <h2 className="mt-2 font-display text-2xl text-navy">{slide.title}</h2>}
          <p className="mx-auto mt-4 max-w-sm text-base leading-relaxed text-secondary-foreground">
            {slide.description}
          </p>
          <p className="mx-auto mt-4 max-w-xs rounded-2xl bg-card/70 px-4 py-3 text-sm text-muted-foreground">
            {slide.detail}
          </p>
        </section>

        {error && (
          <p
            role="alert"
            className="mb-4 rounded-2xl bg-card p-3 text-center text-sm text-destructive"
          >
            {error}
          </p>
        )}

        <div className="flex items-center gap-3">
          {step > 0 && (
            <button
              type="button"
              disabled={saving}
              onClick={() => setStep((current) => current - 1)}
              aria-label="Voltar para a etapa anterior"
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border bg-card text-navy"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          )}
          <button
            type="button"
            disabled={saving}
            onClick={() => {
              if (isLast) void finish(true);
              else setStep((current) => current + 1);
            }}
            className="flex h-14 flex-1 items-center justify-center gap-2 rounded-full bg-navy px-6 font-semibold text-navy-foreground disabled:opacity-60"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Preparando...
              </>
            ) : isLast ? (
              "Fazer meu primeiro check-in"
            ) : (
              <>
                Continuar <ChevronRight className="h-5 w-5" />
              </>
            )}
          </button>
        </div>
      </main>
    </MobileFrame>
  );
}
