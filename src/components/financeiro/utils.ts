import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

import type { FormaPagamento } from "@/types";

export const formasPagamento: FormaPagamento[] = [
  "dinheiro",
  "cartao_credito",
  "cartao_debito",
  "pix",
  "boleto",
  "convenio",
];

/** Converte a competência no formato "yyyy-MM" para o rótulo "mmm/yyyy". */
export function formatCompetencia(competencia: string) {
  return format(parseISO(`${competencia}-01`), "MMM/yyyy", { locale: ptBR });
}

export function hojeISO() {
  return format(new Date(), "yyyy-MM-dd");
}
