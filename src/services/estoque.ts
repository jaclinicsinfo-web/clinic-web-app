import { api } from "@/lib/api";
import type { ConsumoEstoque, MovimentacaoEstoque, Produto } from "@/types";

export interface EstoqueResumo {
  totalItens: number;
  valorEmEstoque: number;
  abaixoDoMinimo: number;
  saidasNoPeriodo: number;
}

export interface EstoquePayload {
  produtos: Produto[];
  movimentacoes: MovimentacaoEstoque[];
  categorias: string[];
  unidadesMedida: string[];
  procedimentos: { id: string; nome: string }[];
  resumo: EstoqueResumo;
  consumo: ConsumoEstoque[];
}

export interface ProdutoPayload {
  nome: string;
  categoria: string;
  unidadeMedida: string;
  quantidadeAtual?: number;
  estoqueMinimo: number;
  custoUnitario: number;
  fornecedor: string;
}

export interface MovimentacaoPayload {
  produtoId: string;
  tipo: "entrada" | "saida";
  quantidade: number;
  data: string;
  motivo: string;
  procedimentoId?: string | null;
}

export async function obterEstoqueApi() {
  return api.get<EstoquePayload>("/estoque");
}

export async function criarProdutoApi(payload: ProdutoPayload) {
  const data = await api.post<{ produto: Produto }>("/estoque/produtos", payload);
  return data.produto;
}

export async function atualizarProdutoApi(id: string, payload: Omit<ProdutoPayload, "quantidadeAtual">) {
  const data = await api.patch<{ produto: Produto }>(`/estoque/produtos/${id}`, payload);
  return data.produto;
}

export async function alternarProdutoApi(id: string) {
  const data = await api.patch<{ produto: Produto }>(`/estoque/produtos/${id}/ativo`);
  return data.produto;
}

export async function registrarMovimentacaoApi(payload: MovimentacaoPayload) {
  return api.post<{ movimentacao: MovimentacaoEstoque; produto: Produto }>("/estoque/movimentacoes", payload);
}
