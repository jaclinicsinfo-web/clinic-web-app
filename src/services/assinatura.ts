import { api } from "@/lib/api";
import type { CodigoPlano } from "@/types";

export type CicloCobranca = "mensal" | "anual";

export type SituacaoAssinatura = "teste" | "teste_encerrado" | "em_dia" | "atrasada" | "bloqueada" | "manual";

export interface AssinaturaClinica {
  tipoAcesso: "gratuito" | "pago" | string;
  ciclo: CicloCobranca;
  plano: { codigo: CodigoPlano; nome: string };
  situacao: SituacaoAssinatura;
  /** Fim do teste ou do período pago. */
  venceEm: string | null;
  /** Quando o login para, se nada for pago. */
  bloqueiaEm: string | null;
  podePagar: boolean;
  pagamentoDisponivel: boolean;
}

export interface PlanoComPreco {
  codigo: CodigoPlano;
  nome: string;
  precoMensal: number;
  precoAnual: number;
  limiteUsuarios: number | null;
  limiteUnidades: number | null;
}

/** Devolvido pelo login quando a clínica está bloqueada por cobrança. */
export interface BloqueioCobranca {
  codigo: "TESTE_ENCERRADO" | "ASSINATURA_VENCIDA";
  pagamentoToken?: string;
  planoAtual?: CodigoPlano;
  cicloAtual?: CicloCobranca;
}

export async function obterAssinaturaApi() {
  return api.get<AssinaturaClinica>("/assinatura/clinica");
}

export async function listarPlanosComPrecoApi() {
  const data = await api.get<{ planos: PlanoComPreco[] }>("/planos");
  return data.planos.filter((plano) => plano.precoMensal > 0);
}

/** Abre o Mercado Pago. Sem sessão (login bloqueado), usa o token curto de pagamento. */
export async function iniciarPagamentoApi(plano: CodigoPlano, ciclo: CicloCobranca, tokenPagamento?: string) {
  return api.post<{ pedidoId: string; checkoutUrl: string }>(
    "/assinatura/clinica/checkout",
    { plano, ciclo },
    tokenPagamento ? { headers: { Authorization: `Bearer ${tokenPagamento}` } } : undefined,
  );
}

export async function sincronizarPagamentoApi(pedidoId: string) {
  return api.post<{ status: "pago" | "pendente" | "revisao" | "estornado"; mensagem: string; pagoAte: string | null }>(
    "/assinatura/clinica/sincronizar",
    { pedidoId },
  );
}

export function lerBloqueioCobranca(detalhes: unknown): BloqueioCobranca | null {
  const bruto = detalhes as Partial<BloqueioCobranca> | null | undefined;
  if (bruto?.codigo !== "TESTE_ENCERRADO" && bruto?.codigo !== "ASSINATURA_VENCIDA") return null;
  return {
    codigo: bruto.codigo,
    pagamentoToken: typeof bruto.pagamentoToken === "string" ? bruto.pagamentoToken : undefined,
    planoAtual: bruto.planoAtual,
    cicloAtual: bruto.cicloAtual === "anual" ? "anual" : "mensal",
  };
}
