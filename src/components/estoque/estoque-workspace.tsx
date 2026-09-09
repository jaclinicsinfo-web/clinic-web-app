"use client";

import * as React from "react";
import { format } from "date-fns";
import { AlertTriangle, Boxes, PackageMinus, Wallet } from "lucide-react";

import { EstoqueAlerta } from "@/components/estoque/estoque-alerta";
import { EstoqueTabs } from "@/components/estoque/estoque-tabs";
import { RegistrarMovimentacaoButton } from "@/components/estoque/registrar-movimentacao-button";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { Skeleton } from "@/components/ui/skeleton";
import { useSessaoStore } from "@/hooks/use-sessao";
import { ApiError } from "@/lib/api";
import { formatCurrency } from "@/lib/format";
import { temPermissao } from "@/lib/permissoes";
import { obterEstoqueApi, type EstoquePayload } from "@/services/estoque";
import type { MovimentacaoEstoque, Produto } from "@/types";

function recalcular(produtos: Produto[], movimentacoes: MovimentacaoEstoque[]): Pick<EstoquePayload, "resumo" | "consumo"> {
  const ativos = produtos.filter((item) => item.ativo !== false);
  const abaixo = ativos.filter((item) => item.quantidadeAtual < item.estoqueMinimo);
  const saidas = movimentacoes.filter((item) => item.tipo === "saida");
  const consumoMap = new Map<string, { produtoId: string; produtoNome: string; quantidade: number; ocorrencias: number }>();
  for (const saida of saidas) {
    const atual = consumoMap.get(saida.produtoId) ?? {
      produtoId: saida.produtoId,
      produtoNome: saida.produtoNome,
      quantidade: 0,
      ocorrencias: 0,
    };
    atual.quantidade += saida.quantidade;
    atual.ocorrencias += 1;
    consumoMap.set(saida.produtoId, atual);
  }

  return {
    resumo: {
      totalItens: ativos.length,
      valorEmEstoque: ativos.reduce((total, item) => total + item.quantidadeAtual * item.custoUnitario, 0),
      abaixoDoMinimo: abaixo.length,
      saidasNoPeriodo: saidas.length,
    },
    consumo: [...consumoMap.values()].sort((a, b) => b.quantidade - a.quantidade),
  };
}

export function EstoqueWorkspace() {
  const permissoes = useSessaoStore((state) => state.sessao?.permissoes);
  const podeCriar = temPermissao(permissoes, "estoque", "criar");
  const podeEditar = temPermissao(permissoes, "estoque", "editar");
  const podeDesativar = temPermissao(permissoes, "estoque", "excluir");

  const [dados, setDados] = React.useState<EstoquePayload | null>(null);
  const [erro, setErro] = React.useState<string | null>(null);
  const dataPadrao = format(new Date(), "yyyy-MM-dd");

  React.useEffect(() => {
    let ativo = true;
    obterEstoqueApi()
      .then((payload) => {
        if (ativo) setDados(payload);
      })
      .catch((error) => {
        if (ativo) setErro(error instanceof ApiError ? error.message : "Não foi possível carregar o estoque.");
      });
    return () => {
      ativo = false;
    };
  }, []);

  function aplicarProdutos(produtos: Produto[], movimentacoes: MovimentacaoEstoque[]) {
    setDados((atual) => {
      if (!atual) return atual;
      return { ...atual, produtos, movimentacoes, ...recalcular(produtos, movimentacoes) };
    });
  }

  if (erro) {
    return <EmptyState title="Não foi possível carregar" description={erro} />;
  }

  if (!dados) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const abaixoDoMinimo = dados.produtos.filter(
    (produto) => produto.ativo !== false && produto.quantidadeAtual < produto.estoqueMinimo,
  );
  const produtosAtivos = dados.produtos.filter((produto) => produto.ativo !== false);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Estoque"
        description="Insumos, saldos e movimentações de entrada e saída da clínica."
        actions={
          podeCriar ? (
            <RegistrarMovimentacaoButton
              produtos={produtosAtivos}
              procedimentos={dados.procedimentos}
              dataPadrao={dataPadrao}
              onRegistrada={({ produto, movimentacao }) => {
                const produtos = dados.produtos.map((item) => (item.id === produto.id ? produto : item));
                aplicarProdutos(produtos, [movimentacao, ...dados.movimentacoes]);
              }}
            />
          ) : undefined
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Itens cadastrados"
          value={String(dados.resumo.totalItens)}
          icon={Boxes}
          hint={`${dados.categorias.length} categorias de insumos`}
        />
        <StatCard
          label="Valor em estoque"
          value={formatCurrency(dados.resumo.valorEmEstoque)}
          icon={Wallet}
          hint="Saldo atual avaliado pelo custo unitário"
        />
        <StatCard
          label="Abaixo do mínimo"
          value={String(dados.resumo.abaixoDoMinimo)}
          icon={AlertTriangle}
          hint="Itens que precisam de reposição"
        />
        <StatCard
          label="Saídas registradas"
          value={String(dados.resumo.saidasNoPeriodo)}
          icon={PackageMinus}
          hint="Consumo lançado no histórico de movimentações"
        />
      </div>

      <EstoqueAlerta produtos={abaixoDoMinimo} />

      <EstoqueTabs
        produtos={dados.produtos}
        movimentacoes={dados.movimentacoes}
        consumo={dados.consumo}
        categorias={dados.categorias}
        unidadesMedida={dados.unidadesMedida}
        procedimentos={dados.procedimentos}
        dataPadrao={dataPadrao}
        podeCriar={podeCriar}
        podeEditar={podeEditar}
        podeDesativar={podeDesativar}
        onProdutoSalvo={(produto) => aplicarProdutos([...dados.produtos, produto], dados.movimentacoes)}
        onProdutoAtualizado={(produto) =>
          aplicarProdutos(
            dados.produtos.map((item) => (item.id === produto.id ? produto : item)),
            dados.movimentacoes,
          )
        }
        onMovimentacao={(produto, movimentacao) => {
          aplicarProdutos(
            dados.produtos.map((item) => (item.id === produto.id ? produto : item)),
            [movimentacao, ...dados.movimentacoes],
          );
        }}
      />
    </div>
  );
}
