import { describe, expect, it } from "vitest";
import { planProgress, recommendationFor, streakDays } from "@/lib/content";

describe("recomendação por check-in", () => {
  it("ansiosa recebe respiração guiada", () => {
    expect(recommendationFor("ansiosa").practiceTitle).toBe("Respiração guiada 4-4-6");
  });
  it("irritada recebe a chave Voz e limites e sugere o plano de limites", () => {
    const r = recommendationFor("irritada");
    expect(r.key).toBe("Voz e limites");
    expect(r.suggestedPlan).toBe("limites");
  });
  it("sem check-in ou estado desconhecido usa a recomendação padrão", () => {
    expect(recommendationFor(null).key).toBe("Um momento para você");
    expect(recommendationFor("xyz").key).toBe("Um momento para você");
  });
});

describe("dias consecutivos", () => {
  const today = new Date(2026, 9, 21, 10);
  const d = (offset: number) => new Date(2026, 9, 21 - offset, 9);
  it("conta dias seguidos até hoje", () => {
    expect(streakDays([d(0), d(1), d(2), d(4)], today)).toBe(3);
  });
  it("mantém a sequência se o último check-in foi ontem", () => {
    expect(streakDays([d(1), d(2)], today)).toBe(2);
  });
  it("vários check-ins no mesmo dia contam uma vez", () => {
    expect(streakDays([d(0), d(0)], today)).toBe(1);
  });
  it("zera quando o último check-in foi há dois dias", () => {
    expect(streakDays([d(2)], today)).toBe(0);
  });
});

describe("progresso do plano", () => {
  it("1 de 3 dias = 33%", () => expect(planProgress(1, 3)).toBe(33));
  it("nunca passa de 100%", () => expect(planProgress(5, 3)).toBe(100));
  it("plano sem dias = 0%", () => expect(planProgress(1, 0)).toBe(0));
});
