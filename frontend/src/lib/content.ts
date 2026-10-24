// Pure, framework-free domain logic (tested in src/test/content.test.ts).

export const MOODS = [
  { id: "pesada", label: "Pesada", emoji: "😔", tone: "bg-sky" },
  { id: "ansiosa", label: "Ansiosa", emoji: "😟", tone: "bg-sun" },
  { id: "desanimada", label: "Desanimada", emoji: "😞", tone: "bg-lavender" },
  { id: "irritada", label: "Irritada", emoji: "😠", tone: "bg-blush" },
  { id: "sensivel", label: "Sensível", emoji: "🥺", tone: "bg-blush" },
  { id: "em_paz", label: "Em paz", emoji: "😌", tone: "bg-sky" },
  { id: "esperancosa", label: "Esperançosa", emoji: "✨", tone: "bg-lavender" },
  { id: "outro", label: "Outro", emoji: "•••", tone: "bg-muted" },
] as const;

export type MoodId = (typeof MOODS)[number]["id"];

export function moodLabel(id: string): string {
  return MOODS.find((m) => m.id === id)?.label ?? id;
}
export function moodEmoji(id: string): string {
  return MOODS.find((m) => m.id === id)?.emoji ?? "•";
}

export type Recommendation = {
  key: string;
  keyText: string;
  practiceTitle: string;
  practiceDuration: string;
  practiceSteps: string[];
  suggestedPlan: string;
};

const RECS: Record<string, Recommendation> = {
  ansiosa: {
    key: "Respiro e presença",
    keyText:
      "A ansiedade pede pressa. Hoje, o convite é desacelerar o corpo antes de tentar resolver tudo.",
    practiceTitle: "Respiração guiada 4-4-6",
    practiceDuration: "3 minutos",
    practiceSteps: [
      "Inspire contando até 4.",
      "Segure o ar por 4.",
      "Solte devagar contando até 6.",
      "Repita por 6 ciclos.",
    ],
    suggestedPlan: "desanimo",
  },
  pesada: {
    key: "Leveza possível",
    keyText:
      "Nem todo dia precisa ser produtivo. Escolha uma coisa pequena e gentil para fazer por você.",
    practiceTitle: "Escrita de descarga",
    practiceDuration: "5 minutos",
    practiceSteps: [
      "Pegue papel ou o celular.",
      "Escreva tudo o que pesa, sem filtro.",
      "Releia e circule uma coisa que você pode soltar hoje.",
    ],
    suggestedPlan: "desanimo",
  },
  desanimada: {
    key: "Pequenos movimentos",
    keyText: "Motivação costuma vir depois da ação, não antes. Um passo pequeno já conta.",
    practiceTitle: "Três passos pequenos",
    practiceDuration: "4 minutos",
    practiceSteps: [
      "Levante e beba um copo de água.",
      "Abra a janela e respire fundo.",
      "Anote uma tarefa de 5 minutos e faça.",
    ],
    suggestedPlan: "desanimo",
  },
  irritada: {
    key: "Voz e limites",
    keyText:
      "A irritação pode ser um sinal de um limite atravessado. Reconhecer isso é o primeiro passo.",
    practiceTitle: "Pausa de 90 segundos",
    practiceDuration: "2 minutos",
    practiceSteps: [
      "Afaste-se da situação por um instante.",
      "Nomeie o que sente em voz baixa.",
      "Pergunte: qual limite meu foi tocado?",
    ],
    suggestedPlan: "limites",
  },
  sensivel: {
    key: "Acolher-se",
    keyText: "Sensibilidade não é fraqueza. Hoje, trate-se como trataria alguém que você ama.",
    practiceTitle: "Mão no coração",
    practiceDuration: "3 minutos",
    practiceSteps: [
      "Coloque a mão sobre o peito.",
      "Respire devagar sentindo o calor da mão.",
      "Diga a si: “está tudo bem sentir isso”.",
    ],
    suggestedPlan: "rejeicao",
  },
  em_paz: {
    key: "Gratidão",
    keyText: "Que bom estar em paz. Registrar este momento ajuda a lembrar dele nos dias difíceis.",
    practiceTitle: "Três gratidões",
    practiceDuration: "3 minutos",
    practiceSteps: [
      "Pense em três coisas boas de hoje.",
      "Escolha uma e sinta-a por alguns segundos.",
      "Se quiser, compartilhe com alguém.",
    ],
    suggestedPlan: "direcao",
  },
  esperancosa: {
    key: "Direção",
    keyText:
      "A esperança abre caminhos. Use essa energia para dar um passo em direção ao que importa.",
    practiceTitle: "Uma intenção para hoje",
    practiceDuration: "3 minutos",
    practiceSteps: [
      "Feche os olhos por um momento.",
      "Escolha uma intenção simples para o dia.",
      "Escreva-a onde você possa ver.",
    ],
    suggestedPlan: "direcao",
  },
};

const DEFAULT_REC: Recommendation = {
  key: "Um momento para você",
  keyText: "Seja qual for o seu momento, você merece uma pausa gentil.",
  practiceTitle: "Respiração consciente",
  practiceDuration: "3 minutos",
  practiceSteps: [
    "Sente-se confortavelmente.",
    "Observe sua respiração sem mudá-la.",
    "Conte 10 respirações.",
  ],
  suggestedPlan: "fe",
};

export function recommendationFor(mood: string | null | undefined): Recommendation {
  if (!mood) return DEFAULT_REC;
  return RECS[mood] ?? DEFAULT_REC;
}

/** Local calendar day key (YYYY-MM-DD). */
export function dayKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Consecutive days with at least one check-in, ending today (or yesterday, so the streak isn't lost before today's check-in). */
export function streakDays(dates: Date[], today: Date = new Date()): number {
  const set = new Set(dates.map(dayKey));
  const cursor = new Date(today);
  if (!set.has(dayKey(cursor))) cursor.setDate(cursor.getDate() - 1);
  let count = 0;
  while (set.has(dayKey(cursor))) {
    count++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return count;
}

export function planProgress(completedDays: number, totalDays: number): number {
  if (totalDays <= 0) return 0;
  return Math.min(100, Math.round((Math.max(0, completedDays) / totalDays) * 100));
}

export function greeting(d: Date = new Date()): string {
  const h = d.getHours();
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
}
