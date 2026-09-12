import type { TipoBatida } from "@/types";

export const tipoBatidaLabels: Record<TipoBatida, string> = {
  entrada: "Entrada",
  saida_intervalo: "Início do intervalo",
  retorno_intervalo: "Retorno do intervalo",
  saida: "Saída",
};

export function horaOuTraco(valor: string | null | undefined) {
  return valor || "—";
}
