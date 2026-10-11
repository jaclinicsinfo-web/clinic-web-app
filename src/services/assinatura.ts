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
  /** Downgrade que passa a valer no próximo vencimento. */
  trocaAgendada: TrocaAgendada | null;
  automatica: CobrancaAutomatica | null;
  /** Mercado Pago configurado e usuário administrador. */
  automaticaDisponivel: boolean;
}

export interface TrocaAgendada {
  plano: { codigo: CodigoPlano; nome: string };
  ciclo: CicloCobranca;
  aPartirDe: string;
}

export interface CobrancaAutomatica {
  status: "pendente" | "ativa" | "pausada";
  plano: { codigo: CodigoPlano; nome: string };
  ciclo: CicloCobranca;
  valor: number;
  cartaoFinal: string | null;
  proximaCobrancaEm: string | null;
  /** Página do Mercado Pago para autorizar o cartão. */
  linkAutorizacao: string | null;
  /** Última cobrança recusada. Some quando uma cobrança seguinte é aprovada. */
  falhou: { em: string; motivo: string | null } | null;
}

export interface PagamentoAssinatura {
  id: string;
  numeroRecibo: number | null;
  /** Quando foi pago. */
  data: string;
  /** Texto pronto para a tela. */
  descricao: string;
  tipo: "nova_clinica" | "clinica_existente" | "troca_plano" | "recorrente";
  plano: { codigo: string; nome: string };
  ciclo: CicloCobranca;
  valor: number;
  /** Com os juros do parcelamento, se houver. */
  totalPago: number | null;
  meio: "pix" | "cartao_credito" | string | null;
  parcelas: number | null;
  periodoInicio: string | null;
  periodoFim: string | null;
  status: "pago" | "estornado";
  estornadoEm: string | null;
  pagamentoId: string | null;
}

export interface SimulacaoTroca {
  tipo: "upgrade" | "troca_ciclo" | "downgrade_agendado" | "sem_custo" | "periodo_cheio" | "renovacao";
  /** Cobrado agora (0 quando nada é cobrado). */
  valor: number;
  credito: number | null;
  venceEm: string | null;
  aPartirDe: string | null;
  /** Resumo pronto para a tela. */
  mensagem: string;
  /** Downgrade: a clínica tem mais usuários ou unidades que o plano novo permite. */
  avisoLimite: string | null;
  /** A troca não pode ser feita agora. */
  bloqueio: string | null;
}

export type ResultadoTroca =
  | { acao: "checkout"; pedidoId: string; checkoutUrl: string }
  | { acao: "aplicada"; mensagem: string }
  | { acao: "agendada"; aPartirDe: string; mensagem: string; avisoLimite: string | null };

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

export async function listarPagamentosApi() {
  const data = await api.get<{ pagamentos: PagamentoAssinatura[] }>("/assinatura/clinica/pagamentos");
  return data.pagamentos;
}

/** HTML do recibo, pronto para imprimir. */
export async function obterReciboApi(id: string) {
  const arquivo = await api.blob(`/assinatura/clinica/pagamentos/${encodeURIComponent(id)}/recibo`);
  return arquivo.text();
}

export async function simularTrocaApi(plano: CodigoPlano, ciclo: CicloCobranca) {
  return api.get<SimulacaoTroca>("/assinatura/clinica/simular-troca", { params: { plano, ciclo } });
}

export async function trocarPlanoApi(plano: CodigoPlano, ciclo: CicloCobranca) {
  return api.post<ResultadoTroca>("/assinatura/clinica/trocar-plano", { plano, ciclo });
}

export async function cancelarTrocaAgendadaApi() {
  return api.delete<{ mensagem: string }>("/assinatura/clinica/troca-agendada");
}

/** Cria a cobrança automática e devolve o link do Mercado Pago para autorizar o cartão. */
export async function ativarAutomaticaApi() {
  return api.post<{ linkAutorizacao: string }>("/assinatura/clinica/automatica");
}

export async function desativarAutomaticaApi() {
  return api.delete<{ mensagem: string }>("/assinatura/clinica/automatica");
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
