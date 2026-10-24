import desanimo from "@/assets/plan-desanimo.jpg";
import rejeicao from "@/assets/plan-rejeicao.jpg";
import limites from "@/assets/plan-limites.jpg";
import fe from "@/assets/plan-fe.jpg";
import direcao from "@/assets/plan-direcao.jpg";

const IMAGES: Record<string, string> = { desanimo, rejeicao, limites, fe, direcao };

export function planImage(id: string): string {
  return IMAGES[id] ?? desanimo;
}
