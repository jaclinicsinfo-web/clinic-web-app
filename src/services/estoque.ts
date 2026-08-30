import { categoriasProduto, movimentacoesEstoque, produtos } from "./mock/estoque";

export { categoriasProduto };

export function listProdutos() {
  return produtos;
}

export function listMovimentacoes() {
  return [...movimentacoesEstoque].sort((a, b) => b.data.localeCompare(a.data));
}

export function getProdutosAbaixoDoMinimo() {
  return produtos.filter((produto) => produto.quantidadeAtual < produto.estoqueMinimo);
}

export function getResumoEstoque() {
  const abaixoDoMinimo = getProdutosAbaixoDoMinimo();

  return {
    totalItens: produtos.length,
    valorEmEstoque: produtos.reduce((total, produto) => total + produto.quantidadeAtual * produto.custoUnitario, 0),
    abaixoDoMinimo: abaixoDoMinimo.length,
    saidasNoPeriodo: movimentacoesEstoque.filter((movimentacao) => movimentacao.tipo === "saida").length,
  };
}
