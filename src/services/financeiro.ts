import { api } from "@/lib/api";
import type {
  Cobranca,
  Comissao,
  Despesa,
  FluxoCaixaPonto,
  FormaPagamento,
  LoteConvenio,
} from "@/types";

export interface FormaPagamentoCadastro {
  id: string;
  codigo: FormaPagamento;
  nome: string;
  taxa: number;
  ativo: boolean;
}

export interface ResumoContasAReceber {
  totalEmAberto: number;
  totalAtrasado: number;
  recebidoNoMes: number;
  vencendo7Dias: number;
  quantidadeAtrasada: number;
  quantidadeEmAberto: number;
  quantidadeVencendo7Dias: number;
}

export interface ResumoContasAPagar {
  totalAPagar: number;
  totalVencido: number;
  pagoNoMes: number;
  vencendo7Dias: number;
  quantidadeVencida: number;
  quantidadeAPagar: number;
  quantidadeVencendo7Dias: number;
}

export interface ResumoFluxoCaixa {
  entradasMes: number;
  saidasMes: number;
  saldoMes: number;
  variacaoEntradas: number;
  variacaoSaidas: number;
  variacaoSaldo: number;
}

export interface ResumoLotes {
  valorApresentado: number;
  valorGlosado: number;
  valorRecebido: number;
  taxaGlosa: number;
  lotesAbertos: number;
  lotesAguardando: number;
}

export interface ResumoComissoes {
  competencia: string;
  totalPrevisto: number;
  aprovadas: number;
  pagas: number;
  profissionaisComissionados: number;
}

export interface LinhaDre {
  categoria: string;
  valor: number;
}

export interface PacienteInadimplente {
  paciente: { id: string; nome: string; telefone: string };
  valorEmAberto: number;
}

export interface VisaoGeralFinanceiro {
  receber: ResumoContasAReceber;
  pagar: ResumoContasAPagar;
  fluxo: ResumoFluxoCaixa;
  convenios: ResumoLotes;
  comissoes: ResumoComissoes;
  dre: { receitas: LinhaDre[]; despesas: LinhaDre[] };
  fluxoDiario: FluxoCaixaPonto[];
  fluxoMensal: FluxoCaixaPonto[];
  inadimplentes: PacienteInadimplente[];
  somenteProprios?: boolean;
}

export interface PagamentoPayload {
  valor?: number;
  formaPagamento: FormaPagamento;
  data: string;
  observacoes?: string | null;
}

export interface CobrancaPayload {
  pacienteId: string;
  agendamentoId?: string | null;
  descricao: string;
  valor: number;
  vencimento: string;
  convenioId?: string | null;
  formaPagamento?: FormaPagamento | null;
  observacoes?: string | null;
  parcelas?: number;
}

export interface DespesaPayload {
  descricao: string;
  categoria: string;
  fornecedor: string;
  valor: number;
  vencimento: string;
  recorrente: boolean;
  formaPagamento?: FormaPagamento | null;
  observacoes?: string | null;
}

export async function obterVisaoGeralApi() {
  return api.get<VisaoGeralFinanceiro>("/financeiro");
}

export async function listarCobrancasApi(pacienteId?: string) {
  return api.get<{
    cobrancas: Cobranca[];
    resumo: ResumoContasAReceber;
    convenios: { id: string; nome: string }[];
    pacientes: { id: string; nome: string }[];
    formasPagamento: FormaPagamentoCadastro[];
  }>("/financeiro/cobrancas", { params: { pacienteId } });
}

export async function criarCobrancaApi(payload: CobrancaPayload) {
  const data = await api.post<{ cobranca: Cobranca }>("/financeiro/cobrancas", payload);
  return data.cobranca;
}

export async function pagarCobrancaApi(id: string, payload: PagamentoPayload) {
  const data = await api.patch<{ cobranca: Cobranca }>(`/financeiro/cobrancas/${id}/pagar`, payload);
  return data.cobranca;
}

export async function parcelarCobrancaApi(id: string, quantidade: number, formaPagamento?: FormaPagamento) {
  const data = await api.patch<{ cobranca: Cobranca }>(`/financeiro/cobrancas/${id}/parcelar`, {
    quantidade,
    formaPagamento,
  });
  return data.cobranca;
}

export async function cancelarCobrancaApi(id: string) {
  const data = await api.patch<{ cobranca: Cobranca }>(`/financeiro/cobrancas/${id}/cancelar`);
  return data.cobranca;
}

export async function pagarParcelaApi(id: string, numero: number, payload: PagamentoPayload) {
  const data = await api.patch<{ cobranca: Cobranca }>(
    `/financeiro/cobrancas/${id}/parcelas/${numero}/pagar`,
    payload,
  );
  return data.cobranca;
}

export async function listarDespesasApi() {
  return api.get<{
    despesas: Despesa[];
    resumo: ResumoContasAPagar;
    categorias: string[];
    formasPagamento: FormaPagamentoCadastro[];
  }>("/financeiro/despesas");
}

export async function criarDespesaApi(payload: DespesaPayload) {
  const data = await api.post<{ despesa: Despesa }>("/financeiro/despesas", payload);
  return data.despesa;
}

export async function pagarDespesaApi(id: string, payload: PagamentoPayload) {
  const data = await api.patch<{ despesa: Despesa }>(`/financeiro/despesas/${id}/pagar`, payload);
  return data.despesa;
}

export async function excluirDespesaApi(id: string) {
  await api.delete(`/financeiro/despesas/${id}`);
}

export async function obterFluxoCaixaApi() {
  return api.get<{
    resumo: ResumoFluxoCaixa;
    diario: FluxoCaixaPonto[];
    mensal: FluxoCaixaPonto[];
    dre: { receitas: LinhaDre[]; despesas: LinhaDre[] };
  }>("/financeiro/fluxo-caixa");
}

export async function listarLotesApi() {
  return api.get<{
    lotes: LoteConvenio[];
    resumo: ResumoLotes;
    convenios: { id: string; nome: string }[];
  }>("/financeiro/lotes");
}

export async function criarLoteApi(convenioId: string, competencia: string) {
  const data = await api.post<{ lote: LoteConvenio }>("/financeiro/lotes", { convenioId, competencia });
  return data.lote;
}

export async function enviarLoteApi(id: string) {
  const data = await api.patch<{ lote: LoteConvenio }>(`/financeiro/lotes/${id}/enviar`);
  return data.lote;
}

export async function reconciliarLoteApi(id: string, valorGlosado: number, valorRecebido: number) {
  const data = await api.patch<{ lote: LoteConvenio }>(`/financeiro/lotes/${id}/reconciliar`, {
    valorGlosado,
    valorRecebido,
  });
  return data.lote;
}

export async function listarComissoesApi(params?: { profissionalId?: string; competencia?: string }) {
  return api.get<{
    comissoes: Comissao[];
    resumo: ResumoComissoes;
    competencias: string[];
  }>("/financeiro/comissoes", { params });
}

export async function calcularComissoesApi(competencia?: string) {
  return api.post<{
    comissoes: Comissao[];
    resumo: ResumoComissoes;
    competencias: string[];
  }>("/financeiro/comissoes/calcular", { competencia });
}

export async function fecharFolhaApi(competencia: string) {
  return api.post<{
    comissoes: Comissao[];
    resumo: ResumoComissoes;
    competencias: string[];
  }>("/financeiro/comissoes/fechar-folha", { competencia });
}

export async function aprovarComissaoApi(id: string) {
  const data = await api.patch<{ comissao: Comissao }>(`/financeiro/comissoes/${id}/aprovar`);
  return data.comissao;
}

export async function pagarComissaoApi(id: string, payload: PagamentoPayload) {
  const data = await api.patch<{ comissao: Comissao }>(`/financeiro/comissoes/${id}/pagar`, payload);
  return data.comissao;
}

export async function listarFormasPagamentoApi() {
  return api.get<{ formas: FormaPagamentoCadastro[] }>("/formas-pagamento");
}

export async function salvarFormasPagamentoApi(formas: Omit<FormaPagamentoCadastro, "id">[]) {
  const data = await api.put<{ formas: FormaPagamentoCadastro[] }>("/formas-pagamento", { formas });
  return data.formas;
}
