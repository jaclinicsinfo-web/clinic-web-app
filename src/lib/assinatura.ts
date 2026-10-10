import type { AssinaturaClinica } from "@/services/assinatura";

const DIA_MS = 24 * 60 * 60 * 1000;
/** A partir de quantos dias antes do vencimento o sistema começa a avisar. */
export const DIAS_AVISO_VENCIMENTO = 5;

export function dataCurta(iso: string | null | undefined) {
  if (!iso) return "";
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeZone: "America/Sao_Paulo" }).format(new Date(iso));
}

export function diasAte(iso: string | null | undefined, agora = Date.now()) {
  if (!iso) return null;
  return Math.ceil((new Date(iso).getTime() - agora) / DIA_MS);
}

export type TomAviso = "warning" | "danger";

/** Aviso de cobrança para o topo do sistema. Teste em andamento já tem o selo próprio. */
export function avisoDeCobranca(assinatura: AssinaturaClinica | null, agora = Date.now()) {
  if (!assinatura) return null;
  if (assinatura.situacao === "atrasada") {
    return {
      tom: "danger" as TomAviso,
      curto: `Pagamento pendente · bloqueia em ${dataCurta(assinatura.bloqueiaEm)}`,
      longo: `A assinatura venceu em ${dataCurta(assinatura.venceEm)}. O acesso será bloqueado em ${dataCurta(assinatura.bloqueiaEm)} se o pagamento não for feito.`,
    };
  }
  if (assinatura.situacao === "em_dia") {
    const dias = diasAte(assinatura.venceEm, agora);
    if (dias !== null && dias <= DIAS_AVISO_VENCIMENTO) {
      return {
        tom: "warning" as TomAviso,
        curto: `Assinatura vence em ${dataCurta(assinatura.venceEm)}`,
        longo: `A ${assinatura.ciclo === "anual" ? "anuidade" : "mensalidade"} vence em ${dataCurta(assinatura.venceEm)}. Pague antes para não interromper o acesso.`,
      };
    }
  }
  return null;
}

export function descricaoSituacao(assinatura: AssinaturaClinica) {
  switch (assinatura.situacao) {
    case "teste":
      return { tom: "warning" as const, rotulo: "Teste grátis", texto: `Teste válido até ${dataCurta(assinatura.venceEm)}. O que sobrar do teste é somado ao primeiro período pago.` };
    case "teste_encerrado":
      return { tom: "danger" as const, rotulo: "Teste encerrado", texto: "O teste grátis terminou. Pague para continuar usando o sistema." };
    case "em_dia":
      return { tom: "success" as const, rotulo: "Em dia", texto: `Pago até ${dataCurta(assinatura.venceEm)}. Pagar antes do vencimento soma o novo período a essa data.` };
    case "atrasada":
      return { tom: "danger" as const, rotulo: "Pagamento pendente", texto: `Venceu em ${dataCurta(assinatura.venceEm)}. O acesso é bloqueado em ${dataCurta(assinatura.bloqueiaEm)}.` };
    case "bloqueada":
      return { tom: "danger" as const, rotulo: "Bloqueada", texto: "O prazo de pagamento terminou." };
    default:
      return { tom: "neutral" as const, rotulo: "Contrato", texto: "A cobrança desta clínica é acompanhada pela nossa equipe. Você também pode pagar por aqui." };
  }
}
