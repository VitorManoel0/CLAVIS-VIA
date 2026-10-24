import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { MobileFrame } from "@/components/clavis/AppShell";
import { Wordmark } from "@/components/clavis/KeyLogo";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CLAVIS VIA — Seu caminho de volta para si" },
      {
        name: "description",
        content:
          "Check-in emocional diário, práticas curtas e planos temáticos para acompanhar sua jornada.",
      },
      { property: "og:title", content: "CLAVIS VIA — Seu caminho de volta para si" },
      {
        property: "og:description",
        content: "Check-in emocional diário, práticas curtas e planos temáticos.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Entry,
});

function Entry() {
  const navigate = useNavigate();

  return (
    <MobileFrame className="bg-dawn">
      <div className="flex flex-1 flex-col items-center justify-between px-8 py-16">
        <div className="mt-10 flex flex-col items-center gap-8">
          <Wordmark />
          <p className="text-center font-display text-2xl leading-snug text-navy/80">
            Seu caminho
            <br />
            de volta para si,
            <br />
            todos os dias.
          </p>
        </div>

        <div className="w-full space-y-4">
          <button
            onClick={() => navigate({ to: "/login" })}
            className="w-full rounded-full bg-navy py-4 font-semibold text-navy-foreground"
          >
            Entrar
          </button>
          <button
            onClick={() => navigate({ to: "/cadastro" })}
            className="w-full rounded-full border border-navy py-4 font-semibold text-navy"
          >
            Criar minha conta
          </button>
          <p className="text-center text-[11px] text-muted-foreground">
            Protótipo com dados fictícios. Não substitui acompanhamento profissional.
          </p>
        </div>
      </div>
    </MobileFrame>
  );
}
